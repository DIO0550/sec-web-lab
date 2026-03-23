import { useState, useCallback } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Button } from "@/components/Button";
import { CredentialsFields } from "@/components/CredentialsFields";
import { Alert } from "@/components/Alert";
import { ResultTable } from "@/components/ResultTable";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";
import { postJson } from "@/utils/api";

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

type BruteForceRow = {
  num: number;
  password: string;
  resultLabel: string;
  result: LoginResult;
};

// --- パスワード辞書（デモ用） ---
const PASSWORD_DICTIONARY = [
  "password", "123456", "admin", "admin123", "letmein",
  "welcome", "monkey", "dragon", "master", "qwerty",
];

const loginErrorResult = (e: Error): LoginResult => ({
  success: false,
  message: e.message,
});

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
      <div className="mb-3">
        <CredentialsFields
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? "success" : result?.locked ? "warning" : "error"}
          title={result?.success ? "ログイン成功" : result?.locked ? "アカウントロック" : "ログイン失敗"}
          className="mt-2"
        >
          <div className="text-sm">{result?.message}</div>
          {result?.attemptsUsed !== undefined && (
            <div className="text-xs opacity-70 mt-1">
              試行回数: {result?.attemptsUsed} / {result?.maxAttempts}
            </div>
          )}
        </Alert>
      </ExpandableSection>
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
      <div className="flex gap-2">
        <FetchButton onClick={() => onStart(mode)} disabled={isRunning}>
          辞書攻撃を開始
        </FetchButton>
        {mode === "secure" && onReset && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            リセット
          </Button>
        )}
      </div>

      <div className="text-xs text-text-muted mt-1">
        辞書: [{PASSWORD_DICTIONARY.join(", ")}]
      </div>

      <ExpandableSection isOpen={logs.length > 0}>
        <div className="mt-3 max-h-[300px] overflow-auto">
          <ResultTable<BruteForceRow>
            columns={[
              { key: "num", label: "#" },
              { key: "password", label: "パスワード" },
              { key: "resultLabel", label: "結果" },
            ]}
            data={logs.map((log, i) => ({
              num: i + 1,
              password: log.password,
              resultLabel: "",
              result: log.result,
            }))}
            className="text-xs"
            getRowClassName={(row) =>
              row.result.success ? "bg-success-bg" : row.result.locked ? "bg-warning-bg" : ""
            }
            getCellClassName={(col) =>
              col.key === "password" ? "font-mono" : ""
            }
            renderCell={(col, _value, row) => {
              if (col.key === "resultLabel") {
                if (row.result.success) {
                  return <span className="text-status-ng font-bold">突破成功!</span>;
                }
                if (row.result.locked) {
                  return <span className="text-warning-text">ブロック (429)</span>;
                }
                return <span className="text-text-muted">失敗</span>;
              }
              return undefined;
            }}
          />
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function BruteForce() {
  const login = useComparisonFetch<LoginResult>(BASE);
  const [vulnLogs, setVulnLogs] = useState<BruteForceLog[]>([]);
  const [secureLogs, setSecureLogs] = useState<BruteForceLog[]>([]);
  const [running, setRunning] = useState(false);

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    await login.postJson(mode, "/login", { username, password }, loginErrorResult);
  };

  const runDictionaryAttack = useCallback(async (mode: "vulnerable" | "secure") => {
    setRunning(true);
    const logs: BruteForceLog[] = [];
    if (mode === "vulnerable") {
      setVulnLogs([]);
    } else {
      setSecureLogs([]);
    }

    for (const password of PASSWORD_DICTIONARY) {
      try {
        const data = await postJson<LoginResult>(`${BASE}/${mode}/login`, {
          username: "admin",
          password,
        });
        const log = { password, result: data };
        logs.push(log);

        if (mode === "vulnerable") {
          setVulnLogs([...logs]);
        } else {
          setSecureLogs([...logs]);
        }

        // 成功またはロックされたら停止
        if (data.success || data.locked) {
          break;
        }
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
      login.reset();
    } catch {
      // ignore
    }
  }, [login]);

  return (
    <LabLayout
      title="Brute Force Attack"
      subtitle="パスワード総当たりでログインを突破する"
      description="ログイン試行に回数制限がないアプリケーションに対して、パスワード辞書を使って総当たりで正しいパスワードを見つけ出す攻撃です。"
    >
      <h3 className="mt-6">Lab 1: 手動ログイン試行</h3>
      <p className="text-sm text-text-secondary">
        間違ったパスワードを何度か入力してみてください。
        脆弱版は何度でも試行できますが、安全版は5回で制限されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={login.vulnerable} isLoading={login.loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={login.secure} isLoading={login.loading} onSubmit={handleLogin} />
        }
      />

      <h3 className="mt-8">Lab 2: 辞書攻撃シミュレーション</h3>
      <p className="text-sm text-text-secondary">
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
