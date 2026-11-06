export const MEALS = ["breakfast", "lunch", "dinner"] as const;
export type Meal = (typeof MEALS)[number];

export interface Idea {
  name: string;
  cuisine: string;
  emoji: string;
}

export const IDEA_POOL: Record<Meal, Idea[]> = {
  breakfast: [
    { name: "Chilaquiles", cuisine: "Mexican", emoji: "🌶️" },
    { name: "Fluffy pancakes", cuisine: "American", emoji: "🥞" },
    { name: "Bagel & lox", cuisine: "Jewish deli", emoji: "🥯" },
    { name: "Shakshuka", cuisine: "Middle Eastern", emoji: "🍳" },
    { name: "Congee", cuisine: "Chinese", emoji: "🥣" },
    { name: "Breakfast burrito", cuisine: "Tex-Mex", emoji: "🌯" },
    { name: "Açaí bowl", cuisine: "Brazilian", emoji: "🫐" },
    { name: "Croissant & café au lait", cuisine: "French", emoji: "🥐" },
    { name: "Tamagoyaki set", cuisine: "Japanese", emoji: "🍱" },
    { name: "Masala dosa", cuisine: "South Indian", emoji: "🫓" },
  ],
  lunch: [
    { name: "Banh mi", cuisine: "Vietnamese", emoji: "🥖" },
    { name: "Poke bowl", cuisine: "Hawaiian", emoji: "🐟" },
    { name: "Street tacos", cuisine: "Mexican", emoji: "🌮" },
    { name: "Ramen", cuisine: "Japanese", emoji: "🍜" },
    { name: "Falafel wrap", cuisine: "Mediterranean", emoji: "🧆" },
    { name: "Smash burger", cuisine: "American", emoji: "🍔" },
    { name: "Bibimbap", cuisine: "Korean", emoji: "🍚" },
    { name: "Margherita pizza", cuisine: "Italian", emoji: "🍕" },
    { name: "Pad see ew", cuisine: "Thai", emoji: "🥢" },
    { name: "Cubano sandwich", cuisine: "Cuban", emoji: "🥪" },
    { name: "Chicken shawarma plate", cuisine: "Lebanese", emoji: "🍗" },
  ],
  dinner: [
    { name: "Korean BBQ", cuisine: "Korean", emoji: "🥩" },
    { name: "Butter chicken", cuisine: "Indian", emoji: "🍛" },
    { name: "Sushi omakase", cuisine: "Japanese", emoji: "🍣" },
    { name: "Cacio e pepe", cuisine: "Italian", emoji: "🍝" },
    { name: "Pho", cuisine: "Vietnamese", emoji: "🍲" },
    { name: "Birria tacos", cuisine: "Mexican", emoji: "🌮" },
    { name: "Peking duck", cuisine: "Chinese", emoji: "🦆" },
    { name: "Paella", cuisine: "Spanish", emoji: "🥘" },
    { name: "Hot pot", cuisine: "Sichuan", emoji: "🔥" },
    { name: "Steak frites", cuisine: "French", emoji: "🥩" },
    { name: "Jollof rice & suya", cuisine: "Nigerian", emoji: "🍢" },
  ],
};

export const QUIPS = [
  "The prophecy has spoken.",
  "Your stomach called. It agrees.",
  "The algorithm hungers… for this.",
  "No take-backsies. (Okay, maybe one.)",
  "Fate rolled a natural 20.",
  "Certified delicious by a very serious robot.",
  "The snack gods have chosen.",
  "Resistance is futile. Also, tasty.",
  "This was written in the stars. And in the fridge.",
  "Spin complete. Pants: optional.",
] as const;
