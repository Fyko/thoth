import { atom } from "nanostores";

export const isDarkTheme = atom(true);

export const getThemePreference = () => {
  if (localStorage?.getItem("theme")) {
    return localStorage.getItem("theme");
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
