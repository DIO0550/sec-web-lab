import { useId, useState, type ReactNode } from "react";

type Tab = {
  /** タブの識別子（Tabs インスタンス内で一意であること） */
  id: string;
  label: ReactNode;
  content: ReactNode;
};

type BaseProps = {
  tabs: Tab[];
  className?: string;
  /** true: 全パネルを常時マウントし display:none で切り替え（子の state 保持用） */
  keepMounted?: boolean;
};

type UncontrolledProps = BaseProps & {
  activeTabId?: undefined;
  onChangeTab?: undefined;
  closable?: undefined;
  onCloseTab?: undefined;
};

type ControlledProps = BaseProps & {
  /** 外部から選択中タブを制御する場合に指定 */
  activeTabId: string;
  /** タブ切り替え時のコールバック */
  onChangeTab: (tabId: string) => void;
  /** true: 各タブに閉じるボタンを表示 */
  closable?: boolean;
  /** タブ閉じるボタンクリック時のコールバック */
  onCloseTab?: (tabId: string) => void;
};

type Props = UncontrolledProps | ControlledProps;

/**
 * 汎用タブ切り替えコンポーネント
 *
 * Uncontrolled モード（従来互換）と Controlled モード（外部制御）を両方サポート。
 *
 * @example
 * // Uncontrolled（従来通り）
 * <Tabs
 *   tabs={[
 *     { id: "vulnerable", label: "脆弱バージョン", content: <VulnerableContent /> },
 *     { id: "secure", label: "安全バージョン", content: <SecureContent /> },
 *   ]}
 * />
 *
 * @example
 * // Controlled（外部制御 + タブ閉じ）
 * <Tabs
 *   tabs={resultTabs}
 *   activeTabId={activeId}
 *   onChangeTab={setActiveId}
 *   closable
 *   onCloseTab={handleClose}
 * />
 */
export function Tabs({
  tabs,
  className = "",
  keepMounted = false,
  activeTabId: controlledActiveId,
  onChangeTab,
  closable = false,
  onCloseTab,
}: Props) {
  const isControlled = controlledActiveId !== undefined;

  // Uncontrolled モード用の内部 state（id ベース）
  const [internalActiveId, setInternalActiveId] = useState<string>(
    tabs[0]?.id ?? "",
  );
  const instanceId = useId();

  // activeTabId の決定: Controlled なら外部値、Uncontrolled なら内部 state
  const rawActiveId = isControlled ? controlledActiveId : internalActiveId;
  // activeTabId が tabs に存在しない場合は最初のタブにフォールバック
  const activeIndex = Math.max(
    tabs.findIndex((t) => t.id === rawActiveId),
    0,
  );
  const activeId = tabs[activeIndex]?.id ?? "";

  const handleTabClick = (tabId: string) => {
    if (isControlled) {
      onChangeTab(tabId);
    } else {
      setInternalActiveId(tabId);
    }
  };

  /** インデックスベースの DOM ID（同一ページに複数 Tabs があっても衝突しない） */
  const tabElId = (index: number) => `${instanceId}-tab-${index}`;
  const panelElId = (index: number) => `${instanceId}-panel-${index}`;

  // tabs が空の場合は空の div のみレンダリング
  if (tabs.length === 0) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <div
        className="flex border-b border-border-light overflow-x-auto scrollbar-none"
        role="tablist"
      >
        {tabs.map((tab, i) => {
          const isActive = tab.id === activeId;
          const baseClasses = `px-5 py-2.5 text-sm font-medium transition-all duration-200 -mb-px ${
            isActive
              ? "border-b-2 border-accent text-accent"
              : "border-b-2 border-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary/50 rounded-t"
          }`;

          if (closable) {
            // closable モード: div[role="tab"] + 内部に label span と close span
            return (
              <div
                key={tab.id}
                id={tabElId(i)}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelElId(i)}
                className={`${baseClasses} flex items-center gap-1.5 cursor-pointer select-none`}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTabClick(tab.id);
                  }
                }}
                tabIndex={0}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  role="button"
                  aria-label="タブを閉じる"
                  tabIndex={0}
                  className="ml-1.5 w-4 h-4 inline-flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab?.(tab.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      onCloseTab?.(tab.id);
                    }
                  }}
                >
                  &times;
                </span>
              </div>
            );
          }

          // 通常モード（従来通り button[role="tab"]）
          return (
            <button
              key={tab.id}
              id={tabElId(i)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelElId(i)}
              className={`${baseClasses} cursor-pointer`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={panelElId(i)}
          role="tabpanel"
          aria-labelledby={tabElId(i)}
          className="pt-5"
          hidden={tab.id !== activeId}
        >
          {keepMounted || tab.id === activeId ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
