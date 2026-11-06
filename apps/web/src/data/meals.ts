export const MEALS = ["breakfast", "lunch", "dinner"] as const;
export type Meal = (typeof MEALS)[number];

export const MEAL_META: Record<Meal, { label: string; emoji: string; tagline: string }> = {
  breakfast: { label: "Breakfast", emoji: "☀️", tagline: "Rise and dine." },
  lunch: { label: "Lunch", emoji: "🌮", tagline: "The midday munchies have arrived." },
  dinner: { label: "Dinner", emoji: "🌙", tagline: "Feast mode: activated." },
};

export const QUICK_ADDS: Record<Meal, string[]> = {
  breakfast: ["Pancakes", "Breakfast burrito", "Bagels", "Chilaquiles", "Smoothie bowl"],
  lunch: ["Tacos", "Ramen", "Poke", "Banh mi", "Burgers", "Salad (lol)"],
  dinner: ["Pizza", "Sushi", "Thai", "Korean BBQ", "Pasta", "Indian"],
};

export const REEL_DECOYS = [
  "🍕 Pizza",
  "🌮 Tacos",
  "🍣 Sushi",
  "🍜 Ramen",
  "🥞 Pancakes",
  "🍔 Burgers",
  "🥗 Sad desk salad",
  "🍛 Curry",
  "🥟 Dumplings",
  "🧇 Waffles",
  "🌯 Burrito",
  "🍝 Spaghetti",
  "🥡 Mystery takeout",
  "🥐 Croissant",
];

export function mealForNow(date = new Date()): Meal {
  const hour = date.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  return "dinner";
}
