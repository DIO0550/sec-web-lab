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
      <div className="mb-3">
        <div className="mb-1">
          <label className="text-[13px] block">ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
            placeholder="testuser"
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
          登録
        </FetchButton>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">弱いパスワード:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {weakPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPassword(p.password)}
              className="text-[11px] py-0.5 px-2 cursor-pointer text-[#c00]"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-1">
          <span className="text-xs text-[#888]">強いパスワード:</span>
          <button
            onClick={() => setPassword(strongPreset.password)}
            className="text-[11px] py-0.5 px-2 cursor-pointer text-[#080] ml-1"
          >
            {strongPreset.label}
          </button>
        </div>
      </div>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "登録成功" : "登録失敗"}
          </div>
          <div className="text-[13px]">{result.message}</div>
          {result._debug && (
            <div className="mt-1 text-[11px] text-[#888]">
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
      <div className="mb-3">
        <label className="text-[13px] block">パスワードを入力:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded flex-1"
          />
          <FetchButton onClick={() => onCheck(password)} disabled={isLoading}>
            チェック
          </FetchButton>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">テスト用パスワード:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {testPasswords.map((p) => (
            <button
              key={p}
              onClick={() => { setPassword(p); onCheck(p); }}
              className="text-[11px] py-0.5 px-2 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-3">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="p-1 border border-[#ddd] text-left">パスワード</th>
                <th className="p-1 border border-[#ddd] text-left">長さ</th>
                <th className="p-1 border border-[#ddd] text-left">判定</th>
                <th className="p-1 border border-[#ddd] text-left">理由</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.valid ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}>
                  <td className="p-1 border border-[#ddd] font-mono">{r.password}</td>
                  <td className="p-1 border border-[#ddd]">{r.length}</td>
                  <td className="p-1 border border-[#ddd]">
                    {r.valid ? <span className="text-[#2e7d32]">OK</span> : <span className="text-[#c62828]">NG</span>}
                  </td>
                  <td className="p-1 border border-[#ddd]">{r.reason ?? "-"}</td>
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
      <h3 className="mt-6">Lab 1: パスワード登録テスト</h3>
      <p className="text-sm text-[#666]">
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

      <h3 className="mt-8">Lab 2: パスワード強度チェッカー</h3>
      <p className="text-sm text-[#666]">
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
