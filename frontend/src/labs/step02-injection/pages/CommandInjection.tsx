import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/command-injection";

type PingResult = {
  success: boolean;
  output: string;
  stderr?: string;
  message?: string;
  _debug?: { command: string };
};

// --- Pingフォーム ---
function PingForm({
  mode,
  result,
  isLoading,
  onPing,
}: {
  mode: "vulnerable" | "secure";
  result: PingResult | null;
  isLoading: boolean;
  onPing: (mode: "vulnerable" | "secure", host: string) => void;
}) {
  const [host, setHost] = useState("");

  const presets = [
    { label: "正常 (127.0.0.1)", host: "127.0.0.1" },
    { label: "; cat /etc/passwd", host: "127.0.0.1; cat /etc/passwd" },
    { label: "&& whoami", host: "127.0.0.1 && whoami" },
    { label: "$(id)", host: "$(id)" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, display: "block" }}>ホスト名 / IPアドレス:</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="127.0.0.1"
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, flex: 1 }}
          />
          <FetchButton onClick={() => onPing(mode, host)} disabled={isLoading}>
            Ping
          </FetchButton>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>プリセット:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setHost(p.host)}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: "bold",
              color: result.success ? "#080" : "#c00",
              marginBottom: 4,
            }}
          >
            {result.success ? "実行成功" : "実行失敗"}
            {result.message && ` — ${result.message}`}
          </div>

          {result.output && (
            <pre
              style={{
                background: "#1a1a2e",
                color: mode === "vulnerable" ? "#e94560" : "#4ecdc4",
                padding: 12,
                borderRadius: 4,
                overflow: "auto",
                fontSize: 12,
                maxHeight: 300,
                whiteSpace: "pre-wrap",
              }}
            >
              {result.output}
            </pre>
          )}

          {result.stderr && (
            <pre
              style={{
                background: "#2e1a1a",
                color: "#ff6b6b",
                padding: 8,
                borderRadius: 4,
                overflow: "auto",
                fontSize: 11,
                maxHeight: 150,
                marginTop: 4,
              }}
            >
              stderr: {result.stderr}
            </pre>
          )}

          {result._debug && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>実行されたコマンド</summary>
              <pre style={{ fontSize: 11, background: "#1a1a2e", color: "#e94560", padding: 8, borderRadius: 4 }}>
                {result._debug.command}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---

export function CommandInjection() {
  const [vulnResult, setVulnResult] = useState<PingResult | null>(null);
  const [secureResult, setSecureResult] = useState<PingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePing = useCallback(async (mode: "vulnerable" | "secure", host: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host }),
      });
      const data = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false, output: "", message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="OS Command Injection"
      subtitle="OSコマンドインジェクション — サーバー上で任意のコマンドを実行"
      description="ping ツールの入力欄にシェルのメタ文字を注入し、サーバー上で意図しないOSコマンドを実行させる脆弱性です。"
    >
      <h3 style={{ marginTop: 24 }}>ネットワーク診断ツール (ping)</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        ホスト名に <code>127.0.0.1; cat /etc/passwd</code> を入力して、
        <code>;</code> でコマンドを連結することでサーバー上のファイルを読み取れることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <PingForm mode="vulnerable" result={vulnResult} isLoading={loading} onPing={handlePing} />
        }
        secureContent={
          <PingForm mode="secure" result={secureResult} isLoading={loading} onPing={handlePing} />
        }
      />

      <CheckpointBox variant="warning" title="シェルメタ文字の一覧">
        <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "4px 8px", border: "1px solid #ddd", textAlign: "left" }}>文字</th>
              <th style={{ padding: "4px 8px", border: "1px solid #ddd", textAlign: "left" }}>意味</th>
              <th style={{ padding: "4px 8px", border: "1px solid #ddd", textAlign: "left" }}>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>;</code></td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>コマンド区切り</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>ping 127.0.0.1; cat /etc/passwd</code></td>
            </tr>
            <tr>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>&&</code></td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>前のコマンドが成功したら実行</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>ping 127.0.0.1 && whoami</code></td>
            </tr>
            <tr>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>||</code></td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>前のコマンドが失敗したら実行</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>ping invalid || whoami</code></td>
            </tr>
            <tr>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>|</code></td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>パイプ</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>ping 127.0.0.1 | head -1</code></td>
            </tr>
            <tr>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>$()</code></td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>コマンド置換</td>
              <td style={{ padding: "4px 8px", border: "1px solid #ddd" }}><code>ping $(whoami)</code></td>
            </tr>
          </tbody>
        </table>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>;</code> でコマンドを連結して <code>/etc/passwd</code> が読めるか</li>
          <li>安全版: 同じペイロードがバリデーションで弾かれるか</li>
          <li><code>exec()</code> と <code>execFile()</code> の違い（シェルの介在有無）を理解したか</li>
          <li>SQLインジェクションとの共通パターン（入力がコードとして解釈される）を認識したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
