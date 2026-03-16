import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAVIGATION } from "@/data/navigation";
import type { StepWithLabs } from "@/data/navigation";

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
};

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const location = useLocation();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // 現在のパスに対応するステップを自動展開
  useEffect(() => {
    const currentStep = NAVIGATION.find(
      (step) =>
        location.pathname === step.path ||
        location.pathname.startsWith(step.path + "/")
    );
    if (currentStep) {
      setExpandedSteps((prev) => {
        if (prev.has(currentStep.id)) return prev;
        return new Set(prev).add(currentStep.id);
      });
    }
  }, [location.pathname]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const isStepActive = (step: StepWithLabs) =>
    location.pathname === step.path ||
    location.pathname.startsWith(step.path + "/");

  const isLabActive = (labPath: string) => location.pathname === labPath;

  return (
    <nav className="h-full flex flex-col bg-sidebar-bg">
      {/* 折りたたみトグル（デスクトップのみ） */}
      <div className="hidden lg:flex items-center justify-end px-2 py-1.5 border-b border-border-light">
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-sidebar-hover text-text-muted transition-colors duration-150"
          aria-label={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          title={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform duration-200"
            style={{ transform: isCollapsed ? "rotate(180deg)" : undefined }}
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ステップ一覧 */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar py-1">
        {NAVIGATION.map((step) => (
          <div key={step.id}>
            {/* ステップヘッダー: 折りたたみ時はステップページへ遷移、展開時はアコーディオン開閉 */}
            {isCollapsed ? (
              <Link
                to={step.path}
                onClick={onNavigate}
                className={`w-full flex items-center justify-center px-2 py-2 text-sm no-underline transition-colors duration-150 relative ${
                  isStepActive(step)
                    ? "bg-sidebar-active text-text-primary font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-accent"
                    : "text-text-secondary hover:bg-sidebar-hover"
                }`}
                title={step.name}
                aria-label={step.name}
              >
                <span className="text-base">{step.icon}</span>
              </Link>
            ) : (
              <button
                onClick={() => toggleStep(step.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-150 relative ${
                  isStepActive(step)
                    ? "bg-sidebar-active text-text-primary font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-accent"
                    : "text-text-secondary hover:bg-sidebar-hover"
                }`}
                aria-expanded={expandedSteps.has(step.id)}
              >
                <span className="text-sm flex-shrink-0">{step.icon}</span>
                <span className="flex-1 truncate leading-tight">
                  {step.shortName}
                </span>
                <span className="text-xs text-text-muted flex-shrink-0 tabular-nums">
                  {step.labs.length}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`flex-shrink-0 text-text-muted transition-transform duration-150 ${
                    expandedSteps.has(step.id) ? "rotate-90" : ""
                  }`}
                >
                  <path
                    d="M4.5 3L7.5 6L4.5 9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* ラボ一覧（展開時） */}
            {!isCollapsed && expandedSteps.has(step.id) && (
              <div className="pb-1">
                {/* ステップインデックスリンク */}
                <Link
                  to={step.path}
                  onClick={onNavigate}
                  className={`block pl-9 pr-4 py-2 text-sm no-underline truncate transition-colors duration-150 relative ${
                    location.pathname === step.path
                      ? "text-text-primary bg-sidebar-active font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-accent"
                      : "text-text-muted hover:bg-sidebar-hover hover:text-text-primary"
                  }`}
                  title={step.name}
                >
                  概要
                </Link>
                {step.labs.map((lab) => (
                  <Link
                    key={lab.id}
                    to={lab.path}
                    onClick={onNavigate}
                    className={`block pl-9 pr-4 py-2 text-sm no-underline truncate transition-colors duration-150 relative ${
                      isLabActive(lab.path)
                        ? "text-text-primary bg-sidebar-active font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-accent"
                        : "text-text-muted hover:bg-sidebar-hover hover:text-text-primary"
                    }`}
                    title={lab.name}
                  >
                    {lab.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
