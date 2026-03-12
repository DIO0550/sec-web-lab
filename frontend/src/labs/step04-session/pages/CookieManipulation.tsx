import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";
import { getJson } from "../../../utils/api";

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
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-1"
        />
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-1"
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      {result && (
        <Alert
          variant={result.success ? "success" : "error"}
          title={result.success ? "ログイン成功" : "ログイン失敗"}
          className="mt-2"
        >
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
        </Alert>
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
  const login = useComparisonFetch<LoginResult>(BASE);
  const [vulnCookieInfo, setVulnCookieInfo] = useState<CookieInfoResult | null>(null);
  const [secureCookieInfo, setSecureCookieInfo] = useState<CookieInfoResult | null>(null);
  const [documentCookie, setDocumentCookie] = useState("");

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    if (mode === "vulnerable") setVulnCookieInfo(null);
    else setSecureCookieInfo(null);

    await login.run(
      mode,
      "/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      },
      (e) => ({ success: false, message: e.message }),
    );
    // document.cookie を読み取って表示
    setDocumentCookie(document.cookie);
  };

  const handleCheckCookie = async (mode: "vulnerable" | "secure") => {
    try {
      const data = await getJson<CookieInfoResult>(`${BASE}/${mode}/cookie-info`, {
        credentials: "include",
      });
      if (mode === "vulnerable") setVulnCookieInfo(data);
      else setSecureCookieInfo(data);
      setDocumentCookie(document.cookie);
    } catch {
      // ignore
    }
  };

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
            result={login.vulnerable}
            isLoading={login.loading}
            onSubmit={handleLogin}
            onCheckCookie={handleCheckCookie}
            cookieInfo={vulnCookieInfo}
            documentCookie={documentCookie}
          />
        }
        secureContent={
          <LoginForm
            mode="secure"
            result={login.secure}
            isLoading={login.loading}
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
