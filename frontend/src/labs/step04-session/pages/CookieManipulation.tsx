import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/cookie-manipulation";

type LoginResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  cookieAttributes?: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
  };
};

type CookieInfoResult = {
  success: boolean;
  message?: string;
  username?: string;
  sessionId?: string;
  vulnerabilities?: string[];
  protections?: string[];
};

// --- ログインフォーム ---
function LoginForm({
  mode,
  result,
  isLoading,
  onSubmit,
  onCheckCookie,
  cookieInfo,
  documentCookie,
}: {
  mode: "vulnerable" | "secure";
  result: LoginResult | null;
  isLoading: boolean;
  onSubmit: (mode: "vulnerable" | "secure", username: string, password: string) => void;
  onCheckCookie: (mode: "vulnerable" | "secure") => void;
  cookieInfo: CookieInfoResult | null;
  documentCookie: string;
}) {
  const [username, setUsername] = useState("alice");
  const [password, setPassword] = useState("alice123");

  return (
    <div>
      <div className="mb-3">
        <div className="mb-1">
          <label className="text-[13px] block">ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
          />
        </div>
        <div className="mb-1">
          <label className="text-[13px] block">パスワード:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
          />
        </div>
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      {result && (
        <div
          className={`mt-2 p-3 rounded ${
            result.success
              ? "bg-[#e8f5e9] border border-[#4caf50]"
              : "bg-[#ffebee] border border-[#f44336]"
          }`}
        >
          <div className={`font-bold ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "ログイン成功" : "ログイン失敗"}
          </div>
          <div className="text-[13px]">{result.message}</div>
          {result.cookieAttributes && (
            <div className="mt-2 text-xs">
              <div>
                <strong>Cookie属性:</strong>
              </div>
              <div>
                HttpOnly: {result.cookieAttributes.httpOnly ? "✅ 有効" : "❌ 無効"}
              </div>
              <div>
                Secure: {result.cookieAttributes.secure ? "✅ 有効" : "❌ 無効"}
              </div>
              <div>SameSite: {result.cookieAttributes.sameSite}</div>
            </div>
          )}
        </div>
      )}

      {result?.success && (
        <div className="mt-3">
          <FetchButton onClick={() => onCheckCookie(mode)} disabled={isLoading} size="small">
            Cookie情報を確認
          </FetchButton>

          {cookieInfo && (
            <div className="mt-2 p-2 bg-[#f5f5f5] rounded text-xs">
              {cookieInfo.vulnerabilities && (
                <div>
                  <strong className="text-[#c00]">脆弱性:</strong>
                  <ul className="m-0 pl-4">
                    {cookieInfo.vulnerabilities.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
              {cookieInfo.protections && (
                <div>
                  <strong className="text-[#080]">保護:</strong>
                  <ul className="m-0 pl-4">
                    {cookieInfo.protections.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 p-2 bg-[#fff8e1] rounded text-xs">
            <strong>document.cookie の値:</strong>
            <pre className="m-0 mt-1 font-mono text-[11px] whitespace-pre-wrap break-all">
              {documentCookie || "(空 — HttpOnly の Cookie は表示されません)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function CookieManipulation() {
  const [vulnResult, setVulnResult] = useState<LoginResult | null>(null);
  const [secureResult, setSecureResult] = useState<LoginResult | null>(null);
  const [vulnCookieInfo, setVulnCookieInfo] = useState<CookieInfoResult | null>(null);
  const [secureCookieInfo, setSecureCookieInfo] = useState<CookieInfoResult | null>(null);
  const [documentCookie, setDocumentCookie] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (mode: "vulnerable" | "secure", username: string, password: string) => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/${mode}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (mode === "vulnerable") {
          setVulnResult(data);
          setVulnCookieInfo(null);
        } else {
          setSecureResult(data);
          setSecureCookieInfo(null);
        }
        // document.cookie を読み取って表示
        setDocumentCookie(document.cookie);
      } catch (e) {
        const err = { success: false, message: (e as Error).message };
        if (mode === "vulnerable") setVulnResult(err);
        else setSecureResult(err);
      }
      setLoading(false);
    },
    []
  );

  const handleCheckCookie = useCallback(async (mode: "vulnerable" | "secure") => {
    try {
      const res = await fetch(`${BASE}/${mode}/cookie-info`, {
        credentials: "include",
      });
      const data = await res.json();
      if (mode === "vulnerable") setVulnCookieInfo(data);
      else setSecureCookieInfo(data);
      setDocumentCookie(document.cookie);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LabLayout
      title="Cookie Security Misconfiguration"
      subtitle="Cookie属性の不備が招く複数の攻撃経路"
      description="セッションCookieにHttpOnly・Secure・SameSite属性が設定されていないと、XSSによるセッション窃取、HTTP通信での傍受、CSRF攻撃での自動送信が可能になります。"
    >
      <h3 className="mt-6">Lab: ログインしてCookie属性を比較</h3>
      <p className="text-sm text-[#666]">
        両方のバージョンでログインし、発行されるCookieの属性の違いを確認してください。
        脆弱版では <code>document.cookie</code> でセッションIDが読み取れますが、
        安全版では <code>HttpOnly</code> により読み取れません。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <LoginForm
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onSubmit={handleLogin}
            onCheckCookie={handleCheckCookie}
            cookieInfo={vulnCookieInfo}
            documentCookie={documentCookie}
          />
        }
        secureContent={
          <LoginForm
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onSubmit={handleLogin}
            onCheckCookie={handleCheckCookie}
            cookieInfo={secureCookieInfo}
            documentCookie={documentCookie}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>document.cookie</code> でセッションIDが表示されるか</li>
          <li>安全版: <code>document.cookie</code> にセッションIDが含まれないか</li>
          <li>DevTools → Application → Cookies でHttpOnly列を確認したか</li>
          <li>HttpOnly・Secure・SameSite のそれぞれが防ぐ攻撃は何か説明できるか</li>
          <li>3つの属性をすべて設定する必要がある理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
