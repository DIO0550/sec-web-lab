import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { Input } from "@/components/Input";
import { ResultTable } from "@/components/ResultTable";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";
import { PresetButtons } from "@/components/PresetButtons";
import { DebugInfo } from "@/components/DebugInfo";
import { ExpandableSection } from "@/components/ExpandableSection";

const BASE = "/api/labs/command-injection";

type PingResult = {
  success: boolean;
  output: string;
  stderr?: string;
  message?: string;
  _debug?: { command: string };
};

const presets = [
  { label: "正常 (127.0.0.1)", host: "127.0.0.1" },
  { label: "; cat /etc/passwd", host: "127.0.0.1; cat /etc/passwd" },
  { label: "&& whoami", host: "127.0.0.1 && whoami" },
  { label: "$(id)", host: "$(id)" },
];

type ShellMeta = { char: string; meaning: string; example: string };

const shellMetaChars: ShellMeta[] = [
  { char: ";", meaning: "コマンド区切り", example: "ping 127.0.0.1; cat /etc/passwd" },
  { char: "&&", meaning: "前のコマンドが成功したら実行", example: "ping 127.0.0.1 && whoami" },
  { char: "||", meaning: "前のコマンドが失敗したら実行", example: "ping invalid || whoami" },
  { char: "|", meaning: "パイプ", example: "ping 127.0.0.1 | head -1" },
  { char: "$()", meaning: "コマンド置換", example: "ping $(whoami)" },
];

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

  return (
    <div>
      <div className="mb-3">
        <label className="text-sm block">ホスト名 / IPアドレス:</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="127.0.0.1"
            className="flex-1"
          />
          <FetchButton onClick={() => onPing(mode, host)} disabled={isLoading}>
            Ping
          </FetchButton>
        </div>
      </div>

      <PresetButtons presets={presets} onSelect={(p) => setHost(p.host)} className="mb-3" />

      <ExpandableSection isOpen={!!result}>
        <div className="mt-2">
          <div
            className={`text-sm font-bold mb-1 ${result?.success ? "text-status-ok" : "text-status-ng"}`}
          >
            {result?.success ? "実行成功" : "実行失敗"}
            {result?.message && ` — ${result.message}`}
          </div>

          {result?.output && (
            <pre
              className={`bg-vuln-bg p-3 rounded overflow-auto text-xs max-h-[300px] whitespace-pre-wrap ${mode === "vulnerable" ? "text-vuln-text" : "text-secure-text"}`}
            >
              {result.output}
            </pre>
          )}

          {result?.stderr && (
            <pre
              className="bg-error-bg text-error-text p-2 rounded overflow-auto text-xs max-h-[150px] mt-1"
            >
              stderr: {result.stderr}
            </pre>
          )}

          <DebugInfo debug={result?._debug ?? null} summary="実行されたコマンド" codeField="command" />
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---

export function CommandInjection() {
  const result = useComparisonFetch<PingResult>(BASE);

  const handlePing = async (mode: "vulnerable" | "secure", host: string) => {
    await result.postJson(mode, "/ping", { host }, (e) => ({
      success: false,
      output: "",
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="OS Command Injection"
      subtitle="OSコマンドインジェクション — サーバー上で任意のコマンドを実行"
      description="ping ツールの入力欄にシェルのメタ文字を注入し、サーバー上で意図しないOSコマンドを実行させる脆弱性です。"
    >
      <h3 className="mt-6">ネットワーク診断ツール (ping)</h3>
      <p className="text-sm text-text-secondary">
        ホスト名に <code>127.0.0.1; cat /etc/passwd</code> を入力して、
        <code>;</code> でコマンドを連結することでサーバー上のファイルを読み取れることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <PingForm mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onPing={handlePing} />
        }
        secureContent={
          <PingForm mode="secure" result={result.secure} isLoading={result.loading} onPing={handlePing} />
        }
      />

      <CheckpointBox variant="warning" title="シェルメタ文字の一覧">
        <ResultTable<ShellMeta>
          columns={[
            { key: "char", label: "文字" },
            { key: "meaning", label: "意味" },
            { key: "example", label: "例" },
          ]}
          data={shellMetaChars}
          renderCell={(col, value) => {
            if (col.key === "char" || col.key === "example") {
              return <code>{String(value)}</code>;
            }
            return undefined;
          }}
        />
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
