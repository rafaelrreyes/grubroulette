import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ACHIEVEMENTS } from "@/lib/game";
import { useGame } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Achievements() {
  const unlocked = useGame((s) => s.achievements);
  const count = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;

  return (
    <Card className="sticker gap-4">
      <CardHeader>
        <CardTitle className="text-lg font-black">🏆 Trophy Shelf</CardTitle>
        <CardDescription>
          {count}/{ACHIEVEMENTS.length} unlocked. Gotta eat 'em all.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-5 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = Boolean(unlocked[a.id]);
          return (
            <Tooltip key={a.id}>
              <TooltipTrigger
                render={
                  <div
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl border-2 text-2xl transition-transform",
                      got ? "bg-accent shadow-sticker-sm hover:-rotate-6" : "border-dashed opacity-40 grayscale",
                    )}
                    aria-label={got ? a.name : "Locked achievement"}
                  />
                }
              >
                {got ? a.emoji : "❓"}
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-semibold">{got ? a.name : "???"}</span> · {a.description}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </CardContent>
    </Card>
  );
}
