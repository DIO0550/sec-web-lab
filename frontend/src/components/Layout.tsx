import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

const SIDEBAR_STORAGE_KEY = "sec-web-lab-sidebar";
const SIDEBAR_WIDTH_STORAGE_KEY = "sec-web-lab-sidebar-width";
const SIDEBAR_MIN_WIDTH = 150;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;
const BREAKPOINT = 1024;

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

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

export function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < BREAKPOINT : false
  );
  const [sidebarWidth, setSidebarWidth] = useState(getInitialWidth);
  const [isDragging, setIsDragging] = useState(false);

  const sidebarWidthRef = useRef(sidebarWidth);
  const sidebarRef = useRef<HTMLElement>(null);
  const rafIdRef = useRef<number>(0);

  // ウィンドウリサイズ監視
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // モバイルオーバーレイ時の body スクロール抑止
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Esc キーでモバイルサイドバーを閉じる
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

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
      try {
        localStorage.setItem(
          SIDEBAR_WIDTH_STORAGE_KEY,
          String(finalWidth)
        );
      } catch {
        // localStorage に書き込めない場合は無視
      }

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

  const handleDragStart = useCallback(
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
      try {
        localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(newWidth));
      } catch {
        // localStorage に書き込めない場合は無視
      }
    },
    [sidebarWidth]
  );

  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
    sidebarWidthRef.current = SIDEBAR_DEFAULT_WIDTH;
    try {
      localStorage.setItem(
        SIDEBAR_WIDTH_STORAGE_KEY,
        String(SIDEBAR_DEFAULT_WIDTH)
      );
    } catch {
      // localStorage に書き込めない場合は無視
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(
          SIDEBAR_STORAGE_KEY,
          next ? "collapsed" : "expanded"
        );
      } catch {
        // localStorage に書き込めない場合は無視
      }
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(() => {
    if (isMobile) setIsMobileOpen(false);
  }, [isMobile]);

  const asideWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth;

  return (
    <div className="h-screen flex flex-col bg-bg-primary dark:bg-bg-primary text-text-primary dark:text-text-primary">
      <Header
        onToggleSidebar={toggleMobileSidebar}
        isSidebarOpen={isMobileOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* デスクトップサイドバー */}
        <aside
          ref={sidebarRef}
          className={`hidden lg:block flex-shrink-0 border-r border-border-light dark:border-border-light overflow-hidden ${
            isDragging ? "transition-none" : "transition-[width] duration-200"
          }`}
          style={{ width: asideWidth }}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
            onNavigate={handleNavigate}
          />
        </aside>

        {/* ドラッグハンドル（デスクトップ・展開時のみ表示） */}
        {!isCollapsed && (
          <div
            className="hidden lg:flex items-stretch w-1 flex-shrink-0 cursor-col-resize group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="サイドバー幅を調整"
            aria-valuenow={sidebarWidth}
            aria-valuemin={SIDEBAR_MIN_WIDTH}
            aria-valuemax={SIDEBAR_MAX_WIDTH}
            tabIndex={0}
          >
            <div className="w-full bg-transparent group-hover:bg-accent dark:group-hover:bg-accent transition-colors duration-150" />
          </div>
        )}

        {/* モバイルオーバーレイ */}
        {isMobileOpen && (
          <>
            {/* 背景オーバーレイ */}
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            {/* サイドバー */}
            <aside className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden">
              <Sidebar
                isCollapsed={false}
                onToggleCollapse={toggleCollapse}
                onNavigate={handleNavigate}
              />
            </aside>
          </>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-scroll">
          <div className="max-w-[960px] mx-auto p-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
