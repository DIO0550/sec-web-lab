import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/web-storage-abuse";

type StorageResult = {
  success: boolean;
  message: string;
  token?: string;
  _debug?: { message: string; risks?: string[]; xssPayload?: string };
};

function StoragePanel({
  mode,
  result,
  isLoading,
  onLogin,
}: {
  mode: "vulnerable" | "secure";
  result: StorageResult | null;
  isLoading: boolean;
  onLogin: () => void;
}) {
  return (
    <div>
      <p className="text-xs text-[#666] mb-2">admin / admin123 でログイン</p>
      <FetchButton onClick={onLogin} disabled={isLoading}>
        ログイン
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className="text-sm font-bold">{result.message}</div>
          {result.token && (
            <div className="mt-2">
              <div className="text-xs font-bold">レスポンスに含まれるトークン:</div>
              <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-1 overflow-auto break-all">{result.token}</pre>
              <div className="text-xs text-[#c62828] mt-1">
                → フロントエンドがlocalStorage.setItem("token", ...) で保存する想定
              </div>
            </div>
          )}
          {!result.token && result.success && (
            <div className="text-xs text-[#2e7d32] mt-1">
              トークンはHttpOnly Cookieに保存（JavaScriptからアクセス不可）
            </div>
          )}
          {result._debug && (
            <div className="mt-2">
              <div className="text-xs text-[#888] italic">{result._debug.message}</div>
              {result._debug.risks && (
                <ul className="text-xs text-[#c62828] mt-1">
                  {result._debug.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
              {result._debug.xssPayload && (
                <div className="mt-1">
                  <div className="text-xs font-bold text-[#c62828]">XSS窃取コード:</div>
                  <pre className="text-[10px] bg-[#fff3e0] p-1 rounded overflow-auto">{result._debug.xssPayload}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WebStorageAbuse() {
  const [vulnResult, setVulnResult] = useState<StorageResult | null>(null);
  const [secureResult, setSecureResult] = useState<StorageResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      const data: StorageResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="Web Storageの不適切な使用"
      subtitle="localStorage/sessionStorageへの機密データ保存"
      description="JWTトークンをlocalStorageに保存すると、XSS攻撃でlocalStorage.getItem()でトークンを窃取される脆弱性を体験します。HttpOnly Cookieによる安全な代替手段を学びます。"
    >
      <ComparisonPanel
        vulnerableContent={<StoragePanel mode="vulnerable" result={vulnResult} isLoading={loading} onLogin={() => handleLogin("vulnerable")} />}
        secureContent={<StoragePanel mode="secure" result={secureResult} isLoading={loading} onLogin={() => handleLogin("secure")} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: トークンがレスポンスボディに含まれている（localStorageに保存される想定）か</li>
          <li>安全版: トークンがHttpOnly Cookieに設定されているか</li>
          <li>XSSがあった場合のlocalStorage vs HttpOnly Cookieの安全性の違いを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
