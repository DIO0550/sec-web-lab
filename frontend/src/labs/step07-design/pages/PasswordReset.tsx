import { useRef, useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Tabs } from "../../../components/Tabs";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { postJson } from "../../../utils/api";

const BASE = "/api/labs/password-reset";

type ResetResult = {
  success: boolean;
  message: string;
  _debug?: { message: string; token?: string; totalTokens?: number };
  _demo?: { token: string };
};

/** リクエスト結果タブ1つ分のデータ */
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
  mode: "vulnerable" | "secure";
  tabs: ResultTab[];
  activeTabId: string;
  onChangeTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  isLoading: boolean;
  onRequest: () => void;
  onBruteForce: () => void;
}) {
  const [token, setToken] = useState("");

  return (
    <div>
      <FetchButton onClick={onRequest} disabled={isLoading}>
        リセットリクエスト送信
      </FetchButton>
      {mode === "vulnerable" && (
        <FetchButton onClick={onBruteForce} disabled={isLoading}>
          トークン推測攻撃
        </FetchButton>
      )}

      <Input label="トークン:" type="text" value={token} onChange={(e) => setToken(e.target.value)} className="mt-2 mb-2" />

      {tabs.length > 0 && (
        <Tabs
          tabs={tabs.map((tab) => ({
            id: tab.id,
            label: tab.label,
            content: (
              <div className="max-h-[200px] overflow-auto">
                {tab.results.map((r, i) => (
                  <Alert key={i} variant={r.success ? "success" : "error"} className="text-xs mb-1">
                    {r.message}
                    {r._debug?.token && <span className="font-mono ml-1">[token: {r._debug.token}]</span>}
                    {r._demo?.token && <span className="font-mono ml-1">[token: {r._demo.token.substring(0, 8)}...]</span>}
                  </Alert>
                ))}
              </div>
            ),
          }))}
          activeTabId={activeTabId}
          onChangeTab={onChangeTab}
          closable
          onCloseTab={onCloseTab}
          className="mt-2"
        />
      )}
    </div>
  );
}

export function PasswordReset() {
  const [vulnTabs, setVulnTabs] = useState<ResultTab[]>([]);
  const [secureTabs, setSecureTabs] = useState<ResultTab[]>([]);
  const [activeVulnTabId, setActiveVulnTabId] = useState("");
  const [activeSecureTabId, setActiveSecureTabId] = useState("");
  const [loading, setLoading] = useState(false);
  // 削除しても重複しない連番管理
  const resetCounterRef = useRef({ vulnerable: 0, secure: 0 });
  const bruteCounterRef = useRef(0);

  const handleRequest = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    const setTabs = mode === "vulnerable" ? setVulnTabs : setSecureTabs;
    const setActiveId = mode === "vulnerable" ? setActiveVulnTabId : setActiveSecureTabId;
    const labelNum = ++resetCounterRef.current[mode];

    try {
      const data = await postJson<ResetResult>(`${BASE}/${mode}/reset-request`, { email: "victim@example.com" });
      const newTab: ResultTab = {
        id: nextTabId(),
        label: `リセット #${labelNum}`,
        results: [data],
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveId(newTab.id);
    } catch (e) {
      const err: ResetResult = { success: false, message: (e as Error).message };
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
    // 連番トークンを推測
    for (let i = 1; i <= 10; i++) {
      const token = String(i).padStart(4, "0");
      try {
        const data = await postJson<ResetResult>(`${BASE}/vulnerable/reset-confirm`, { token, newPassword: "hacked123" });
        data.message = `token=${token}: ${data.message}`;
        bruteResults.push(data);
        if (data.success) {
          break;
        }
      } catch (e) {
        // 通信エラー時も失敗結果としてタブに含める
        bruteResults.push({ success: false, message: `token=${token}: ${(e as Error).message}` });
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
      // 閉じたタブがアクティブなら隣のタブに移動
      const nextIdx = Math.min(idx, newTabs.length - 1);
      setActiveId(newTabs[nextIdx]?.id ?? "");
    }
  };

  return (
    <LabLayout
      title="推測可能なパスワードリセット"
      subtitle="パスワードリセットトークンが連番で推測可能"
      description="パスワードリセットトークンが連番や短い値で生成される場合、攻撃者がトークンを推測してアカウントを乗っ取ることが可能です。"
    >
      <ComparisonPanel
        vulnerableContent={
          <ResetPanel
            mode="vulnerable"
            tabs={vulnTabs}
            activeTabId={activeVulnTabId}
            onChangeTab={setActiveVulnTabId}
            onCloseTab={(id) => handleCloseTab(id, setVulnTabs, setActiveVulnTabId, vulnTabs, activeVulnTabId)}
            isLoading={loading}
            onRequest={() => handleRequest("vulnerable")}
            onBruteForce={handleBruteForce}
          />
        }
        secureContent={
          <ResetPanel
            mode="secure"
            tabs={secureTabs}
            activeTabId={activeSecureTabId}
            onChangeTab={setActiveSecureTabId}
            onCloseTab={(id) => handleCloseTab(id, setSecureTabs, setActiveSecureTabId, secureTabs, activeSecureTabId)}
            isLoading={loading}
            onRequest={() => handleRequest("secure")}
            onBruteForce={() => {}}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: トークンが連番で推測でき、アカウント乗っ取りが可能か</li>
          <li>安全版: crypto.randomUUID() で推測不可能なトークンが生成されているか</li>
          <li>有効期限と使い回し防止の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
