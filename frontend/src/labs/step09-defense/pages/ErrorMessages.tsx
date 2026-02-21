import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/error-messages";

type ErrorResult = {
  success: boolean;
  message: string;
  stack?: string;
  user?: Record<string, unknown>;
  _debug?: { message: string };
};

function ErrorPanel({
  mode,
  results,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  results: ErrorResult[];
  isLoading: boolean;
  onTest: (action: string) => void;
}) {
  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        <FetchButton onClick={() => onTest("user-exist")} disabled={isLoading}>存在するユーザー</FetchButton>
        <FetchButton onClick={() => onTest("user-notfound")} disabled={isLoading}>存在しないユーザー</FetchButton>
        <FetchButton onClick={() => onTest("login-nouser")} disabled={isLoading}>存在しないアカウント</FetchButton>
        <FetchButton onClick={() => onTest("login-wrongpw")} disabled={isLoading}>パスワード間違い</FetchButton>
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-[300px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className={`text-xs p-2 mb-1 rounded ${r.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
              <div className="font-bold">{r.message}</div>
              {r.stack && <pre className="text-[10px] mt-1 overflow-auto max-h-[100px]">{r.stack}</pre>}
              {r._debug && <div className="text-[#888] italic mt-1">{r._debug.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ErrorMessages() {
  const [vulnResults, setVulnResults] = useState<ErrorResult[]>([]);
  const [secureResults, setSecureResults] = useState<ErrorResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure", action: string) => {
    setLoading(true);
    try {
      let res: Response;
      switch (action) {
        case "user-exist":
          res = await fetch(`${BASE}/${mode}/user/1`);
          break;
        case "user-notfound":
          res = await fetch(`${BASE}/${mode}/user/9999`);
          break;
        case "login-nouser":
          res = await fetch(`${BASE}/${mode}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "nonexistent", password: "test" }),
          });
          break;
        case "login-wrongpw":
          res = await fetch(`${BASE}/${mode}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "wrongpass" }),
          });
          break;
        default:
          return;
      }
      const data: ErrorResult = await res.json();
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="詳細エラーメッセージ露出"
      subtitle="エラーメッセージが詳細すぎると攻撃者に情報を与える"
      description="エラーメッセージにDB構造やスタックトレースが含まれると攻撃者に内部情報を提供します。また、ログインエラーで「ユーザーが存在しない」「パスワードが違う」を区別するとユーザー列挙攻撃が可能になります。"
    >
      <ComparisonPanel
        vulnerableContent={<ErrorPanel mode="vulnerable" results={vulnResults} isLoading={loading} onTest={(a) => handleTest("vulnerable", a)} />}
        secureContent={<ErrorPanel mode="secure" results={secureResults} isLoading={loading} onTest={(a) => handleTest("secure", a)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: エラーにテーブル名やクエリが含まれているか</li>
          <li>脆弱版: ユーザー不在とパスワード不一致で異なるメッセージが返るか</li>
          <li>安全版: すべてのエラーで一般的なメッセージのみ返されるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
