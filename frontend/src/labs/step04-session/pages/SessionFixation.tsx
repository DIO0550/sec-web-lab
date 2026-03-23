import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { ExpandableSection } from "@/components/ExpandableSection";
import { postJsonWithCredentials, getJson } from "@/utils/api";

const BASE = "/api/labs/session-fixation";

type ApiResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  warning?: string;
  info?: string;
  username?: string;
  userId?: number;
};

// --- 脆弱バージョンのデモ ---
function VulnerableDemo() {
  const [step, setStep] = useState(0);
  const [fixedSessionId, setFixedSessionId] = useState("attacker-fixed-session");
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: ApiResult) => {
    setResults((prev) => [...prev, result]);
  };

  // Step 1: 攻撃者がセッションIDを仕込む
  const handleSetSession = async () => {
    setLoading(true);
    setResults([]);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/vulnerable/set-session`,
        { sessionId: fixedSessionId },
      );
      addResult({ ...data, message: `[攻撃者] ${data.message}` });
      setStep(1);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  // Step 2: 被害者がそのセッションIDでログイン
  const handleVictimLogin = async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/vulnerable/login`,
        { username: "alice", password: "alice123" },
      );
      addResult({ ...data, message: `[被害者] ${data.message}` });
      setStep(2);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  // Step 3: 攻撃者が同じセッションIDでプロフィール取得
  const handleAttackerAccess = async () => {
    setLoading(true);
    try {
      const data = await getJson<ApiResult>(`${BASE}/vulnerable/profile`, {
        credentials: "include",
      });
      addResult({
        ...data,
        message: `[攻撃者] ${data.success ? `${data.username} のプロフィールにアクセス成功!` : data.message}`,
      });
      setStep(3);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
      await fetch(`${BASE}/vulnerable/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setStep(0);
    setResults([]);
  };

  return (
    <div>
      <Input
        label="攻撃者が仕込むセッションID"
        type="text"
        value={fixedSessionId}
        onChange={(e) => setFixedSessionId(e.target.value)}
        className="mb-3 font-mono text-xs"
      />

      <div className="flex flex-col gap-2">
        <FetchButton onClick={handleSetSession} disabled={loading || step >= 1}>
          Step 1: 攻撃者がセッションIDを仕込む
        </FetchButton>
        <FetchButton onClick={handleVictimLogin} disabled={loading || step < 1 || step >= 2}>
          Step 2: 被害者がログイン (alice)
        </FetchButton>
        <FetchButton onClick={handleAttackerAccess} disabled={loading || step < 2 || step >= 3}>
          Step 3: 攻撃者がアクセス
        </FetchButton>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          リセット
        </Button>
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className="mt-3">
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? "success" : "error"}
              className="mb-1 text-xs"
            >
              <div className="font-bold">{r.message}</div>
              {r.sessionId && (
                <div className="font-mono text-xs opacity-70">
                  SessionID: {r.sessionId}
                </div>
              )}
              {r.warning && <div className="text-warning-text">{r.warning}</div>}
              {r.username && r.success && i === results.length - 1 && (
                <div className="text-status-ng font-bold mt-1">
                  セッション乗っ取り成功! {r.username} としてアクセスできました
                </div>
              )}
            </Alert>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- 安全バージョンのデモ ---
function SecureDemo() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: ApiResult) => {
    setResults((prev) => [...prev, result]);
  };

  // Step 1: 被害者が安全版でログイン（新しいセッションIDが生成される）
  const handleLogin = async () => {
    setLoading(true);
    setResults([]);
    try {
      const data = await postJsonWithCredentials<ApiResult>(
        `${BASE}/secure/login`,
        { username: "alice", password: "alice123" },
      );
      addResult({ ...data, message: `[被害者] ${data.message}` });
      setStep(1);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  // Step 2: プロフィールが取得できることを確認
  const handleProfile = async () => {
    setLoading(true);
    try {
      const data = await getJson<ApiResult>(`${BASE}/secure/profile`, {
        credentials: "include",
      });
      addResult({
        ...data,
        message: data.success
          ? `[確認] ${data.username} のプロフィールを取得`
          : `[確認] ${data.message}`,
      });
      setStep(2);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
      await fetch(`${BASE}/secure/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setStep(0);
    setResults([]);
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <FetchButton onClick={handleLogin} disabled={loading || step >= 1}>
          Step 1: ログイン (alice) — 新しいセッションIDが生成
        </FetchButton>
        <FetchButton onClick={handleProfile} disabled={loading || step < 1 || step >= 2}>
          Step 2: プロフィールを確認
        </FetchButton>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          リセット
        </Button>
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className="mt-3">
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? "success" : "error"}
              className="mb-1 text-xs"
            >
              <div className="font-bold">{r.message}</div>
              {r.info && <div className="text-status-ok">{r.info}</div>}
            </Alert>
          ))}
        </div>
      </ExpandableSection>

      <Alert variant="info" className="mt-3 text-xs">
        <strong>ポイント:</strong> ログイン時に新しいセッションIDが生成され、古いIDは無効化されます。
        攻撃者が事前に仕込んだセッションIDは、ログイン後に使えなくなります。
      </Alert>
    </div>
  );
}

// --- メインコンポーネント ---
export function SessionFixation() {
  return (
    <LabLayout
      title="Session Fixation"
      subtitle="攻撃者が仕込んだセッションIDで被害者をログインさせる"
      description="ログイン時にセッションIDを再生成しないと、攻撃者が事前に指定したセッションIDのまま認証が成立し、セッションを乗っ取られます。"
    >
      <h3 className="mt-6">Lab: セッション固定攻撃のシミュレーション</h3>
      <p className="text-sm text-text-secondary">
        脆弱版では攻撃者が仕込んだセッションIDがそのまま使われ、ログイン後に攻撃者がアクセスできます。
        安全版ではログイン時に新しいセッションIDが生成されるため、攻撃が失敗します。
      </p>

      <ComparisonPanel
        vulnerableContent={<VulnerableDemo />}
        secureContent={<SecureDemo />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 攻撃者が仕込んだセッションIDでログイン後もアクセスできるか</li>
          <li>安全版: ログイン時にセッションIDが変更されるか</li>
          <li>セッション固定攻撃が成立するための条件を説明できるか</li>
          <li>セッションIDの再生成がなぜこの攻撃を防げるのか理解したか</li>
          <li>セッション固定とセッションハイジャックの違いを説明できるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
