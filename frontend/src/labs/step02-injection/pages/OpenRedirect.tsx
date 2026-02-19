import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/open-redirect";

type CheckResult = {
  input: string;
  wouldRedirectTo: string | null;
  isExternal: boolean;
  blocked: boolean;
  reason?: string;
};

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

  const presets = [
    { label: "内部パス (/dashboard)", url: "/dashboard" },
    { label: "外部URL (evil.example.com)", url: "https://evil.example.com/login" },
    { label: "プロトコル相対 (//evil.com)", url: "//evil.example.com" },
    { label: "javascript:", url: "javascript:alert(1)" },
  ];

  return (
    <div>
      <div className="mb-3">
        <label className="text-[13px] block">リダイレクト先URL:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/dashboard"
            className="py-1 px-2 border border-[#ccc] rounded flex-1"
          />
          <FetchButton onClick={() => onCheck(mode, url)} disabled={isLoading}>
            検証
          </FetchButton>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">プリセット:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setUrl(p.url)}
              className="text-[11px] py-0.5 px-2 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-2">
          <table className="text-[13px] border-collapse w-full">
            <tbody>
              <tr>
                <td className="p-1 px-2 border border-[#ddd] font-bold w-[140px]">
                  入力URL
                </td>
                <td className="p-1 px-2 border border-[#ddd]">
                  <code>{result.input}</code>
                </td>
              </tr>
              <tr>
                <td className="p-1 px-2 border border-[#ddd] font-bold">
                  リダイレクト先
                </td>
                <td className="p-1 px-2 border border-[#ddd]">
                  <code>{result.wouldRedirectTo ?? "(なし)"}</code>
                </td>
              </tr>
              <tr>
                <td className="p-1 px-2 border border-[#ddd] font-bold">
                  外部URL
                </td>
                <td className="p-1 px-2 border border-[#ddd]">
                  <span className={result.isExternal ? "text-[#c00]" : "text-[#080]"}>
                    {result.isExternal ? "はい" : "いいえ"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-1 px-2 border border-[#ddd] font-bold">
                  ブロック
                </td>
                <td className="p-1 px-2 border border-[#ddd]">
                  <span
                    className={`font-bold ${result.blocked ? "text-[#080]" : "text-[#c00]"}`}
                  >
                    {result.blocked ? "ブロック済み" : "ブロックなし"}
                  </span>
                </td>
              </tr>
              {result.reason && (
                <tr>
                  <td className="p-1 px-2 border border-[#ddd] font-bold">
                    理由
                  </td>
                  <td className="p-1 px-2 border border-[#ddd]">
                    {result.reason}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 実際のリダイレクトリンク */}
          <div className="mt-2 text-xs text-[#888]">
            実際のリダイレクトURL:
            <a
              href={`${BASE}/${mode}/redirect?url=${encodeURIComponent(result.input)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 ${mode === "vulnerable" ? "text-[#c00]" : "text-[#080]"}`}
            >
              {`${BASE}/${mode}/redirect?url=${result.input}`}
            </a>
            <span className="ml-2 text-[#888]">(新しいタブで開きます)</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---

export function OpenRedirect() {
  const [vulnResult, setVulnResult] = useState<CheckResult | null>(null);
  const [secureResult, setSecureResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = useCallback(async (mode: "vulnerable" | "secure", url: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/check?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="Open Redirect"
      subtitle="オープンリダイレクト — 信頼されたURLからフィッシングサイトへ誘導"
      description="リダイレクト先URLの検証不備を悪用して、正規サイトのURLからユーザーを外部のフィッシングサイトへ誘導する脆弱性です。"
    >
      <h3 className="mt-6">リダイレクト検証テスト</h3>
      <p className="text-sm text-[#666]">
        リダイレクト先URLを指定して、脆弱版と安全版でリダイレクトの挙動を比較します。
        外部URLが指定された場合に、サーバーがそのままリダイレクトするか、ブロックするかを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <RedirectTest mode="vulnerable" result={vulnResult} isLoading={loading} onCheck={handleCheck} />
        }
        secureContent={
          <RedirectTest mode="secure" result={secureResult} isLoading={loading} onCheck={handleCheck} />
        }
      />

      <CheckpointBox variant="warning" title="攻撃シナリオ">
        <p className="text-[13px] text-[#666]">
          攻撃者は以下のようなURLを作成し、被害者にメールやSNSで送信します:
        </p>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {`https://trusted-site.com/redirect?url=https://evil-site.com/login`}
        </pre>
        <p className="text-[13px] text-[#666]">
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
