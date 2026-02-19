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
      <div className="mb-3">
        <label className="text-[13px] block">ホスト名 / IPアドレス:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="127.0.0.1"
            className="py-1 px-2 border border-[#ccc] rounded flex-1"
          />
          <FetchButton onClick={() => onPing(mode, host)} disabled={isLoading}>
            Ping
          </FetchButton>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">プリセット:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setHost(p.host)}
              className="text-[11px] py-0.5 px-2 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-2">
          <div
            className={`text-[13px] font-bold mb-1 ${result.success ? "text-[#080]" : "text-[#c00]"}`}
          >
            {result.success ? "実行成功" : "実行失敗"}
            {result.message && ` — ${result.message}`}
          </div>

          {result.output && (
            <pre
              className={`bg-vuln-bg p-3 rounded overflow-auto text-xs max-h-[300px] whitespace-pre-wrap ${mode === "vulnerable" ? "text-vuln-text" : "text-secure-text"}`}
            >
              {result.output}
            </pre>
          )}

          {result.stderr && (
            <pre
              className="bg-error-bg text-error-text p-2 rounded overflow-auto text-[11px] max-h-[150px] mt-1"
            >
              stderr: {result.stderr}
            </pre>
          )}

          {result._debug && (
            <details className="mt-2">
              <summary className="text-xs text-[#888] cursor-pointer">実行されたコマンド</summary>
              <pre className="text-[11px] bg-vuln-bg text-vuln-text p-2 rounded">
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
      <h3 className="mt-6">ネットワーク診断ツール (ping)</h3>
      <p className="text-sm text-[#666]">
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
        <table className="text-[13px] border-collapse w-full">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="p-1 px-2 border border-[#ddd] text-left">文字</th>
              <th className="p-1 px-2 border border-[#ddd] text-left">意味</th>
              <th className="p-1 px-2 border border-[#ddd] text-left">例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-1 px-2 border border-[#ddd]"><code>;</code></td>
              <td className="p-1 px-2 border border-[#ddd]">コマンド区切り</td>
              <td className="p-1 px-2 border border-[#ddd]"><code>ping 127.0.0.1; cat /etc/passwd</code></td>
            </tr>
            <tr>
              <td className="p-1 px-2 border border-[#ddd]"><code>&&</code></td>
              <td className="p-1 px-2 border border-[#ddd]">前のコマンドが成功したら実行</td>
              <td className="p-1 px-2 border border-[#ddd]"><code>ping 127.0.0.1 && whoami</code></td>
            </tr>
            <tr>
              <td className="p-1 px-2 border border-[#ddd]"><code>||</code></td>
              <td className="p-1 px-2 border border-[#ddd]">前のコマンドが失敗したら実行</td>
              <td className="p-1 px-2 border border-[#ddd]"><code>ping invalid || whoami</code></td>
            </tr>
            <tr>
              <td className="p-1 px-2 border border-[#ddd]"><code>|</code></td>
              <td className="p-1 px-2 border border-[#ddd]">パイプ</td>
              <td className="p-1 px-2 border border-[#ddd]"><code>ping 127.0.0.1 | head -1</code></td>
            </tr>
            <tr>
              <td className="p-1 px-2 border border-[#ddd]"><code>$()</code></td>
              <td className="p-1 px-2 border border-[#ddd]">コマンド置換</td>
              <td className="p-1 px-2 border border-[#ddd]"><code>ping $(whoami)</code></td>
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
