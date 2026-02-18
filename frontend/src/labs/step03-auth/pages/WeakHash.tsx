import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
        <pre style={{ fontSize: 11, color: "#c00", marginTop: 8 }}>{result.error}</pre>
      )}

      {result?.users && (
        <div style={{ marginTop: 12 }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>username</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>password (hash)</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>algorithm</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>action</th>
              </tr>
            </thead>
            <tbody>
              {result.users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{u.username}</td>
                  <td style={{
                    padding: 4,
                    border: "1px solid #ddd",
                    fontFamily: "monospace",
                    fontSize: 10,
                    wordBreak: "break-all",
                    background: mode === "vulnerable" ? "#fff8e1" : "#e8f5e9",
                  }}>
                    {u.password}
                  </td>
                  <td style={{ padding: 4, border: "1px solid #ddd", fontSize: 11 }}>{u.hashAlgorithm}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>
                    <button
                      onClick={() => onCrack(u.password)}
                      style={{ fontSize: 10, padding: "2px 6px", cursor: "pointer" }}
                    >
                      逆引き
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result._debug && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#888", fontStyle: "italic" }}>
              {result._debug.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- 逆引き結果パネル ---
function CrackPanel({
  result,
}: {
  result: CrackResult | null;
}) {
  if (!result) return null;

  return (
    <div style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 4,
      background: result.success ? "#ffebee" : "#e8f5e9",
      border: `1px solid ${result.success ? "#f44336" : "#4caf50"}`,
    }}>
      <div style={{ fontWeight: "bold", color: result.success ? "#c62828" : "#2e7d32" }}>
        {result.success ? "逆引き成功（パスワード判明）" : "逆引き失敗（パスワード保護）"}
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>
        <div>ハッシュ: <code style={{ fontSize: 10, wordBreak: "break-all" }}>{result.hash}</code></div>
        {result.password && (
          <div style={{ marginTop: 4 }}>
            パスワード: <strong style={{ color: "#c00" }}>{result.password}</strong>
          </div>
        )}
        {result.method && <div style={{ marginTop: 4 }}>手法: {result.method}</div>}
        {result.message && <div style={{ marginTop: 4, color: "#666" }}>{result.message}</div>}
        {result._debug?.reasons && (
          <ul style={{ marginTop: 8, fontSize: 11, color: "#666" }}>
            {result._debug.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export function WeakHash() {
  const [vulnUsers, setVulnUsers] = useState<UsersResult | null>(null);
  const [secureUsers, setSecureUsers] = useState<UsersResult | null>(null);
  const [vulnCrack, setVulnCrack] = useState<CrackResult | null>(null);
  const [secureCrack, setSecureCrack] = useState<CrackResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/users`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnUsers(data);
      else setSecureUsers(data);
    } catch (e) {
      const err = { users: [], error: (e as Error).message };
      if (mode === "vulnerable") setVulnUsers(err);
      else setSecureUsers(err);
    }
    setLoading(false);
  }, []);

  const crack = useCallback(async (mode: "vulnerable" | "secure", hash: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/crack?hash=${encodeURIComponent(hash)}`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnCrack(data);
      else setSecureCrack(data);
    } catch (e) {
      const err = { success: false, hash, message: (e as Error).message };
      if (mode === "vulnerable") setVulnCrack(err);
      else setSecureCrack(err);
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="Weak Hash Algorithm"
      subtitle="MD5/SHA1 でハッシュしても安全ではない理由"
      description="MD5やSHA1でハッシュ化しても、レインボーテーブル（事前計算済みハッシュ対応表）を使えば数秒で元のパスワードに戻せてしまいます。"
    >
      <h3 style={{ marginTop: 24 }}>Lab 1: ハッシュ値の確認と逆引き</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        ユーザー一覧を取得し、各ユーザーのパスワードハッシュを確認してください。
        「逆引き」ボタンでレインボーテーブルによるハッシュ解読を体験できます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <UsersPanel
              mode="vulnerable"
              result={vulnUsers}
              isLoading={loading}
              onFetch={() => fetchUsers("vulnerable")}
              onCrack={(hash) => crack("vulnerable", hash)}
            />
            <CrackPanel result={vulnCrack} />
          </div>
        }
        secureContent={
          <div>
            <UsersPanel
              mode="secure"
              result={secureUsers}
              isLoading={loading}
              onFetch={() => fetchUsers("secure")}
              onCrack={(hash) => crack("secure", hash)}
            />
            <CrackPanel result={secureCrack} />
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
