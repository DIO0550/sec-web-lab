import { useRef, useState } from "react";
import { fetchText } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { JsonTextViewer } from "../../../components/ResponseViewer";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Tabs } from "../../../components/Tabs";
import { Input } from "@/components/Input";
import { ExpandableSection } from "../../../components/ExpandableSection";

type FetchResult = { status: number; body: string } | null;

/** リクエスト結果タブ1つ分のデータ */
type ResultTab = {
  id: string;
  label: string;
  result: FetchResult;
};

const BASE = "/api/labs/error-message-leakage";

const TEST_INPUTS = [
  { id: "1", label: "正常 (id=1)", description: "正常なユーザーID" },
  { id: "abc", label: "文字列 (id=abc)", description: "型エラーを誘発" },
  { id: "'", label: "シングルクォート (id=')", description: "SQLエラーを誘発" },
  { id: "1 OR 1=1", label: "SQL Injection (1 OR 1=1)", description: "SQLインジェクション試行" },
];

let tabCounter = 0;
const nextTabId = () => `req-${++tabCounter}`;

function TestCaseList({
  mode,
  tabs,
  activeTabId,
  onChangeTab,
  onCloseTab,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  tabs: ResultTab[];
  activeTabId: string;
  onChangeTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  isLoading: boolean;
  onTest: (mode: "vulnerable" | "secure", id: string) => void;
}) {
  return (
    <>
      <h4 className={mode === "vulnerable" ? "text-status-ng" : "text-status-ok"}>
        {mode === "vulnerable" ? "脆弱バージョン" : "安全バージョン"}
      </h4>
      {TEST_INPUTS.map((input) => (
        <div key={input.id} className="mb-3">
          <div className="flex items-center gap-2">
            <FetchButton onClick={() => onTest(mode, input.id)} disabled={isLoading}>
              実行
            </FetchButton>
            <span className="text-[13px]">{input.label}</span>
            <span className="text-[11px] text-text-muted">-- {input.description}</span>
          </div>
        </div>
      ))}

      {tabs.length > 0 && (
        <Tabs
          tabs={tabs.map((tab) => ({
            id: tab.id,
            label: tab.label,
            content: <JsonTextViewer result={tab.result} />,
          }))}
          activeTabId={activeTabId}
          onChangeTab={onChangeTab}
          closable
          onCloseTab={onCloseTab}
          className="mt-2"
        />
      )}
    </>
  );
}

export function ErrorMessageLeakage() {
  const [vulnTabs, setVulnTabs] = useState<ResultTab[]>([]);
  const [secureTabs, setSecureTabs] = useState<ResultTab[]>([]);
  const [activeVulnTabId, setActiveVulnTabId] = useState("");
  const [activeSecureTabId, setActiveSecureTabId] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [customVulnResult, setCustomVulnResult] = useState<FetchResult>(null);
  const [customSecureResult, setCustomSecureResult] = useState<FetchResult>(null);
  const [loading, setLoading] = useState<string | null>(null);
  // 削除しても重複しない連番管理
  const tabLabelCounterRef = useRef({ vulnerable: 0, secure: 0 });

  const isLoading = loading !== null;

  const handleTest = async (mode: "vulnerable" | "secure", inputId: string) => {
    setLoading(`${mode}-${inputId}`);
    const setTabs = mode === "vulnerable" ? setVulnTabs : setSecureTabs;
    const setActiveId = mode === "vulnerable" ? setActiveVulnTabId : setActiveSecureTabId;
    const testInput = TEST_INPUTS.find((t) => t.id === inputId);

    try {
      const result = await fetchText(`${BASE}/${mode}/users/${encodeURIComponent(inputId)}`);
      const labelNum = ++tabLabelCounterRef.current[mode];
      const newTab: ResultTab = {
        id: nextTabId(),
        label: `${testInput?.label ?? inputId} #${labelNum}`,
        result,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveId(newTab.id);
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
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
      setActiveId(newTabs[nextIdx]?.id ?? "");
    }
  };

  const handleCustomTest = async () => {
    if (!customInput.trim()) {
      return;
    }
    setLoading("custom");
    try {
      const [vulnRes, secureRes] = await Promise.all([
        fetchText(`${BASE}/vulnerable/users/${encodeURIComponent(customInput)}`),
        fetchText(`${BASE}/secure/users/${encodeURIComponent(customInput)}`),
      ]);
      setCustomVulnResult(vulnRes);
      setCustomSecureResult(secureRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  return (
    <LabLayout
      title="Error Message Leakage"
      subtitle="エラーメッセージからの情報漏洩"
      description="不正な入力でエラーを誘発すると、SQL文・テーブル名・スタックトレース等の内部情報が漏洩する脆弱性です。"
    >
      {/* プリセットテスト */}
      <h3 className="mt-6">プリセットテスト</h3>
      <ComparisonPanel
        vulnerableContent={
          <TestCaseList
            mode="vulnerable"
            tabs={vulnTabs}
            activeTabId={activeVulnTabId}
            onChangeTab={setActiveVulnTabId}
            onCloseTab={(id) => handleCloseTab(id, setVulnTabs, setActiveVulnTabId, vulnTabs, activeVulnTabId)}
            isLoading={isLoading}
            onTest={handleTest}
          />
        }
        secureContent={
          <TestCaseList
            mode="secure"
            tabs={secureTabs}
            activeTabId={activeSecureTabId}
            onChangeTab={setActiveSecureTabId}
            onCloseTab={(id) => handleCloseTab(id, setSecureTabs, setActiveSecureTabId, secureTabs, activeSecureTabId)}
            isLoading={isLoading}
            onTest={handleTest}
          />
        }
      />

      {/* カスタム入力 */}
      <CheckpointBox title="カスタム入力テスト" variant="warning">
        <p className="text-[13px] text-text-secondary">
          任意の入力でエラーを誘発してみてください。脆弱版と安全版を同時にテストします。
        </p>
        <div className="flex gap-2 items-center">
          <code>/api/labs/error-message-leakage/[mode]/users/</code>
          <Input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="入力値"
          />
          <FetchButton onClick={handleCustomTest} disabled={isLoading || !customInput.trim()}>
            テスト
          </FetchButton>
        </div>

        <ExpandableSection isOpen={!!(customVulnResult || customSecureResult)}>
          <div className="flex gap-6 mt-3">
            <div className="flex-1">
              <strong className="text-status-ng">脆弱版</strong>
              <JsonTextViewer result={customVulnResult} />
            </div>
            <div className="flex-1">
              <strong className="text-status-ok">安全版</strong>
              <JsonTextViewer result={customSecureResult} />
            </div>
          </div>
        </ExpandableSection>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: エラーメッセージにテーブル名・SQL文・スタックトレースが含まれるか</li>
          <li>安全版: 汎用メッセージだけが返され、内部情報が漏洩していないか</li>
          <li>安全版: 不正な入力が <strong>バリデーション</strong> で弾かれているか</li>
          <li>注意: DBに接続していない場合、エラーメッセージの内容が異なる場合があります</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
