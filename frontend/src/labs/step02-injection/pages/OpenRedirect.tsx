import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Input } from "@/components/Input";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";
import { PresetButtons } from "@/components/PresetButtons";
import { ExpandableSection } from "../../../components/ExpandableSection";

const BASE = "/api/labs/open-redirect";

type CheckResult = {
  input: string;
  wouldRedirectTo: string | null;
  isExternal: boolean;
  blocked: boolean;
  reason?: string;
};

const presets = [
  { label: "内部パス (/dashboard)", url: "/dashboard" },
  { label: "外部URL (evil.example.com)", url: "https://evil.example.com/login" },
  { label: "プロトコル相対 (//evil.com)", url: "//evil.example.com" },
  { label: "javascript:", url: "javascript:alert(1)" },
];

// --- リダイレクトテスト ---
function RedirectTest({
  mode,
  result,
  isLoading,
  onCheck,
}: {
  mode: "vulnerable" | "secure";
  result: CheckResult | null;
  isLoading: boolean;
  onCheck: (mode: "vulnerable" | "secure", url: string) => void;
}) {
  const [url, setUrl] = useState("");

  return (
    <div>
      <div className="mb-3">
        <label className="text-[13px] block">リダイレクト先URL:</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/dashboard"
            className="flex-1"
          />
          <FetchButton onClick={() => onCheck(mode, url)} disabled={isLoading}>
            検証
          </FetchButton>
        </div>
      </div>

      <PresetButtons presets={presets} onSelect={(p) => setUrl(p.url)} className="mb-3" />

      <ExpandableSection isOpen={!!result}>
        <div className="mt-2">
          <table className="text-[13px] border-collapse w-full">
            <tbody>
              <tr>
                <td className="p-1 px-2 border border-table-border font-bold w-[140px]">
                  入力URL
                </td>
                <td className="p-1 px-2 border border-table-border">
                  <code>{result?.input}</code>
                </td>
              </tr>
              <tr>
                <td className="p-1 px-2 border border-table-border font-bold">
                  リダイレクト先
                </td>
                <td className="p-1 px-2 border border-table-border">
                  <code>{result?.wouldRedirectTo ?? "(なし)"}</code>
                </td>
              </tr>
              <tr>
                <td className="p-1 px-2 border border-table-border font-bold">
                  外部URL
                </td>
                <td className="p-1 px-2 border border-table-border">
                  <span className={result?.isExternal ? "text-status-ng" : "text-status-ok"}>
                    {result?.isExternal ? "はい" : "いいえ"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-1 px-2 border border-table-border font-bold">
                  ブロック
                </td>
                <td className="p-1 px-2 border border-table-border">
                  <span
                    className={`font-bold ${result?.blocked ? "text-status-ok" : "text-status-ng"}`}
                  >
                    {result?.blocked ? "ブロック済み" : "ブロックなし"}
                  </span>
                </td>
              </tr>
              {result?.reason && (
                <tr>
                  <td className="p-1 px-2 border border-table-border font-bold">
                    理由
                  </td>
                  <td className="p-1 px-2 border border-table-border">
                    {result.reason}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 実際のリダイレクトリンク */}
          <div className="mt-2 text-xs text-text-muted">
            実際のリダイレクトURL:
            <a
              href={`${BASE}/${mode}/redirect?url=${encodeURIComponent(result?.input ?? "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 ${mode === "vulnerable" ? "text-status-ng" : "text-status-ok"}`}
            >
              {`${BASE}/${mode}/redirect?url=${result?.input ?? ""}`}
            </a>
            <span className="ml-2 text-text-muted">(新しいタブで開きます)</span>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---

export function OpenRedirect() {
  const result = useComparisonFetch<CheckResult>(BASE);

  const handleCheck = async (mode: "vulnerable" | "secure", url: string) => {
    await result.run(mode, `/check?url=${encodeURIComponent(url)}`);
  };

  return (
    <LabLayout
      title="Open Redirect"
      subtitle="オープンリダイレクト — 信頼されたURLからフィッシングサイトへ誘導"
      description="リダイレクト先URLの検証不備を悪用して、正規サイトのURLからユーザーを外部のフィッシングサイトへ誘導する脆弱性です。"
    >
      <h3 className="mt-6">リダイレクト検証テスト</h3>
      <p className="text-sm text-text-secondary">
        リダイレクト先URLを指定して、脆弱版と安全版でリダイレクトの挙動を比較します。
        外部URLが指定された場合に、サーバーがそのままリダイレクトするか、ブロックするかを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <RedirectTest mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onCheck={handleCheck} />
        }
        secureContent={
          <RedirectTest mode="secure" result={result.secure} isLoading={result.loading} onCheck={handleCheck} />
        }
      />

      <CheckpointBox variant="warning" title="攻撃シナリオ">
        <p className="text-[13px] text-text-secondary">
          攻撃者は以下のようなURLを作成し、被害者にメールやSNSで送信します:
        </p>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {`https://trusted-site.com/redirect?url=https://evil-site.com/login`}
        </pre>
        <p className="text-[13px] text-text-secondary">
          URLの冒頭が正規のドメインであるため、被害者は不審に思わずクリックし、
          フィッシングサイトのログインフォームに認証情報を入力してしまいます。
        </p>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: 外部URL (<code>https://evil.example.com</code>) へのリダイレクトが許可されるか</li>
          <li>安全版: 外部URLがブロックされ、トップページ (<code>/</code>) にフォールバックするか</li>
          <li>安全版: 内部パス (<code>/dashboard</code>) は正常にリダイレクトされるか</li>
          <li><code>//evil.com</code> (プロトコル相対URL) や <code>javascript:</code> スキームへの対処を確認したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
