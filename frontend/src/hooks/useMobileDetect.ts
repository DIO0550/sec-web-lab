import { useState, useEffect } from "react";

const BREAKPOINT = 1024;

/**
 * ウィンドウ幅を監視してモバイル判定を返すフック。
 * ブレークポイント（1024px）未満の場合に isMobile = true を返す。
 */
export function useMobileDetect(): { isMobile: boolean } {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile };
}
