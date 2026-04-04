import { Link } from "react-router-dom";
import { useThemeContext } from "@/contexts/ThemeContext";

type HeaderProps = {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};

/** Sun アイコン（ライトモード時に表示） */
function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/** Moon アイコン（ダークモード時に表示） */
function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-5 bg-bg-primary/80 backdrop-blur-sm border-b border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* 左側: ハンバーガー + ロゴ */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded hover:bg-sidebar-hover text-text-primary"
          aria-label={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
        >
          <span className="text-xl leading-none">{isSidebarOpen ? "✕" : "☰"}</span>
        </button>
        <Link
          to="/"
          className="text-lg font-semibold no-underline text-accent"
        >
          sec-web-lab
        </Link>
        <span className="hidden sm:inline text-xs text-text-secondary">
          Web Security Hands-on Laboratory
        </span>
      </div>

      {/* 右側: テーマトグル */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-md hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-200"
        aria-label={
          theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"
        }
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}
