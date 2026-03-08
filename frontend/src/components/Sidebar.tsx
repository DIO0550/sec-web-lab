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
        // 既に展開済みなら state 更新をスキップ（不要な再レンダリング防止）
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
    <nav className="h-full flex flex-col bg-sidebar-bg dark:bg-sidebar-bg">
      {/* 折りたたみトグル（デスクトップのみ） */}
      <div className="hidden lg:flex justify-end p-2 border-b border-border-light dark:border-border-light">
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-sidebar-hover dark:hover:bg-sidebar-hover text-text-muted dark:text-text-muted text-sm"
          aria-label={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          title={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
        >
          {isCollapsed ? "»" : "«"}
        </button>
      </div>

      {/* ステップ一覧 */}
      <div className="flex-1 overflow-y-auto py-2">
        {NAVIGATION.map((step) => (
          <div key={step.id}>
            {/* ステップヘッダー: 折りたたみ時はステップページへ遷移、展開時はアコーディオン開閉 */}
            {isCollapsed ? (
              <Link
                to={step.path}
                onClick={onNavigate}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm no-underline transition-colors ${
                  isStepActive(step)
                    ? "bg-sidebar-active dark:bg-sidebar-active text-text-primary dark:text-text-primary font-medium"
                    : "text-text-secondary dark:text-text-secondary hover:bg-sidebar-hover dark:hover:bg-sidebar-hover"
                }`}
                title={step.name}
                aria-label={step.name}
              >
                <span className="text-base flex-shrink-0">{step.icon}</span>
              </Link>
            ) : (
              <button
                onClick={() => toggleStep(step.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isStepActive(step)
                    ? "bg-sidebar-active dark:bg-sidebar-active text-text-primary dark:text-text-primary font-medium"
                    : "text-text-secondary dark:text-text-secondary hover:bg-sidebar-hover dark:hover:bg-sidebar-hover"
                }`}
                aria-expanded={expandedSteps.has(step.id)}
              >
                <span className="text-base flex-shrink-0">{step.icon}</span>
                <span className="flex-1 truncate">{step.shortName}</span>
                <span className="text-xs text-text-muted dark:text-text-muted flex-shrink-0">
                  {step.labs.length}
                </span>
                <span className="text-xs text-text-muted dark:text-text-muted flex-shrink-0">
                  {expandedSteps.has(step.id) ? "▾" : "▸"}
                </span>
              </button>
            )}

            {/* ラボ一覧（展開時） */}
            {!isCollapsed && expandedSteps.has(step.id) && (
              <div className="pb-1">
                {/* ステップインデックスリンク */}
                <Link
                  to={step.path}
                  onClick={onNavigate}
                  className={`block pl-9 pr-3 py-1.5 text-xs no-underline truncate transition-colors ${
                    location.pathname === step.path
                      ? "text-text-primary dark:text-text-primary bg-sidebar-active dark:bg-sidebar-active font-medium"
                      : "text-text-muted dark:text-text-muted hover:bg-sidebar-hover dark:hover:bg-sidebar-hover hover:text-text-primary dark:hover:text-text-primary"
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
                    className={`block pl-9 pr-3 py-1.5 text-xs no-underline truncate transition-colors ${
                      isLabActive(lab.path)
                        ? "text-text-primary dark:text-text-primary bg-sidebar-active dark:bg-sidebar-active font-medium"
                        : "text-text-muted dark:text-text-muted hover:bg-sidebar-hover dark:hover:bg-sidebar-hover hover:text-text-primary dark:hover:text-text-primary"
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
