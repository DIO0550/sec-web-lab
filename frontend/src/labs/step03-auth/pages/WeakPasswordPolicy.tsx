import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";
import { PresetButtons } from "@/components/PresetButtons";
import { postJson } from "../../../utils/api";

const BASE = "/api/labs/weak-password-policy";

type RegisterResult = {
  success: boolean;
  message?: string;
  _debug?: { passwordLength: number; message: string };
};

type StrengthResult = {
  password: string;
  length: number;
  valid: boolean;
  reason?: string;
};

const weakPresets = [
  { label: "123456", password: "123456" },
  { label: "password", password: "password" },
  { label: "a", password: "a" },
  { label: "admin123", password: "admin123" },
];

const strongPreset = { label: "MyStr0ngPass!", password: "MyStr0ngPass!" };

const testPasswords = [
  { label: "123456" },
  { label: "password" },
  { label: "abc" },
  { label: "12345678" },
  { label: "Password1" },
  { label: "MyStr0ng!" },
  { label: "MyStr0ngPass!" },
];

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

  return (
    <div>
      <div className="mb-3">
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="testuser"
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
          登録
        </FetchButton>
      </div>

      <div className="mb-3">
        <span className="text-xs text-text-secondary">弱いパスワード:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {weakPresets.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              onClick={() => setPassword(p.password)}
              className="text-status-ng"
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="mt-1">
          <span className="text-xs text-text-secondary">強いパスワード:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPassword(strongPreset.password)}
            className="text-status-ok ml-1"
          >
            {strongPreset.label}
          </Button>
        </div>
      </div>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? "success" : "error"}
          title={result?.success ? "登録成功" : "登録失敗"}
          className="mt-2"
        >
          <div className="text-[13px]">{result?.message}</div>
          {result?._debug && (
            <div className="mt-1 text-[11px] opacity-70">
              {result?._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
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

  return (
    <div>
      <div className="mb-3">
        <div className="flex gap-2 items-end">
          <Input
            label="パスワードを入力"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1"
          />
          <FetchButton onClick={() => onCheck(password)} disabled={isLoading}>
            チェック
          </FetchButton>
        </div>
      </div>

      <PresetButtons
        presets={testPasswords}
        onSelect={(p) => { setPassword(p.label); onCheck(p.label); }}
        className="mb-3"
      />

      <ExpandableSection isOpen={results.length > 0}>
        <div className="mt-3">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-code-bg">
                <th className="p-1 border border-table-border text-left">パスワード</th>
                <th className="p-1 border border-table-border text-left">長さ</th>
                <th className="p-1 border border-table-border text-left">判定</th>
                <th className="p-1 border border-table-border text-left">理由</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.valid ? "bg-success-bg" : "bg-error-bg-light"}>
                  <td className="p-1 border border-table-border font-mono">{r.password}</td>
                  <td className="p-1 border border-table-border">{r.length}</td>
                  <td className="p-1 border border-table-border">
                    {r.valid ? <span className="text-success-text">OK</span> : <span className="text-error-text-light">NG</span>}
                  </td>
                  <td className="p-1 border border-table-border">{r.reason ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function WeakPasswordPolicy() {
  const register = useComparisonFetch<RegisterResult>(BASE);
  const [strengthResults, setStrengthResults] = useState<StrengthResult[]>([]);
  const [loading, setLoading] = useState(false);

  // ユーザー名にタイムスタンプを付与して重複を回避
  const generateUsername = (base: string, mode: string) => `${base}_${mode}_${Date.now()}`;

  const handleRegister = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    const uniqueUsername = username || generateUsername("test", mode);
    await register.postJson(mode, "/register", { username: uniqueUsername, password }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  const checkStrength = async (password: string) => {
    setLoading(true);
    try {
      const data = await postJson<StrengthResult>(`${BASE}/secure/check-strength`, { password });
      setStrengthResults((prev) => [data, ...prev]);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const isLoading = register.loading || loading;

  return (
    <LabLayout
      title="Weak Password Policy"
      subtitle="弱いパスワードの登録を許してしまう"
      description="パスワード強度チェックがないと、123456 や password のような極めて弱いパスワードが登録でき、辞書攻撃で瞬時に突破されます。"
    >
      <h3 className="mt-6">Lab 1: パスワード登録テスト</h3>
      <p className="text-sm text-text-secondary">
        弱いパスワード（<code>123456</code>, <code>a</code> 等）で登録を試みてください。
        脆弱版は何でも受け付けますが、安全版は強度チェックで拒否します。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <RegisterForm mode="vulnerable" result={register.vulnerable} isLoading={isLoading} onSubmit={handleRegister} />
        }
        secureContent={
          <RegisterForm mode="secure" result={register.secure} isLoading={isLoading} onSubmit={handleRegister} />
        }
      />

      <h3 className="mt-8">Lab 2: パスワード強度チェッカー</h3>
      <p className="text-sm text-text-secondary">
        様々なパスワードの強度をチェックしてみてください。
        安全版では8文字以上・大文字小文字数字・ブラックリスト照合の3段階チェックが行われます。
      </p>
      <StrengthChecker results={strengthResults} isLoading={isLoading} onCheck={checkStrength} />

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
