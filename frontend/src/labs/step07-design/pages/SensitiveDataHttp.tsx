import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/sensitive-data-http";

type LoginResult = {
  success: boolean;
  message: string;
  _debug?: { message: string; cookie?: string; risks?: string[] };
  protectedHeaders?: Record<string, string>;
};

function HttpPanel({
  mode,
  result,
  isLoading,
  onLogin,
}: {
  mode: "vulnerable" | "secure";
  result: LoginResult | null;
  isLoading: boolean;
  onLogin: () => void;
}) {
  return (
    <div>
      <p className="text-xs text-[#666] mb-2">admin / admin123 でログイン</p>
      <FetchButton onClick={onLogin} disabled={isLoading}>
        ログイン送信
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className="text-sm font-bold">{result.message}</div>
          {result._debug && (
            <div className="mt-2">
              <div className="text-xs text-[#888] italic">{result._debug.message}</div>
              {result._debug.cookie && (
                <div className="text-xs mt-1 font-mono bg-[#f5f5f5] p-1 rounded">{result._debug.cookie}</div>
              )}
              {result._debug.risks && (
                <ul className="text-xs mt-1 text-[#c62828]">
                  {result._debug.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
          {result.protectedHeaders && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.protectedHeaders, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function SensitiveDataHttp() {
  const [vulnResult, setVulnResult] = useState<LoginResult | null>(null);
  const [secureResult, setSecureResult] = useState<LoginResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      const data: LoginResult = await res.json();
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
      title="HTTPでの機密データ送信"
      subtitle="暗号化されていない通信で機密データが平文で流れる"
      description="HSTS未設定やCookie Secure属性の欠如により、HTTP通信でパスワードやセッション情報が平文で送信され、中間者攻撃で傍受される脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<HttpPanel mode="vulnerable" result={vulnResult} isLoading={loading} onLogin={() => handleLogin("vulnerable")} />}
        secureContent={<HttpPanel mode="secure" result={secureResult} isLoading={loading} onLogin={() => handleLogin("secure")} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CookieにSecure属性が設定されていないか</li>
          <li>安全版: HSTS + Secure + HttpOnly + SameSite が設定されているか</li>
          <li>HTTPS の強制とCookie属性の関係を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
