import { useCallback, useRef, useState } from "react";

const FOOD = ["🍕", "🌮", "🍣", "🍜", "🥞", "🍔", "🥟", "🧁", "🍩", "🥑", "🌶️", "🍤", "🧀", "🥐"];

export interface ConfettiPiece {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  size: number;
}

export function useFoodConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const fire = useCallback((count = 36) => {
    const burst = Date.now();
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: `${burst}-${i}`,
        emoji: FOOD[Math.floor(Math.random() * FOOD.length)]!,
        x: (Math.random() - 0.5) * Math.min(window.innerWidth, 900),
        y: -(Math.random() * 320 + 120),
        rotate: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.12,
        size: 18 + Math.random() * 22,
      })),
    );
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPieces([]), 2200);
  }, []);

  return { pieces, fire };
}
