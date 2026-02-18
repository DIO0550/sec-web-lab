import { useState, useCallback } from "react";
import { fetchText } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { JsonTextViewer } from "../../../components/ResponseViewer";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
      <h4 className={mode === "vulnerable" ? "text-[#c00]" : "text-[#080]"}>
        {mode === "vulnerable" ? "脆弱バージョン" : "安全バージョン"}
      </h4>
      {TEST_INPUTS.map((input) => (
        <div key={input.id} className="mb-3">
          <div className="flex items-center gap-2">
            <FetchButton onClick={() => onTest(mode, input.id)} disabled={isLoading} size="small">
              実行
            </FetchButton>
            <span className="text-[13px]">{input.label}</span>
            <span className="text-[11px] text-[#888]">-- {input.description}</span>
          </div>
          <JsonTextViewer result={results[input.id] ?? null} />
        </div>
      ))}
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

  const handleTest = useCallback(async (mode: "vulnerable" | "secure", inputId: string) => {
    setLoading(`${mode}-${inputId}`);
    try {
      const result = await fetchText(`${BASE}/${mode}/users/${encodeURIComponent(inputId)}`);
      const setter = mode === "vulnerable" ? setVulnerableResults : setSecureResults;
      setter((prev) => ({ ...prev, [inputId]: result }));
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  }, []);

  const handleCustomTest = useCallback(async () => {
    if (!customInput.trim()) return;
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
  }, [customInput]);

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
        <p className="text-[13px] text-[#666]">
          任意の入力でエラーを誘発してみてください。脆弱版と安全版を同時にテストします。
        </p>
        <div className="flex gap-2 items-center">
          <code>/api/labs/error-message-leakage/[mode]/users/</code>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="入力値"
            className="py-1 px-2 border border-[#ccc] rounded"
          />
          <FetchButton onClick={handleCustomTest} disabled={isLoading || !customInput.trim()}>
            テスト
          </FetchButton>
        </div>

        {(customVulnResult || customSecureResult) && (
          <div className="flex gap-6 mt-3">
            <div className="flex-1">
              <strong className="text-[#c00]">脆弱版</strong>
              <JsonTextViewer result={customVulnResult} />
            </div>
            <div className="flex-1">
              <strong className="text-[#080]">安全版</strong>
              <JsonTextViewer result={customSecureResult} />
            </div>
          </div>
        )}
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
