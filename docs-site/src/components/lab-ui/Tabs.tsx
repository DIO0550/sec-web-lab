import { useId, useState, type ReactNode } from 'react';
import styles from './Tabs.module.css';

type Tab = {
  id: string;
  label: ReactNode;
  content: ReactNode;
};

type BaseProps = {
  tabs: Tab[];
  className?: string;
  keepMounted?: boolean;
};

type UncontrolledProps = BaseProps & {
  activeTabId?: undefined;
  onChangeTab?: undefined;
  closable?: undefined;
  onCloseTab?: undefined;
};

type ControlledProps = BaseProps & {
  activeTabId: string;
  onChangeTab: (tabId: string) => void;
  closable?: boolean;
  onCloseTab?: (tabId: string) => void;
};

type Props = UncontrolledProps | ControlledProps;

/**
 * 汎用タブ切り替えコンポーネント
 */
export function Tabs({
  tabs,
  className = '',
  keepMounted = false,
  activeTabId: controlledActiveId,
  onChangeTab,
  closable = false,
  onCloseTab,
}: Props) {
  const isControlled = controlledActiveId !== undefined;
  const [internalActiveId, setInternalActiveId] = useState<string>(
    tabs[0]?.id ?? '',
  );
  const instanceId = useId();

  const rawActiveId = isControlled ? controlledActiveId : internalActiveId;
  const activeIndex = Math.max(
    tabs.findIndex((t) => t.id === rawActiveId),
    0,
  );
  const activeId = tabs[activeIndex]?.id ?? '';

  const handleTabClick = (tabId: string) => {
    if (isControlled) {
      onChangeTab(tabId);
    } else {
      setInternalActiveId(tabId);
    }
  };

  const tabElId = (index: number) => `${instanceId}-tab-${index}`;
  const panelElId = (index: number) => `${instanceId}-panel-${index}`;

  if (tabs.length === 0) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab, i) => {
          const isActive = tab.id === activeId;

          if (closable) {
            return (
              <div
                key={tab.id}
                id={tabElId(i)}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelElId(i)}
                className={`${styles.closableTab} ${isActive ? styles.tabActive : ''}`}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabClick(tab.id);
                  }
                }}
                tabIndex={0}
              >
                <span>{tab.label}</span>
                <span
                  role="button"
                  aria-label="タブを閉じる"
                  tabIndex={0}
                  className={styles.closeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab?.(tab.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
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

          return (
            <button
              key={tab.id}
              id={tabElId(i)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelElId(i)}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
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
          className={styles.panel}
          hidden={tab.id !== activeId}
        >
          {keepMounted || tab.id === activeId ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
