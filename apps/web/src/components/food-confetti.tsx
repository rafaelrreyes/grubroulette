import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ConfettiPiece } from "@/hooks/use-food-confetti";

export function FoodConfetti({ pieces }: { pieces: ConfettiPiece[] }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-[45%] left-1/2 select-none"
            style={{ fontSize: p.size }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
            animate={{
              x: [0, p.x * 0.7, p.x],
              y: [0, p.y, p.y + 700],
              rotate: p.rotate,
              scale: 1,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.9, delay: p.delay, ease: "easeOut", times: [0, 0.35, 1] }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
