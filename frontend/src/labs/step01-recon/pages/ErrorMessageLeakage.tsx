import { useState } from "react";
import { fetchText } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { JsonTextViewer } from "../../../components/ResponseViewer";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Tabs } from "../../../components/Tabs";
import { Input } from "@/components/Input";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { EndpointUrl } from "../../../components/EndpointUrl";

type FetchResult = { status: number; body: string } | null;

const BASE = "/api/labs/error-message-leakage";

const TEST_INPUTS = [
  { id: "1", label: "正常 (id=1)", description: "正常なユーザーID" },
  { id: "abc", label: "文字列 (id=abc)", description: "型エラーを誘発" },
  { id: "'", label: "シングルクォート (id=')", description: "SQLエラーを誘発" },
  { id: "1 OR 1=1", label: "SQL Injection (1 OR 1=1)", description: "SQLインジェクション試行" },
];

function TestCaseList({
  mode,
  results,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  results: Record<string, FetchResult>;
  isLoading: boolean;
  onTest: (mode: "vulnerable" | "secure", id: string) => void;
}) {
  return (
    <>
      <h4 className={mode === "vulnerable" ? "text-status-ng" : "text-status-ok"}>
        {mode === "vulnerable" ? "脆弱バージョン" : "安全バージョン"}
      </h4>
      <Tabs
        tabs={TEST_INPUTS.map((input) => ({
          id: input.id,
          label: input.label,
          content: (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FetchButton onClick={() => onTest(mode, input.id)} disabled={isLoading}>
                  実行
                </FetchButton>
                <span className="text-xs text-text-muted">{input.description}</span>
              </div>
              <JsonTextViewer result={results[input.id] ?? null} />
            </div>
          ),
        }))}
        keepMounted
      />
    </>
  );
}

export function ErrorMessageLeakage() {
  const [vulnerableResults, setVulnerableResults] = useState<Record<string, FetchResult>>({});
  const [secureResults, setSecureResults] = useState<Record<string, FetchResult>>({});
  const [customInput, setCustomInput] = useState("");
  const [customVulnResult, setCustomVulnResult] = useState<FetchResult>(null);
  const [customSecureResult, setCustomSecureResult] = useState<FetchResult>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const isLoading = loading !== null;

  const handleTest = async (mode: "vulnerable" | "secure", inputId: string) => {
    setLoading(`${mode}-${inputId}`);
    try {
      const result = await fetchText(`${BASE}/${mode}/users/${encodeURIComponent(inputId)}`);
      const setter = mode === "vulnerable" ? setVulnerableResults : setSecureResults;
      setter((prev) => ({ ...prev, [inputId]: result }));
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
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
          <TestCaseList mode="vulnerable" results={vulnerableResults} isLoading={isLoading} onTest={handleTest} />
        }
        secureContent={
          <TestCaseList mode="secure" results={secureResults} isLoading={isLoading} onTest={handleTest} />
        }
      />

      {/* カスタム入力 */}
      <CheckpointBox title="カスタム入力テスト" variant="warning">
        <p className="text-sm text-text-secondary">
          任意の入力でエラーを誘発してみてください。脆弱版と安全版を同時にテストします。
        </p>
        <EndpointUrl
          method="GET"
          action={
            <FetchButton onClick={handleCustomTest} disabled={isLoading || !customInput.trim()}>
              テスト
            </FetchButton>
          }
        >
          <span className="flex items-center gap-1">
            /api/labs/error-message-leakage/[mode]/users/
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="入力値"
              className="w-24 px-2 py-0.5 border border-input-border rounded bg-bg-primary text-text-primary text-sm outline-none focus:border-input-focus"
            />
          </span>
        </EndpointUrl>

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
