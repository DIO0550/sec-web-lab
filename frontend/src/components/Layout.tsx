import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { useSidebarResize } from "@/hooks/useSidebarResize";

const SIDEBAR_STORAGE_KEY = "sec-web-lab-sidebar";
const SIDEBAR_COLLAPSED_WIDTH = 56;

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { isMobile } = useMobileDetect();
  const {
    sidebarWidth,
    isDragging,
    sidebarRef,
    handleMouseDown,
    handleKeyDown,
    handleDoubleClick,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_MAX_WIDTH,
  } = useSidebarResize();

  // デスクトップに戻ったらモバイルサイドバーを閉じる
  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false);
  }, [isMobile]);

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
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isMobileOpen]);

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
    <div className="h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header
        onToggleSidebar={toggleMobileSidebar}
        isSidebarOpen={isMobileOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* デスクトップサイドバー */}
        <aside
          ref={sidebarRef}
          className={`hidden lg:block flex-shrink-0 border-r border-border-light overflow-hidden ${
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
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
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
            <div className="w-full bg-transparent group-hover:bg-accent transition-colors duration-150" />
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
          <div className="max-w-5xl mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
