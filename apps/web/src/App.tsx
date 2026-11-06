import { useState } from "react";
import { motion } from "motion/react";
import { Achievements } from "@/components/achievements";
import { History } from "@/components/history";
import { IdeaList } from "@/components/idea-list";
import { NearbyTeaser } from "@/components/nearby-teaser";
import { PlayerCard } from "@/components/player-card";
import { SlotMachine } from "@/components/slot-machine";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MEALS, MEAL_META, mealForNow, type Meal } from "@/data/meals";

function GoogleSignIn() {
  return (
    <Tooltip>
      <TooltipTrigger render={<span tabIndex={0} />}>
        <Button variant="outline" disabled className="h-10 border-2 bg-card font-semibold">
          <span className="text-base font-black text-[#4285F4]">G</span> Sign in with Google
        </Button>
      </TooltipTrigger>
      <TooltipContent>Coming soon: sync your stats across devices.</TooltipContent>
    </Tooltip>
  );
}

export function App() {
  const [meal, setMeal] = useState<Meal>(() => mealForNow());

  return (
    <TooltipProvider>
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <motion.h1
              initial={{ rotate: -4, scale: 0.9, opacity: 0 }}
              animate={{ rotate: -2, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="text-4xl font-black tracking-tight sm:text-5xl"
            >
              <span className="sticker inline-block -rotate-1 rounded-xl bg-primary px-3 py-1 text-primary-foreground">
                Grub
              </span>{" "}
              Roulette 🎰
            </motion.h1>
            <p className="text-sm text-muted-foreground">Can't decide what to eat? Let fate (and a very serious robot) decide.</p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <GoogleSignIn />
            <PlayerCard />
          </div>
        </header>

        <Tabs value={meal} onValueChange={(v) => setMeal(v as Meal)} className="gap-1">
          <TabsList className="sticker h-auto! w-full rounded-2xl bg-card p-1.5 sm:w-fit">
            {MEALS.map((m) => (
              <TabsTrigger
                key={m}
                value={m}
                className="h-10 rounded-xl px-4 text-base font-bold data-active:bg-accent! data-active:shadow-sticker-sm!"
              >
                {MEAL_META[m].emoji} {MEAL_META[m].label}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="px-1 pt-1 text-sm font-medium text-muted-foreground">{MEAL_META[meal].tagline}</p>
        </Tabs>

        <main className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <IdeaList meal={meal} />
          <SlotMachine key={meal} meal={meal} />
        </main>

        <section className="grid gap-6 md:grid-cols-3">
          <Achievements />
          <History />
          <NearbyTeaser />
        </section>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Made with 🌶️ and questionable decision-making.
        </footer>
      </div>
      <Toaster position="bottom-center" richColors={false} />
    </TooltipProvider>
  );
}
