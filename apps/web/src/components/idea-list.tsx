import { Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Meal, QUICK_ADDS } from "@/data/meals";
import { useGame } from "@/lib/store";

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

export function IdeaList({ meal }: { meal: Meal }) {
  const ideas = useGame((s) => s.ideas[meal]);
  const addIdea = useGame((s) => s.addIdea);
  const removeIdea = useGame((s) => s.removeIdea);
  const clearIdeas = useGame((s) => s.clearIdeas);
  const [draft, setDraft] = useState("");

  function add(value: string) {
    if (!value.trim()) return;
    if (!addIdea(meal, value)) {
      toast("That one's already in the ring! 🥊");
      return;
    }
    setDraft("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    add(draft);
  }

  const suggestions = QUICK_ADDS[meal].filter((s) => !ideas.some((i) => i.toLowerCase() === s.toLowerCase()));

  return (
    <Card className="gap-4 sticker">
      <CardHeader>
        <CardTitle className="text-lg font-black">🥊 The Contenders</CardTitle>
        <CardDescription>Toss in some ideas. Or don't, and embrace the chaos.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. That taco truck"
            maxLength={80}
            aria-label="Add a food idea"
            className="h-10 border-2 bg-card"
          />
          <Button
            type="submit"
            className="h-10 sticker-press px-3 font-bold sticker"
            disabled={!draft.trim()}
          >
            <Plus /> Add
          </Button>
        </form>

        <div className="flex min-h-16 flex-wrap content-start gap-2">
          <AnimatePresence initial={false}>
            {ideas.map((idea, i) => (
              <motion.span
                key={idea}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm font-semibold sticker ${ROTATIONS[i % ROTATIONS.length]}`}
              >
                {idea}
                <button
                  type="button"
                  onClick={() => removeIdea(meal, idea)}
                  className="rounded-full p-0.5 hover:bg-ink/10"
                  aria-label={`Remove ${idea}`}
                >
                  <X className="size-3.5" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          {ideas.length === 0 && (
            <p className="w-full rounded-xl border-2 border-dashed p-4 text-center text-sm text-muted-foreground">
              Empty ring. 🦗 Spin anyway and the machine will surprise you.
            </p>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Quick add
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="rounded-full border-2 border-dashed px-2.5 py-0.5 text-xs font-medium transition-colors hover:border-solid hover:bg-accent"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {ideas.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="self-end text-muted-foreground"
            onClick={() => clearIdeas(meal)}
          >
            <Trash2 /> Clear all
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
