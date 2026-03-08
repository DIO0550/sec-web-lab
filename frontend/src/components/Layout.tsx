import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

const SIDEBAR_STORAGE_KEY = "sec-web-lab-sidebar";
const BREAKPOINT = 1024;

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
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < BREAKPOINT : false
  );

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

  // サイドバー幅の計算
  const sidebarWidth = isCollapsed ? "w-14" : "w-60";

  return (
    <div className="h-screen flex flex-col bg-bg-primary dark:bg-bg-primary text-text-primary dark:text-text-primary">
      <Header
        onToggleSidebar={toggleMobileSidebar}
        isSidebarOpen={isMobileOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* デスクトップサイドバー */}
        <aside
          className={`hidden lg:block ${sidebarWidth} flex-shrink-0 border-r border-border-light dark:border-border-light transition-[width] duration-200 overflow-hidden`}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
            onNavigate={handleNavigate}
          />
        </aside>

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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[960px] mx-auto p-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
