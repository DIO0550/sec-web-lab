import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Button } from "@/components/Button";
import { Alert } from "@/components/Alert";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/weak-hash";

type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
  hashAlgorithm: string;
};

type UsersResult = {
  users: User[];
  _debug?: { message: string; hint?: string };
  error?: string;
};

type CrackResult = {
  success: boolean;
  hash: string;
  password?: string;
  method?: string;
  message?: string;
  _debug?: { message?: string; hint?: string; reasons?: string[] };
};

// --- ユーザー一覧パネル ---
function UsersPanel({
  mode,
  result,
  isLoading,
  onFetch,
  onCrack,
}: {
  mode: "vulnerable" | "secure";
  result: UsersResult | null;
  isLoading: boolean;
  onFetch: () => void;
  onCrack: (hash: string) => void;
}) {
  return (
    <div>
      <FetchButton onClick={onFetch} disabled={isLoading}>
        ユーザー一覧を取得
      </FetchButton>

      {result?.error && (
        <pre className="text-xs text-status-ng mt-2">{result.error}</pre>
      )}

      <ExpandableSection isOpen={!!result?.users}>
        <div className="mt-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-code-bg">
                <th className="p-1 border border-table-border text-left">username</th>
                <th className="p-1 border border-table-border text-left">password (hash)</th>
                <th className="p-1 border border-table-border text-left">algorithm</th>
                <th className="p-1 border border-table-border text-left">action</th>
              </tr>
            </thead>
            <tbody>
              {result?.users.map((u) => (
                <tr key={u.id}>
                  <td className="p-1 border border-table-border">{u.username}</td>
                  <td className={`p-1 border border-table-border font-mono text-xs break-all ${mode === "vulnerable" ? "bg-warning-bg" : "bg-success-bg"}`}>
                    {u.password}
                  </td>
                  <td className="p-1 border border-table-border text-xs">{u.hashAlgorithm}</td>
                  <td className="p-1 border border-table-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCrack(u.password)}
                    >
                      逆引き
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              {result?._debug.message}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- 逆引き結果パネル ---
function CrackPanel({
  result,
}: {
  result: CrackResult | null;
}) {
  if (!result) {
    return null;
  }

  return (
    <Alert
      variant={result.success ? "error" : "success"}
      title={result.success ? "逆引き成功（パスワード判明）" : "逆引き失敗（パスワード保護）"}
      className="mt-3"
    >
      <div className="text-xs mt-1">
        <div>ハッシュ: <code className="text-xs break-all">{result.hash}</code></div>
        {result.password && (
          <div className="mt-1">
            パスワード: <strong className="text-status-ng">{result.password}</strong>
          </div>
        )}
        {result.method && <div className="mt-1">手法: {result.method}</div>}
        {result.message && <div className="mt-1 opacity-70">{result.message}</div>}
        {result._debug?.reasons && (
          <ul className="mt-2 text-xs opacity-70">
            {result._debug.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        )}
      </div>
    </Alert>
  );
}

// --- メインコンポーネント ---
export function WeakHash() {
  const users = useComparisonFetch<UsersResult>(BASE);
  const crackResult = useComparisonFetch<CrackResult>(BASE);

  const fetchUsers = async (mode: "vulnerable" | "secure") => {
    await users.run(mode, "/users", undefined, (e) => ({
      users: [],
      error: e.message,
    }));
  };

  const crack = async (mode: "vulnerable" | "secure", hash: string) => {
    await crackResult.run(mode, `/crack?hash=${encodeURIComponent(hash)}`, undefined, (e) => ({
      success: false,
      hash,
      message: e.message,
    }));
  };

  const isLoading = users.loading || crackResult.loading;

  return (
    <LabLayout
      title="Weak Hash Algorithm"
      subtitle="MD5/SHA1 でハッシュしても安全ではない理由"
      description="MD5やSHA1でハッシュ化しても、レインボーテーブル（事前計算済みハッシュ対応表）を使えば数秒で元のパスワードに戻せてしまいます。"
    >
      <h3 className="mt-6">Lab 1: ハッシュ値の確認と逆引き</h3>
      <p className="text-sm text-text-secondary">
        ユーザー一覧を取得し、各ユーザーのパスワードハッシュを確認してください。
        「逆引き」ボタンでレインボーテーブルによるハッシュ解読を体験できます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <UsersPanel
              mode="vulnerable"
              result={users.vulnerable}
              isLoading={isLoading}
              onFetch={() => fetchUsers("vulnerable")}
              onCrack={(hash) => crack("vulnerable", hash)}
            />
            <CrackPanel result={crackResult.vulnerable} />
          </div>
        }
        secureContent={
          <div>
            <UsersPanel
              mode="secure"
              result={users.secure}
              isLoading={isLoading}
              onFetch={() => fetchUsers("secure")}
              onCrack={(hash) => crack("secure", hash)}
            />
            <CrackPanel result={crackResult.secure} />
          </div>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: MD5ハッシュがレインボーテーブルで即座に逆引きできるか</li>
          <li>安全版: bcryptハッシュが逆引きに失敗するか</li>
          <li>MD5が「高速すぎる」ことがなぜ問題なのか理解したか</li>
          <li>ソルトの役割（同じパスワードでも異なるハッシュ値）を理解したか</li>
          <li>コスト係数（ストレッチング）がGPU攻撃をどう防ぐか理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
