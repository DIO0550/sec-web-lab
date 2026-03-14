import { useState, type ReactNode } from "react";

type Tab = {
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  className?: string;
};

/**
 * 汎用タブ切り替えコンポーネント
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { label: "脆弱バージョン", content: <VulnerableContent /> },
 *     { label: "安全バージョン", content: <SecureContent /> },
 *   ]}
 * />
 */
export function Tabs({ tabs, className = "" }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={className}>
      <div className="flex border-b border-border-light" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={i === activeIndex}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
              i === activeIndex
                ? "border-b-2 border-accent text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
            onClick={() => setActiveIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
