import { useId, useState, type ReactNode } from "react";

type Tab = {
  /** タブの識別子（Tabs インスタンス内で一意であること） */
  id: string;
  label: ReactNode;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  className?: string;
  /** true: 全パネルを常時マウントし display:none で切り替え（子の state 保持用） */
  keepMounted?: boolean;
};

/**
 * 汎用タブ切り替えコンポーネント
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { id: "vulnerable", label: "脆弱バージョン", content: <VulnerableContent /> },
 *     { id: "secure", label: "安全バージョン", content: <SecureContent /> },
 *   ]}
 * />
 */
export function Tabs({ tabs, className = "", keepMounted = false }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const instanceId = useId();

  /** インデックスベースの DOM ID（同一ページに複数 Tabs があっても衝突しない） */
  const tabElId = (index: number) => `${instanceId}-tab-${index}`;
  const panelElId = (index: number) => `${instanceId}-panel-${index}`;

  return (
    <div className={className}>
      <div className="flex border-b border-border-light" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={tabElId(i)}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={panelElId(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${
              i === activeIndex
                ? "border-b-2 border-accent"
                : "border-b-2 border-transparent text-text-muted hover:text-text-primary"
            }`}
            onClick={() => setActiveIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={panelElId(i)}
          role="tabpanel"
          aria-labelledby={tabElId(i)}
          className="pt-4"
          hidden={i !== activeIndex}
        >
          {keepMounted || i === activeIndex ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
