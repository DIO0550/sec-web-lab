import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/brute-force";

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  locked?: boolean;
  remainingSeconds?: number;
  attemptsUsed?: number;
  maxAttempts?: number;
};

type BruteForceLog = {
  password: string;
  result: LoginResult;
};

// --- パスワード辞書（デモ用） ---
const PASSWORD_DICTIONARY = [
  "password", "123456", "admin", "admin123", "letmein",
  "welcome", "monkey", "dragon", "master", "qwerty",
];

// --- 単発ログインフォーム ---
function LoginForm({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: "vulnerable" | "secure";
  result: LoginResult | null;
  isLoading: boolean;
  onSubmit: (mode: "vulnerable" | "secure", username: string, password: string) => void;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>パスワード:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      {result && (
        <div style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 4,
          background: result.success ? "#e8f5e9" : result.locked ? "#fff3e0" : "#ffebee",
          border: `1px solid ${result.success ? "#4caf50" : result.locked ? "#ff9800" : "#f44336"}`,
        }}>
          <div style={{ fontWeight: "bold", color: result.success ? "#2e7d32" : result.locked ? "#e65100" : "#c62828" }}>
            {result.success ? "ログイン成功" : result.locked ? "アカウントロック" : "ログイン失敗"}
          </div>
          <div style={{ fontSize: 13 }}>{result.message}</div>
          {result.attemptsUsed !== undefined && (
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              試行回数: {result.attemptsUsed} / {result.maxAttempts}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- 辞書攻撃シミュレーション ---
function DictionaryAttack({
  mode,
  logs,
  isRunning,
  onStart,
  onReset,
}: {
  mode: "vulnerable" | "secure";
  logs: BruteForceLog[];
  isRunning: boolean;
  onStart: (mode: "vulnerable" | "secure") => void;
  onReset?: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <FetchButton onClick={() => onStart(mode)} disabled={isRunning}>
          辞書攻撃を開始
        </FetchButton>
        {mode === "secure" && onReset && (
          <button
            onClick={onReset}
            style={{ fontSize: 12, padding: "4px 8px", cursor: "pointer" }}
          >
            リセット
          </button>
        )}
      </div>

      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
        辞書: [{PASSWORD_DICTIONARY.join(", ")}]
      </div>

      {logs.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 300, overflow: "auto" }}>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>#</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>パスワード</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>結果</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{
                  background: log.result.success ? "#e8f5e9" : log.result.locked ? "#fff3e0" : "transparent",
                }}>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{i + 1}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd", fontFamily: "monospace" }}>
                    {log.password}
                  </td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>
                    {log.result.success ? (
                      <span style={{ color: "#c00", fontWeight: "bold" }}>突破成功!</span>
                    ) : log.result.locked ? (
                      <span style={{ color: "#e65100" }}>ブロック (429)</span>
                    ) : (
                      <span style={{ color: "#888" }}>失敗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function BruteForce() {
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [vulnLogs, setVulnLogs] = useState<BruteForceLog[]>([]);
  const [secureLogs, setSecureLogs] = useState<BruteForceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (mode === "vulnerable") setVulnLogin(data);
      else setSecureLogin(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnLogin(err);
      else setSecureLogin(err);
    }
    setLoading(false);
  }, []);

  const runDictionaryAttack = useCallback(async (mode: "vulnerable" | "secure") => {
    setRunning(true);
    const logs: BruteForceLog[] = [];
    if (mode === "vulnerable") setVulnLogs([]);
    else setSecureLogs([]);

    for (const password of PASSWORD_DICTIONARY) {
      try {
        const res = await fetch(`${BASE}/${mode}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password }),
        });
        const data: LoginResult = await res.json();
        const log = { password, result: data };
        logs.push(log);

        if (mode === "vulnerable") setVulnLogs([...logs]);
        else setSecureLogs([...logs]);

        // 成功またはロックされたら停止
        if (data.success || data.locked) break;
      } catch (e) {
        logs.push({
          password,
          result: { success: false, message: (e as Error).message },
        });
      }
    }
    setRunning(false);
  }, []);

  const resetSecure = useCallback(async () => {
    try {
      await fetch(`${BASE}/secure/reset`, { method: "POST" });
      setSecureLogs([]);
      setSecureLogin(null);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LabLayout
      title="Brute Force Attack"
      subtitle="パスワード総当たりでログインを突破する"
      description="ログイン試行に回数制限がないアプリケーションに対して、パスワード辞書を使って総当たりで正しいパスワードを見つけ出す攻撃です。"
    >
      <h3 style={{ marginTop: 24 }}>Lab 1: 手動ログイン試行</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        間違ったパスワードを何度か入力してみてください。
        脆弱版は何度でも試行できますが、安全版は5回で制限されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnLogin} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={secureLogin} isLoading={loading} onSubmit={handleLogin} />
        }
      />

      <h3 style={{ marginTop: 32 }}>Lab 2: 辞書攻撃シミュレーション</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        パスワード辞書を使った自動攻撃をシミュレーションします。
        脆弱版では <code>admin123</code> が見つかるまで全候補を試行でき、
        安全版ではレート制限によりブロックされます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <DictionaryAttack mode="vulnerable" logs={vulnLogs} isRunning={running} onStart={runDictionaryAttack} />
        }
        secureContent={
          <DictionaryAttack mode="secure" logs={secureLogs} isRunning={running} onStart={runDictionaryAttack} onReset={resetSecure} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 何度でもログイン試行できるか</li>
          <li>安全版: 5回失敗後にHTTP 429でブロックされるか</li>
          <li>辞書攻撃で脆弱版の <code>admin123</code> が数回の試行で突破されるか</li>
          <li>安全版のレート制限が辞書攻撃を途中でブロックするか</li>
          <li>レート制限だけでは不十分な場合（IPを変えた攻撃等）を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
