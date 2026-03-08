import { useState, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "sec-web-lab-theme";

/** localStorage から安全にテーマを読み込む */
function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage にアクセスできない場合は無視
  }
  // OS のテーマ設定をフォールバックとして使用
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/** <html> 要素の dark クラスを更新 */
function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function useTheme() {
  // useState の初期値計算で同期的にテーマを決定
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage に書き込めない場合は無視
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme } as const;
}
