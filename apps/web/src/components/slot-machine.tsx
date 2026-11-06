import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Check, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FoodConfetti } from "@/components/food-confetti";
import { useFoodConfetti } from "@/hooks/use-food-confetti";
import { MEAL_META, REEL_DECOYS, type Meal } from "@/data/meals";
import { chaosIdea, pickIdea, type PickResult } from "@/lib/api";
import { useGame, type Reward } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "idle" | "spinning" | "result" | "accepted";

const SPIN_MS = 2200;
const OFFLINE_QUIPS = ["The robots are napping, so I picked by hand.", "Offline, but still opinionated."];

function randomOf<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

async function getPick(meal: Meal, ideas: string[], exclude?: string): Promise<PickResult> {
  const pool = exclude && ideas.length > 1 ? ideas.filter((i) => i !== exclude) : ideas;
  try {
    return pool.length > 0 ? await pickIdea(meal, pool) : await chaosIdea(meal, exclude ? [exclude] : []);
  } catch {
    const fallback = pool.length > 0 ? pool : REEL_DECOYS;
    const winner = randomOf(fallback);
    return { winner, index: -1, quip: randomOf(OFFLINE_QUIPS), source: pool.length > 0 ? "user" : "chaos" };
  }
}

function celebrate(reward: Reward, label: string) {
  toast.success(`${label} +${reward.xp} XP`);
  for (const a of reward.unlocked) {
    toast(`🏆 Achievement unlocked: ${a.emoji} ${a.name}`, { description: a.description, duration: 5000 });
  }
}

export function SlotMachine({ meal }: { meal: Meal }) {
  const ideas = useGame((s) => s.ideas[meal]);
  const vetoesLeft = useGame((s) => s.vetoesLeft());
  const recordSpin = useGame((s) => s.recordSpin);
  const spendVeto = useGame((s) => s.spendVeto);
  const acceptPick = useGame((s) => s.acceptPick);

  const [phase, setPhase] = useState<Phase>("idle");
  const [reel, setReel] = useState<string>(`${MEAL_META[meal].emoji} ???`);
  const [result, setResult] = useState<PickResult | null>(null);
  const { pieces, fire } = useFoodConfetti();
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const chaos = ideas.length === 0;

  async function spin(exclude?: string) {
    if (phase === "spinning") return;
    setPhase("spinning");
    setResult(null);

    const reelItems = chaos ? REEL_DECOYS : ideas;
    const pending = getPick(meal, ideas, exclude);
    const started = performance.now();

    await new Promise<void>((resolve) => {
      let i = Math.floor(Math.random() * reelItems.length);
      const tick = () => {
        if (!alive.current) return resolve();
        const elapsed = performance.now() - started;
        if (elapsed >= SPIN_MS) return resolve();
        i = (i + 1) % reelItems.length;
        setReel(reelItems[i]!);
        const t = elapsed / SPIN_MS;
        window.setTimeout(tick, 45 + t * t * 260);
      };
      tick();
    });

    const pick = await pending;
    if (!alive.current) return;

    setReel(pick.idea ? `${pick.idea.emoji} ${pick.winner}` : pick.winner);
    setResult(pick);
    setPhase("result");
    fire();
    celebrate(recordSpin(pick.source), pick.source === "chaos" ? "Chaos spin!" : "Spin!");
  }

  function veto() {
    if (!result) return;
    if (!spendVeto()) {
      toast.error("Out of vetoes! The machine has spoken. 🔨");
      return;
    }
    toast(`Vetoed "${result.winner}". ${vetoesLeft - 1} veto${vetoesLeft - 1 === 1 ? "" : "es"} left today.`);
    void spin(result.winner);
  }

  function accept() {
    if (!result) return;
    setPhase("accepted");
    fire(60);
    celebrate(
      acceptPick({
        name: result.winner,
        meal,
        emoji: result.idea?.emoji,
        cuisine: result.idea?.cuisine,
        source: result.source,
      }),
      "Bon appétit!",
    );
  }

  return (
    <Card className="sticker relative gap-0 overflow-visible bg-accent py-0">
      <FoodConfetti pieces={pieces} />
      <CardContent className="flex flex-col items-center gap-5 p-6">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-bold tracking-widest uppercase">The Grub-O-Matic 3000</span>
          <span className="flex gap-1.5" aria-hidden>
            {["bg-tomato", "bg-mint", "bg-grape"].map((c, i) => (
              <motion.span
                key={c}
                className={cn("size-2.5 rounded-full border border-ink", c)}
                animate={phase === "spinning" ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
                transition={{ repeat: phase === "spinning" ? Infinity : 0, duration: 0.5, delay: i * 0.15 }}
              />
            ))}
          </span>
        </div>

        <div
          className="sticker relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl bg-card px-4"
          aria-live="polite"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-ink/15 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-ink/15 to-transparent" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={reel}
              initial={{ y: -48, opacity: 0, filter: phase === "spinning" ? "blur(3px)" : "blur(0px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: phase === "result" ? [1, 1.15, 1] : 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ duration: phase === "spinning" ? 0.08 : 0.35 }}
              className="text-center text-2xl font-black tracking-tight sm:text-3xl"
            >
              {reel}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {result && phase !== "spinning" ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center gap-4 text-center"
            >
              <p className="text-sm font-medium italic">“{result.quip}”</p>
              {result.idea && (
                <p className="text-xs text-muted-foreground">
                  Cuisine: <span className="font-semibold text-foreground">{result.idea.cuisine}</span>
                </p>
              )}
              {phase === "accepted" ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-lg font-black">Locked in. Go eat! 🏃‍♂️💨</p>
                  <Button variant="outline" className="sticker sticker-press h-10 bg-card px-4" onClick={() => void spin()}>
                    <Dices /> Spin again anyway
                  </Button>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button className="sticker sticker-press h-12 flex-1 text-base font-bold" onClick={accept}>
                    <Check /> Let's eat!
                  </Button>
                  <Button
                    variant="outline"
                    className="sticker sticker-press h-12 flex-1 bg-card text-base font-bold"
                    onClick={veto}
                    disabled={vetoesLeft === 0}
                  >
                    <RotateCcw /> Veto ({vetoesLeft} left)
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.button
                type="button"
                onClick={() => void spin()}
                disabled={phase === "spinning"}
                whileHover={{ rotate: [0, -3, 3, 0], transition: { duration: 0.4 } }}
                whileTap={{ scale: 0.92 }}
                className="sticker flex size-36 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-80"
              >
                <motion.span
                  animate={phase === "spinning" ? { rotate: 360 } : { rotate: 0 }}
                  transition={phase === "spinning" ? { repeat: Infinity, duration: 0.6, ease: "linear" } : {}}
                  className="text-4xl"
                >
                  🎰
                </motion.span>
                <span className="text-xl font-black tracking-wider">{phase === "spinning" ? "..." : "SPIN!"}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground">
          {chaos
            ? "🌀 Chaos Mode: no contenders, so the machine picks from its secret stash."
            : `${ideas.length} contender${ideas.length === 1 ? "" : "s"} in the ring.`}
        </p>
      </CardContent>
    </Card>
  );
}
