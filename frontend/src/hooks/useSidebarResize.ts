import { useState, useCallback, useRef, useEffect } from "react";

const SIDEBAR_WIDTH_STORAGE_KEY = "sec-web-lab-sidebar-width";
const SIDEBAR_MIN_WIDTH = 150;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 240;

function getInitialWidth(): number {
  try {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (stored === null) return SIDEBAR_DEFAULT_WIDTH;
    const parsed = Number(stored);
    if (isNaN(parsed)) return SIDEBAR_DEFAULT_WIDTH;
    return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsed));
  } catch {
    return SIDEBAR_DEFAULT_WIDTH;
  }
}

function persistWidth(width: number): void {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width));
  } catch {
    // localStorage に書き込めない場合は無視
  }
}

export interface UseSidebarResizeReturn {
  sidebarWidth: number;
  isDragging: boolean;
  sidebarRef: React.RefObject<HTMLElement | null>;
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleDoubleClick: () => void;
  SIDEBAR_MIN_WIDTH: number;
  SIDEBAR_MAX_WIDTH: number;
}

/**
 * サイドバーのリサイズロジックを管理するフック。
 * ドラッグリサイズ、キーボードリサイズ、ダブルクリックリセット、localStorage 永続化を担当する。
 */
export function useSidebarResize(): UseSidebarResizeReturn {
  const [sidebarWidth, setSidebarWidth] = useState(getInitialWidth);
  const [isDragging, setIsDragging] = useState(false);

  const sidebarWidthRef = useRef(sidebarWidth);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const rafIdRef = useRef<number>(0);

  // ドラッグ中の mousemove / mouseup / touch イベント管理
  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const clientX =
          "touches" in e ? e.touches[0].clientX : e.clientX;
        const newWidth = Math.min(
          SIDEBAR_MAX_WIDTH,
          Math.max(SIDEBAR_MIN_WIDTH, clientX)
        );
        sidebarWidthRef.current = newWidth;
        if (sidebarRef.current) {
          sidebarRef.current.style.width = `${newWidth}px`;
        }
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      const finalWidth = sidebarWidthRef.current;
      setSidebarWidth(finalWidth);
      persistWidth(finalWidth);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("touchend", handleDragEnd);
    document.addEventListener("touchcancel", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
      document.removeEventListener("touchcancel", handleDragEnd);
      // クリーンアップ時にも body スタイルを確実に復元
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, [isDragging]);

  // ドラッグ開始ハンドラ
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      sidebarWidthRef.current = sidebarWidth;
      setIsDragging(true);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [sidebarWidth]
  );

  // キーボードによるリサイズ（左右キーで 10px ずつ調整）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = 10;
      let newWidth = sidebarWidth;
      if (e.key === "ArrowLeft") {
        newWidth = Math.max(SIDEBAR_MIN_WIDTH, sidebarWidth - step);
      } else if (e.key === "ArrowRight") {
        newWidth = Math.min(SIDEBAR_MAX_WIDTH, sidebarWidth + step);
      } else if (e.key === "Home") {
        newWidth = SIDEBAR_MIN_WIDTH;
      } else if (e.key === "End") {
        newWidth = SIDEBAR_MAX_WIDTH;
      } else {
        return;
      }
      e.preventDefault();
      setSidebarWidth(newWidth);
      sidebarWidthRef.current = newWidth;
      persistWidth(newWidth);
    },
    [sidebarWidth]
  );

  // ダブルクリックでデフォルト幅にリセット
  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
    sidebarWidthRef.current = SIDEBAR_DEFAULT_WIDTH;
    persistWidth(SIDEBAR_DEFAULT_WIDTH);
  }, []);

  return {
    sidebarWidth,
    isDragging,
    sidebarRef,
    handleMouseDown,
    handleKeyDown,
    handleDoubleClick,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_MAX_WIDTH,
  };
}
