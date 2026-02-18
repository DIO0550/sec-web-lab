import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/weak-password-policy";

type RegisterResult = {
  success: boolean;
  message?: string;
  _debug?: { passwordLength: number; message: string };
};

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
};

type StrengthResult = {
  password: string;
  length: number;
  valid: boolean;
  reason?: string;
};

// --- 登録フォーム ---
function RegisterForm({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: "vulnerable" | "secure";
  result: RegisterResult | null;
  isLoading: boolean;
  onSubmit: (mode: "vulnerable" | "secure", username: string, password: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const weakPresets = [
    { label: "123456", password: "123456" },
    { label: "password", password: "password" },
    { label: "a", password: "a" },
    { label: "admin123", password: "admin123" },
  ];

  const strongPreset = { label: "MyStr0ngPass!", password: "MyStr0ngPass!" };

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
            placeholder="testuser"
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
          登録
        </FetchButton>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>弱いパスワード:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {weakPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPassword(p.password)}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer", color: "#c00" }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 4 }}>
          <span style={{ fontSize: 12, color: "#888" }}>強いパスワード:</span>
          <button
            onClick={() => setPassword(strongPreset.password)}
            style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer", color: "#080", marginLeft: 4 }}
          >
            {strongPreset.label}
          </button>
        </div>
      </div>

      {result && (
        <div style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 4,
          background: result.success ? "#e8f5e9" : "#ffebee",
          border: `1px solid ${result.success ? "#4caf50" : "#f44336"}`,
        }}>
          <div style={{ fontWeight: "bold", color: result.success ? "#2e7d32" : "#c62828" }}>
            {result.success ? "登録成功" : "登録失敗"}
          </div>
          <div style={{ fontSize: 13 }}>{result.message}</div>
          {result._debug && (
            <div style={{ marginTop: 4, fontSize: 11, color: "#888" }}>
              {result._debug.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- パスワード強度チェッカー ---
function StrengthChecker({
  results,
  isLoading,
  onCheck,
}: {
  results: StrengthResult[];
  isLoading: boolean;
  onCheck: (password: string) => void;
}) {
  const [password, setPassword] = useState("");

  const testPasswords = [
    "123456", "password", "abc", "12345678",
    "Password1", "MyStr0ng!", "MyStr0ngPass!",
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, display: "block" }}>パスワードを入力:</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, flex: 1 }}
          />
          <FetchButton onClick={() => onCheck(password)} disabled={isLoading}>
            チェック
          </FetchButton>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>テスト用パスワード:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {testPasswords.map((p) => (
            <button
              key={p}
              onClick={() => { setPassword(p); onCheck(p); }}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>パスワード</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>長さ</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>判定</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>理由</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ background: r.valid ? "#e8f5e9" : "#ffebee" }}>
                  <td style={{ padding: 4, border: "1px solid #ddd", fontFamily: "monospace" }}>{r.password}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{r.length}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>
                    {r.valid ? <span style={{ color: "#2e7d32" }}>OK</span> : <span style={{ color: "#c62828" }}>NG</span>}
                  </td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{r.reason ?? "-"}</td>
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
export function WeakPasswordPolicy() {
  const [vulnRegister, setVulnRegister] = useState<RegisterResult | null>(null);
  const [secureRegister, setSecureRegister] = useState<RegisterResult | null>(null);
  const [strengthResults, setStrengthResults] = useState<StrengthResult[]>([]);
  const [loading, setLoading] = useState(false);

  // ユーザー名にタイムスタンプを付与して重複を回避
  const generateUsername = (base: string, mode: string) => `${base}_${mode}_${Date.now()}`;

  const handleRegister = useCallback(async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    const uniqueUsername = username || generateUsername("test", mode);
    try {
      const res = await fetch(`${BASE}/${mode}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uniqueUsername, password }),
      });
      const data = await res.json();
      if (mode === "vulnerable") setVulnRegister(data);
      else setSecureRegister(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnRegister(err);
      else setSecureRegister(err);
    }
    setLoading(false);
  }, []);

  const checkStrength = useCallback(async (password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/secure/check-strength`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data: StrengthResult = await res.json();
      setStrengthResults((prev) => [data, ...prev]);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="Weak Password Policy"
      subtitle="弱いパスワードの登録を許してしまう"
      description="パスワード強度チェックがないと、123456 や password のような極めて弱いパスワードが登録でき、辞書攻撃で瞬時に突破されます。"
    >
      <h3 style={{ marginTop: 24 }}>Lab 1: パスワード登録テスト</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        弱いパスワード（<code>123456</code>, <code>a</code> 等）で登録を試みてください。
        脆弱版は何でも受け付けますが、安全版は強度チェックで拒否します。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <RegisterForm mode="vulnerable" result={vulnRegister} isLoading={loading} onSubmit={handleRegister} />
        }
        secureContent={
          <RegisterForm mode="secure" result={secureRegister} isLoading={loading} onSubmit={handleRegister} />
        }
      />

      <h3 style={{ marginTop: 32 }}>Lab 2: パスワード強度チェッカー</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        様々なパスワードの強度をチェックしてみてください。
        安全版では8文字以上・大文字小文字数字・ブラックリスト照合の3段階チェックが行われます。
      </p>
      <StrengthChecker results={strengthResults} isLoading={loading} onCheck={checkStrength} />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>123456</code> や <code>a</code> がそのまま登録できるか</li>
          <li>安全版: 弱いパスワードが具体的な理由とともに拒否されるか</li>
          <li>「8文字以上」だけでは <code>password</code> を防げないことを理解したか</li>
          <li>ブラックリスト照合がなぜ必要か理解したか</li>
          <li>強いパスワード（<code>MyStr0ngPass!</code>等）が安全版で登録できるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
