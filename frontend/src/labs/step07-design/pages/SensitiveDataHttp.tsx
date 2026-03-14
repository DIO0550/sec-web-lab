import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

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
      <p className="text-xs text-text-secondary mb-2">admin / admin123 でログイン</p>
      <FetchButton onClick={onLogin} disabled={isLoading}>
        ログイン送信
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className={`mt-2 p-3 rounded ${result?.success ? "bg-success-bg border border-success-border" : "bg-error-bg-light border border-error-border"}`}>
          <div className="text-sm font-bold">{result?.message}</div>
          {result?._debug && (
            <div className="mt-2">
              <div className="text-xs text-text-muted italic">{result?._debug.message}</div>
              {result?._debug.cookie && (
                <div className="text-xs mt-1 font-mono bg-code-bg p-1 rounded">{result?._debug.cookie}</div>
              )}
              {result?._debug.risks && (
                <ul className="text-xs mt-1 text-error-text-light">
                  {result?._debug.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
          {result?.protectedHeaders && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result?.protectedHeaders, null, 2)}
            </pre>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

export function SensitiveDataHttp() {
  const result = useComparisonFetch<LoginResult>(BASE);

  const handleLogin = async (mode: "vulnerable" | "secure") => {
    await result.postJson(mode, "/login", { username: "admin", password: "admin123" }, (e) => ({
      success: false,
      message: (e as Error).message,
    }));
  };

  return (
    <LabLayout
      title="HTTPでの機密データ送信"
      subtitle="暗号化されていない通信で機密データが平文で流れる"
      description="HSTS未設定やCookie Secure属性の欠如により、HTTP通信でパスワードやセッション情報が平文で送信され、中間者攻撃で傍受される脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<HttpPanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onLogin={() => handleLogin("vulnerable")} />}
        secureContent={<HttpPanel mode="secure" result={result.secure} isLoading={result.loading} onLogin={() => handleLogin("secure")} />}
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
