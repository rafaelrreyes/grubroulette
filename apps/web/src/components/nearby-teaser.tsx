import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/lib/store";

export function NearbyTeaser() {
  const last = useGame((s) => s.history[0]);
  const cuisine = last?.cuisine ?? last?.name ?? "tacos";

  return (
    <Card className="gap-4 overflow-hidden sticker">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          🗺️ Nearby Spots <Badge className="border-2 border-ink bg-grape text-white">Coming soon</Badge>
        </CardTitle>
        <CardDescription>
          Soon we'll find the best {cuisine} near you, with Google Maps and Yelp ratings.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          aria-hidden
          className="relative h-32 overflow-hidden rounded-xl border-2 bg-mint/40"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 47%, var(--card) 47%, var(--card) 53%, transparent 53%), linear-gradient(90deg, transparent 47%, var(--card) 47%, var(--card) 53%, transparent 53%)",
            backgroundSize: "64px 64px",
          }}
        >
          {[
            ["22%", "30%"],
            ["58%", "55%"],
            ["78%", "22%"],
          ].map(([left, top], i) => (
            <MapPin
              key={`${left}-${top}`}
              className="absolute size-7 animate-bounce fill-tomato text-ink"
              style={{ left, top, animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-mustard text-ink" /> Ratings, distance, and "is it open?" — all
            coming.
          </span>
          <Button size="sm" variant="outline" disabled className="border-2">
            Find nearby
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
