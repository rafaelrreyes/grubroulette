import type { Meal } from "@/data/meals";

export const XP = {
  spin: 10,
  chaosBonus: 5,
  accept: 25,
  dailyBonus: 20,
} as const;

export const VETOES_PER_DAY = 3;

const TITLES = [
  "Hangry Hatchling",
  "Snack Apprentice",
  "Crumb Collector",
  "Noodle Knight",
  "Taco Tactician",
  "Burrito Baron",
  "Dumpling Duke",
  "Sultan of Sauce",
  "Grand Gastronaut",
  "Supreme Overlord of Lunch",
];

export function xpForLevel(level: number) {
  return 50 * level * (level - 1);
}

export function levelInfo(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)]!,
    progress: Math.round(((xp - floor) / (ceiling - floor)) * 100),
    toNext: ceiling - xp,
  };
}

export interface GameStats {
  totalSpins: number;
  totalAccepts: number;
  chaosSpins: number;
  streak: number;
  vetoesUsedToday: number;
  mealsAccepted: Meal[];
  maxIdeas: number;
  lastSpinHour: number | null;
}

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: (s: GameStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-spin",
    name: "Beginner's Luck",
    emoji: "🍀",
    description: "Spin the wheel for the first time.",
    unlocked: (s) => s.totalSpins >= 1,
  },
  {
    id: "spin-10",
    name: "Wheel Warrior",
    emoji: "🎡",
    description: "Spin 10 times.",
    unlocked: (s) => s.totalSpins >= 10,
  },
  {
    id: "spin-50",
    name: "Dizzy Diner",
    emoji: "😵‍💫",
    description: "Spin 50 times. Are you okay?",
    unlocked: (s) => s.totalSpins >= 50,
  },
  {
    id: "chaos",
    name: "Agent of Chaos",
    emoji: "🌀",
    description: "Let the machine decide with zero ideas.",
    unlocked: (s) => s.chaosSpins >= 1,
  },
  {
    id: "big-list",
    name: "Indecisive Royalty",
    emoji: "👑",
    description: "Put 10+ contenders in the ring.",
    unlocked: (s) => s.maxIdeas >= 10,
  },
  {
    id: "picky",
    name: "Picky Eater",
    emoji: "🙅",
    description: "Burn every veto in a single day.",
    unlocked: (s) => s.vetoesUsedToday >= VETOES_PER_DAY,
  },
  {
    id: "decisive",
    name: "Decisive Diner",
    emoji: "🫡",
    description: "Accept 10 picks.",
    unlocked: (s) => s.totalAccepts >= 10,
  },
  {
    id: "streak-3",
    name: "Habit Forming",
    emoji: "🔥",
    description: "Accept a pick 3 days in a row.",
    unlocked: (s) => s.streak >= 3,
  },
  {
    id: "triple",
    name: "Triple Threat",
    emoji: "🥇",
    description: "Accept a breakfast, lunch and dinner pick.",
    unlocked: (s) => new Set(s.mealsAccepted).size === 3,
  },
  {
    id: "night-owl",
    name: "Midnight Muncher",
    emoji: "🦉",
    description: "Spin between midnight and 4am.",
    unlocked: (s) => s.lastSpinHour !== null && s.lastSpinHour < 4,
  },
];

export function newlyUnlocked(stats: GameStats, already: Record<string, number>) {
  return ACHIEVEMENTS.filter((a) => !already[a.id] && a.unlocked(stats));
}

export function dayKey(date = new Date()) {
  return date.toLocaleDateString("en-CA");
}

export function isYesterday(key: string, today = new Date()) {
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return dayKey(y) === key;
}
