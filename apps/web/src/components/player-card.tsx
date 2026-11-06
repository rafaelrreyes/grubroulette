import { Flame, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { levelInfo } from "@/lib/game";
import { useGame } from "@/lib/store";

export function PlayerCard() {
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streak);
  const vetoesLeft = useGame((s) => s.vetoesLeft());
  const { level, title, progress, toNext } = levelInfo(xp);

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-card p-4 sticker sm:w-80">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Lvl {level}</span>
        <span className="truncate text-sm font-black">{title}</span>
      </div>
      <Progress
        value={progress}
        aria-label="Level progress"
        className="[&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:border-2"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {xp} XP · {toNext} to go
        </span>
        <span className="flex items-center gap-3 font-semibold text-foreground">
          <span className="flex items-center gap-1" title="Daily streak">
            <Flame className="size-3.5 text-tomato" /> {streak}
          </span>
          <span className="flex items-center gap-1" title="Vetoes left today">
            <Shield className="size-3.5 text-grape" /> {vetoesLeft}
          </span>
        </span>
      </div>
    </div>
  );
}
