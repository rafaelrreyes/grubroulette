import { type ClassNameValue, twMerge } from "tailwind-merge";

type StateClassName<S> = (state: S) => string | undefined;

/**
 * Merge Tailwind classes. Base UI allows `className` to be a function of component
 * state, so when any input is a function the result is a function too.
 */
export function cn(...inputs: ClassNameValue[]): string;
export function cn<S>(...inputs: (ClassNameValue | StateClassName<S>)[]): string | ((state: S) => string);
export function cn<S>(...inputs: (ClassNameValue | StateClassName<S>)[]) {
  if (!inputs.some((i) => typeof i === "function")) return twMerge(...(inputs as ClassNameValue[]));
  return (state: S) => twMerge(...inputs.map((i) => (typeof i === "function" ? i(state) : i)));
}
