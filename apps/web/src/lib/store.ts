import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Meal } from "@/data/meals";
import {
  type Achievement,
  dayKey,
  type GameStats,
  isYesterday,
  newlyUnlocked,
  VETOES_PER_DAY,
  XP,
} from "@/lib/game";

export interface HistoryEntry {
  name: string;
  meal: Meal;
  emoji?: string;
  cuisine?: string;
  source: "user" | "chaos";
  at: number;
}

interface GameState extends GameStats {
  ideas: Record<Meal, string[]>;
  xp: number;
  achievements: Record<string, number>;
  history: HistoryEntry[];
  vetoDay: string;
  lastAcceptDay: string | null;
  lastSpinDay: string | null;

  addIdea: (meal: Meal, idea: string) => boolean;
  removeIdea: (meal: Meal, idea: string) => void;
  clearIdeas: (meal: Meal) => void;
  recordSpin: (source: "user" | "chaos") => Reward;
  spendVeto: () => boolean;
  vetoesLeft: () => number;
  acceptPick: (entry: Omit<HistoryEntry, "at">) => Reward;
  resetProgress: () => void;
}

export interface Reward {
  xp: number;
  unlocked: Achievement[];
}

const initialProgress = {
  ideas: { breakfast: [], lunch: [], dinner: [] } as Record<Meal, string[]>,
  xp: 0,
  achievements: {} as Record<string, number>,
  history: [] as HistoryEntry[],
  totalSpins: 0,
  totalAccepts: 0,
  chaosSpins: 0,
  streak: 0,
  vetoesUsedToday: 0,
  vetoDay: dayKey(),
  mealsAccepted: [] as Meal[],
  maxIdeas: 0,
  lastSpinHour: null as number | null,
  lastAcceptDay: null as string | null,
  lastSpinDay: null as string | null,
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      const unlock = (): Achievement[] => {
        const state = get();
        const fresh = newlyUnlocked(state, state.achievements);
        if (fresh.length > 0) {
          const now = Date.now();
          set({
            achievements: {
              ...state.achievements,
              ...Object.fromEntries(fresh.map((a) => [a.id, now])),
            },
          });
        }
        return fresh;
      };

      const rollVetoDay = () => {
        const today = dayKey();
        if (get().vetoDay !== today) set({ vetoDay: today, vetoesUsedToday: 0 });
      };

      return {
        ...initialProgress,

        addIdea: (meal, raw) => {
          const idea = raw.trim().slice(0, 80);
          const list = get().ideas[meal];
          if (!idea || list.some((i) => i.toLowerCase() === idea.toLowerCase())) return false;
          const next = [...list, idea];
          set((s) => ({ ideas: { ...s.ideas, [meal]: next }, maxIdeas: Math.max(s.maxIdeas, next.length) }));
          return true;
        },

        removeIdea: (meal, idea) =>
          set((s) => ({ ideas: { ...s.ideas, [meal]: s.ideas[meal].filter((i) => i !== idea) } })),

        clearIdeas: (meal) => set((s) => ({ ideas: { ...s.ideas, [meal]: [] } })),

        recordSpin: (source) => {
          const today = dayKey();
          const firstToday = get().lastSpinDay !== today;
          const xp = XP.spin + (source === "chaos" ? XP.chaosBonus : 0) + (firstToday ? XP.dailyBonus : 0);
          set((s) => ({
            xp: s.xp + xp,
            totalSpins: s.totalSpins + 1,
            chaosSpins: s.chaosSpins + (source === "chaos" ? 1 : 0),
            lastSpinHour: new Date().getHours(),
            lastSpinDay: today,
          }));
          return { xp, unlocked: unlock() };
        },

        vetoesLeft: () => {
          const s = get();
          return s.vetoDay === dayKey() ? Math.max(0, VETOES_PER_DAY - s.vetoesUsedToday) : VETOES_PER_DAY;
        },

        spendVeto: () => {
          rollVetoDay();
          if (get().vetoesLeft() <= 0) return false;
          set((s) => ({ vetoesUsedToday: s.vetoesUsedToday + 1 }));
          unlock();
          return true;
        },

        acceptPick: (entry) => {
          const today = dayKey();
          const { lastAcceptDay, streak } = get();
          const nextStreak =
            lastAcceptDay === today ? streak : lastAcceptDay && isYesterday(lastAcceptDay) ? streak + 1 : 1;
          set((s) => ({
            xp: s.xp + XP.accept,
            totalAccepts: s.totalAccepts + 1,
            streak: nextStreak,
            lastAcceptDay: today,
            mealsAccepted: s.mealsAccepted.includes(entry.meal)
              ? s.mealsAccepted
              : [...s.mealsAccepted, entry.meal],
            history: [{ ...entry, at: Date.now() }, ...s.history].slice(0, 25),
          }));
          return { xp: XP.accept, unlocked: unlock() };
        },

        resetProgress: () => set({ ...initialProgress, ideas: get().ideas, vetoDay: dayKey() }),
      };
    },
    {
      name: "grub-roulette",
      version: 1,
      partialize: (s) =>
        Object.fromEntries(
          Object.entries(s).filter(([, v]) => typeof v !== "function"),
        ) as Partial<GameState>,
    },
  ),
);
