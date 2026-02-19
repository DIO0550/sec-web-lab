import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
  const handleSetSession = useCallback(async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${BASE}/vulnerable/set-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: fixedSessionId }),
      });
      const data = await res.json();
      addResult({ ...data, message: `[攻撃者] ${data.message}` });
      setStep(1);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, [fixedSessionId]);

  // Step 2: 被害者がそのセッションIDでログイン
  const handleVictimLogin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: "alice", password: "alice123" }),
      });
      const data = await res.json();
      addResult({ ...data, message: `[被害者] ${data.message}` });
      setStep(2);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  // Step 3: 攻撃者が同じセッションIDでプロフィール取得
  const handleAttackerAccess = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      addResult({
        ...data,
        message: `[攻撃者] ${data.success ? `${data.username} のプロフィールにアクセス成功!` : data.message}`,
      });
      setStep(3);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
      await fetch(`${BASE}/vulnerable/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setStep(0);
    setResults([]);
  }, []);

  return (
    <div>
      <div className="mb-3">
        <label className="text-[13px] block">攻撃者が仕込むセッションID:</label>
        <input
          type="text"
          value={fixedSessionId}
          onChange={(e) => setFixedSessionId(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full font-mono text-xs"
        />
      </div>

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
        <button onClick={handleReset} className="text-xs p-1 cursor-pointer">
          リセット
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-3">
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-2 mb-1 rounded text-xs ${
                r.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"
              }`}
            >
              <div className="font-bold">{r.message}</div>
              {r.sessionId && (
                <div className="font-mono text-[11px] text-[#666]">
                  SessionID: {r.sessionId}
                </div>
              )}
              {r.warning && <div className="text-[#e65100]">{r.warning}</div>}
              {r.username && r.success && i === results.length - 1 && (
                <div className="text-[#c00] font-bold mt-1">
                  セッション乗っ取り成功! {r.username} としてアクセスできました
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
  const handleLogin = useCallback(async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${BASE}/secure/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: "alice", password: "alice123" }),
      });
      const data = await res.json();
      addResult({ ...data, message: `[被害者] ${data.message}` });
      setStep(1);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  // Step 2: プロフィールが取得できることを確認
  const handleProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/secure/profile`, {
        credentials: "include",
      });
      const data = await res.json();
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
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
      await fetch(`${BASE}/secure/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setStep(0);
    setResults([]);
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <FetchButton onClick={handleLogin} disabled={loading || step >= 1}>
          Step 1: ログイン (alice) — 新しいセッションIDが生成
        </FetchButton>
        <FetchButton onClick={handleProfile} disabled={loading || step < 1 || step >= 2}>
          Step 2: プロフィールを確認
        </FetchButton>
        <button onClick={handleReset} className="text-xs p-1 cursor-pointer">
          リセット
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-3">
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-2 mb-1 rounded text-xs ${
                r.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"
              }`}
            >
              <div className="font-bold">{r.message}</div>
              {r.info && <div className="text-[#080]">{r.info}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 p-2 bg-[#f5f5f5] rounded text-xs">
        <strong>ポイント:</strong> ログイン時に新しいセッションIDが生成され、古いIDは無効化されます。
        攻撃者が事前に仕込んだセッションIDは、ログイン後に使えなくなります。
      </div>
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
      <p className="text-sm text-[#666]">
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
