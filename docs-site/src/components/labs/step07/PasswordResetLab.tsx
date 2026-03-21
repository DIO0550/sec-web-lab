import { useRef, useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Tabs } from '@site/src/components/lab-ui/Tabs';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './PasswordResetLab.module.css';

const BASE = '/api/labs/password-reset';

type ResetResult = {
  success: boolean;
  message: string;
  _debug?: { message: string; token?: string; totalTokens?: number };
  _demo?: { token: string };
};

type ResultTab = {
  id: string;
  label: string;
  results: ResetResult[];
};

let tabCounter = 0;
const nextTabId = () => `req-${++tabCounter}`;

function ResetPanel({
  mode,
  tabs,
  activeTabId,
  onChangeTab,
  onCloseTab,
  isLoading,
  onRequest,
  onBruteForce,
}: {
  mode: 'vulnerable' | 'secure';
  tabs: ResultTab[];
  activeTabId: string;
  onChangeTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  isLoading: boolean;
  onRequest: () => void;
  onBruteForce: () => void;
}) {
  const [token, setToken] = useState('');

  return (
    <div>
      <FetchButton onClick={onRequest} disabled={isLoading}>
        リセットリクエスト送信
      </FetchButton>
      {mode === 'vulnerable' && (
        <FetchButton onClick={onBruteForce} disabled={isLoading}>
          トークン推測攻撃
        </FetchButton>
      )}

      <Input
        label="トークン:"
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className={styles.mt2}
      />

      {tabs.length > 0 && (
        <Tabs
          tabs={tabs.map((tab) => ({
            id: tab.id,
            label: tab.label,
            content: (
              <div className={styles.resultScroll}>
                {tab.results.map((r, i) => (
                  <Alert
                    key={i}
                    variant={r.success ? 'success' : 'error'}
                    className={styles.resultAlert}
                  >
                    {r.message}
                    {r._debug?.token && (
                      <span className={styles.tokenSpan}>
                        [token: {r._debug.token}]
                      </span>
                    )}
                    {r._demo?.token && (
                      <span className={styles.tokenSpan}>
                        [token: {r._demo.token.substring(0, 8)}...]
                      </span>
                    )}
                  </Alert>
                ))}
              </div>
            ),
          }))}
          activeTabId={activeTabId}
          onChangeTab={onChangeTab}
          closable
          onCloseTab={onCloseTab}
          className={styles.mt2}
        />
      )}
    </div>
  );
}

/**
 * 推測可能なパスワードリセットラボUI
 *
 * パスワードリセットトークンが連番で推測可能な脆弱性を体験する。
 */
export function PasswordResetLab() {
  const [vulnTabs, setVulnTabs] = useState<ResultTab[]>([]);
  const [secureTabs, setSecureTabs] = useState<ResultTab[]>([]);
  const [activeVulnTabId, setActiveVulnTabId] = useState('');
  const [activeSecureTabId, setActiveSecureTabId] = useState('');
  const [loading, setLoading] = useState(false);
  const resetCounterRef = useRef({ vulnerable: 0, secure: 0 });
  const bruteCounterRef = useRef(0);

  const handleRequest = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    const setTabs = mode === 'vulnerable' ? setVulnTabs : setSecureTabs;
    const setActiveId =
      mode === 'vulnerable' ? setActiveVulnTabId : setActiveSecureTabId;
    const labelNum = ++resetCounterRef.current[mode];

    try {
      const res = await fetch(`${BASE}/${mode}/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'victim@example.com' }),
      });
      const data: ResetResult = await res.json();
      const newTab: ResultTab = {
        id: nextTabId(),
        label: `リセット #${labelNum}`,
        results: [data],
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveId(newTab.id);
    } catch (e) {
      const err: ResetResult = {
        success: false,
        message: (e as Error).message,
      };
      const newTab: ResultTab = {
        id: nextTabId(),
        label: `リセット #${labelNum}`,
        results: [err],
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveId(newTab.id);
    }
    setLoading(false);
  };

  const handleBruteForce = async () => {
    setLoading(true);
    const bruteResults: ResetResult[] = [];
    for (let i = 1; i <= 10; i++) {
      const token = String(i).padStart(4, '0');
      try {
        const res = await fetch(`${BASE}/vulnerable/reset-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: 'hacked123' }),
        });
        const data: ResetResult = await res.json();
        data.message = `token=${token}: ${data.message}`;
        bruteResults.push(data);
        if (data.success) {
          break;
        }
      } catch (e) {
        bruteResults.push({
          success: false,
          message: `token=${token}: ${(e as Error).message}`,
        });
        break;
      }
    }
    if (bruteResults.length > 0) {
      const labelNum = ++bruteCounterRef.current;
      const newTab: ResultTab = {
        id: nextTabId(),
        label: `総当たり #${labelNum}`,
        results: bruteResults,
      };
      setVulnTabs((prev) => [...prev, newTab]);
      setActiveVulnTabId(newTab.id);
    }
    setLoading(false);
  };

  const handleCloseTab = (
    tabId: string,
    setTabs: React.Dispatch<React.SetStateAction<ResultTab[]>>,
    setActiveId: React.Dispatch<React.SetStateAction<string>>,
    currentTabs: ResultTab[],
    currentActiveId: string,
  ) => {
    const idx = currentTabs.findIndex((t) => t.id === tabId);
    const newTabs = currentTabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (currentActiveId === tabId) {
      const nextIdx = Math.min(idx, newTabs.length - 1);
      setActiveId(newTabs[nextIdx]?.id ?? '');
    }
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <ResetPanel
            mode="vulnerable"
            tabs={vulnTabs}
            activeTabId={activeVulnTabId}
            onChangeTab={setActiveVulnTabId}
            onCloseTab={(id) =>
              handleCloseTab(
                id,
                setVulnTabs,
                setActiveVulnTabId,
                vulnTabs,
                activeVulnTabId,
              )
            }
            isLoading={loading}
            onRequest={() => handleRequest('vulnerable')}
            onBruteForce={handleBruteForce}
          />
        }
        secureContent={
          <ResetPanel
            mode="secure"
            tabs={secureTabs}
            activeTabId={activeSecureTabId}
            onChangeTab={setActiveSecureTabId}
            onCloseTab={(id) =>
              handleCloseTab(
                id,
                setSecureTabs,
                setActiveSecureTabId,
                secureTabs,
                activeSecureTabId,
              )
            }
            isLoading={loading}
            onRequest={() => handleRequest('secure')}
            onBruteForce={() => {}}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: トークンが連番で推測でき、アカウント乗っ取りが可能か
          </li>
          <li>
            安全版: crypto.randomUUID()
            で推測不可能なトークンが生成されているか
          </li>
          <li>有効期限と使い回し防止の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
