import { subscriptCharacters, superscriptCharacters } from "./constants.js";

export function subscript<C extends string>(content: C): string {
  const chars: string[] = [];
  for (const char of content)
    chars.push(Reflect.get(subscriptCharacters, char));
  return chars.join(" ");
}

export function superscript<C extends string>(content: C): string {
  const chars: string[] = [];
  for (const char of content)
    chars.push(Reflect.get(superscriptCharacters, char));
  return chars.join(" ");
}

export function smallCapitals<C extends string>(content: C): string {
  const chars: string[] = [];
  for (const char of content.toUpperCase())
    chars.push(Reflect.get(superscriptCharacters, char));
  return chars.join(" ");
}
