import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MEAL_META } from "@/data/meals";
import { useGame } from "@/lib/store";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function ago(at: number) {
  const minutes = Math.round((at - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export function History() {
  const history = useGame((s) => s.history);

  return (
    <Card className="sticker gap-4">
      <CardHeader>
        <CardTitle className="text-lg font-black">📜 Hall of Meals</CardTitle>
        <CardDescription>Your recently accepted destinies.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Your legacy awaits. 🍽️</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.slice(0, 6).map((h) => (
              <li key={h.at} className="flex items-center justify-between gap-2 rounded-lg border-2 bg-muted/60 px-3 py-2 text-sm">
                <span className="truncate font-semibold">
                  {h.emoji ?? MEAL_META[h.meal].emoji} {h.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {MEAL_META[h.meal].label} · {ago(h.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
