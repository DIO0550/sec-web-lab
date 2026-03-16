import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { postJsonWithCredentials, getJson } from "../../../utils/api";

const BASE = "/api/labs/csrf";

type ApiResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  csrfToken?: string;
};

const apiErrorResult = (e: Error): ApiResult => ({
  success: false,
  message: e.message,
});

// --- 脆弱バージョン ---
function VulnerableDemo() {
  const [loginResult, setLoginResult] = useState<ApiResult | null>(null);
  const [profileResult, setProfileResult] = useState<ApiResult | null>(null);
  const [changeResult, setChangeResult] = useState<ApiResult | null>(null);
  const [newPassword, setNewPassword] = useState("hacked123");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/vulnerable/login`,
        { username: "alice", password: "alice123" }
      );
      setLoginResult(data);
      setProfileResult(null);
      setChangeResult(null);
    } catch (e) {
      setLoginResult(apiErrorResult(e as Error));
    }
    setLoading(false);
  }, []);

  const handleProfile = useCallback(async () => {
    try {
      const data = await getJson<ApiResult>(`${BASE}/vulnerable/profile`, {
        credentials: "include",
      });
      setProfileResult(data);
    } catch {
      // ignore
    }
  }, []);

  // CSRF攻撃をシミュレート: 外部サイトからのリクエストを模倣
  const handleCsrfAttack = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/vulnerable/change-password`,
        { newPassword }
      );
      setChangeResult(data);
      // プロフィールを再取得してパスワードが変わったことを確認
      handleProfile();
    } catch (e) {
      setChangeResult(apiErrorResult(e as Error));
    }
    setLoading(false);
  }, [newPassword, handleProfile]);

  return (
    <div>
      <FetchButton onClick={handleLogin} disabled={loading}>
        alice でログイン
      </FetchButton>

      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.success ? "success" : "error"}
          className="mt-2 text-xs"
        >
          {loginResult?.message}
        </Alert>
      </ExpandableSection>

      <ExpandableSection isOpen={!!loginResult?.success}>
        <>
          <div className="mt-3">
            <FetchButton onClick={handleProfile} disabled={loading}>
              プロフィール確認
            </FetchButton>
            <ExpandableSection isOpen={!!profileResult}>
              <div className="mt-1 p-2 bg-bg-secondary rounded text-xs">
                <div>ユーザー: {profileResult?.username}</div>
                <div>メール: {profileResult?.email}</div>
                <div>現在のパスワード: <code>{profileResult?.currentPassword}</code></div>
              </div>
            </ExpandableSection>
          </div>

          <Alert variant="warning" className="mt-3">
            <div className="text-xs font-bold mb-1">
              CSRF攻撃シミュレーション（罠ページからのリクエスト）
            </div>
            <Input
              label="攻撃者が変更するパスワード"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-2"
            />
            <FetchButton onClick={handleCsrfAttack} disabled={loading}>
              CSRF攻撃を実行（CSRFトークンなし）
            </FetchButton>

            <ExpandableSection isOpen={!!changeResult}>
              <Alert
                variant={changeResult?.success ? "error" : "success"}
                title={changeResult?.success ? "攻撃成功!" : "攻撃失敗"}
                className="mt-2 text-xs"
              >
                {changeResult?.message}
              </Alert>
            </ExpandableSection>
          </Alert>
        </>
      </ExpandableSection>
    </div>
  );
}

// --- 安全バージョン ---
function SecureDemo() {
  const [loginResult, setLoginResult] = useState<ApiResult | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [changeResult, setChangeResult] = useState<ApiResult | null>(null);
  const [attackResult, setAttackResult] = useState<ApiResult | null>(null);
  const [newPassword, setNewPassword] = useState("newpassword123");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/secure/login`,
        { username: "alice", password: "alice123" }
      );
      setLoginResult(data);
      setChangeResult(null);
      setAttackResult(null);
      setCsrfToken("");
    } catch (e) {
      setLoginResult(apiErrorResult(e as Error));
    }
    setLoading(false);
  }, []);

  const handleGetToken = useCallback(async () => {
    try {
      const data = await getJson<ApiResult>(`${BASE}/secure/csrf-token`, {
        credentials: "include",
      });
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch {
      // ignore
    }
  }, []);

  // 正規のパスワード変更（CSRFトークン付き）
  const handleLegitChange = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/secure/change-password`,
        { newPassword, csrfToken }
      );
      setChangeResult(data);
    } catch (e) {
      setChangeResult(apiErrorResult(e as Error));
    }
    setLoading(false);
  }, [newPassword, csrfToken]);

  // CSRF攻撃を試みる（トークンなし）
  const handleCsrfAttack = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/secure/change-password`,
        { newPassword: "hacked123" }
      );
      setAttackResult(data);
    } catch (e) {
      setAttackResult(apiErrorResult(e as Error));
    }
    setLoading(false);
  }, []);

  return (
    <div>
      <FetchButton onClick={handleLogin} disabled={loading}>
        alice でログイン
      </FetchButton>

      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.success ? "success" : "error"}
          className="mt-2 text-xs"
        >
          {loginResult?.message}
        </Alert>
      </ExpandableSection>

      <ExpandableSection isOpen={!!loginResult?.success}>
        <>
          {/* 正規のパスワード変更フロー */}
          <Alert variant="success" className="mt-3">
            <div className="text-xs font-bold mb-1">
              正規のパスワード変更（CSRFトークン付き）
            </div>
            <div className="flex gap-2 mb-2">
              <FetchButton onClick={handleGetToken} disabled={loading}>
                CSRFトークンを取得
              </FetchButton>
            </div>
            <ExpandableSection isOpen={!!csrfToken}>
              <div className="p-1 bg-bg-secondary rounded text-[11px] font-mono mb-2 break-all">
                Token: {csrfToken}
              </div>
            </ExpandableSection>
            <Input
              label="新しいパスワード"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-2"
            />
            <FetchButton
              onClick={handleLegitChange}
              disabled={loading || !csrfToken}
            >
              パスワード変更（トークン付き）
            </FetchButton>
            <ExpandableSection isOpen={!!changeResult}>
              <Alert
                variant={changeResult?.success ? "success" : "error"}
                className="mt-2 text-xs"
              >
                {changeResult?.message}
              </Alert>
            </ExpandableSection>
          </Alert>

          {/* CSRF攻撃の試行 */}
          <Alert variant="warning" className="mt-3">
            <div className="text-xs font-bold mb-1">
              CSRF攻撃シミュレーション（トークンなし）
            </div>
            <FetchButton onClick={handleCsrfAttack} disabled={loading}>
              CSRF攻撃を実行（トークンなしで送信）
            </FetchButton>
            <ExpandableSection isOpen={!!attackResult}>
              <Alert
                variant={attackResult?.success ? "error" : "success"}
                title={attackResult?.success ? "攻撃成功（問題あり）" : "攻撃失敗（防御成功）"}
                className="mt-2 text-xs"
              >
                {attackResult?.message}
              </Alert>
            </ExpandableSection>
          </Alert>
        </>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function Csrf() {
  const handleReset = useCallback(async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  return (
    <LabLayout
      title="Cross-Site Request Forgery (CSRF)"
      subtitle="被害者のブラウザを使って勝手にリクエストを送る"
      description="ログイン中のユーザーが攻撃者の用意した罠ページを開くだけで、パスワード変更などの操作が本人の意図なく実行されてしまう脆弱性です。CSRFトークンによるリクエスト検証で防御します。"
    >
      <div className="mt-2">
        <Button variant="secondary" size="sm" onClick={handleReset}>
          全データリセット
        </Button>
      </div>

      <h3 className="mt-4">Lab: CSRF攻撃によるパスワード変更</h3>
      <p className="text-sm text-text-secondary">
        脆弱版ではCSRFトークンなしでパスワード変更が成功します（外部サイトからのリクエストでも成功する）。
        安全版ではCSRFトークンが必要で、トークンなしのリクエストは拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<VulnerableDemo />}
        secureContent={<SecureDemo />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CSRFトークンなしでパスワード変更が成功するか</li>
          <li>安全版: CSRFトークンなしだと403エラーで拒否されるか</li>
          <li>安全版: CSRFトークン付きなら正常に変更できるか</li>
          <li>CSRF攻撃が成立するための3つの条件を説明できるか</li>
          <li>CSRFトークンが攻撃を無効化する仕組みを理解したか</li>
          <li><code>SameSite=Strict</code> がCSRF防御に有効な理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
