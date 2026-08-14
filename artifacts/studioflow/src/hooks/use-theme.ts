import { useEffect, useState } from "react";

const THEME_KEY = "studioflow-theme";

export function getStoredTheme(): string {
  if (typeof window === "undefined") return "warm";
  try {
    return window.localStorage.getItem(THEME_KEY) ?? "warm";
  } catch {
    return "warm";
  }
}

/** Persistent theme ("warm" | "sage" | "ink" | "replit") applied to the document root. */
export function useTheme() {
  const [theme, setTheme] = useState<string>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

