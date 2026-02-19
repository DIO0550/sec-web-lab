import { useLabFetch, fetchJsonWithHeaders, type HeaderResponse } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

// チェックするセキュリティヘッダーの定義
const SECURITY_HEADERS = [
  {
    name: "X-Content-Type-Options",
    description: "MIMEスニッフィング防止",
    attack: "ブラウザがContent-Typeを無視して中身を推測実行する",
  },
  {
    name: "X-Frame-Options",
    description: "クリックジャッキング防止",
    attack: "iframeに埋め込まれて意図しない操作をさせられる",
  },
  {
    name: "X-XSS-Protection",
    description: "XSSフィルター (レガシー)",
    attack: "レガシーブラウザでXSSフィルターが動作しない",
  },
  {
    name: "Content-Security-Policy",
    description: "リソース読み込み制限",
    attack: "外部スクリプトの注入が容易になる",
  },
  {
    name: "Strict-Transport-Security",
    description: "HTTPS強制",
    attack: "中間者攻撃でHTTP通信を傍受される",
  },
  {
    name: "Referrer-Policy",
    description: "リファラー制御",
    attack: "URLのクエリパラメータ等が外部サイトに漏洩する",
  },
];

function HeaderCheckTable({ result }: { result: HeaderResponse | null }) {
  if (!result) return null;
  return (
    <table className="w-full border-collapse text-[13px] mt-2">
      <thead>
        <tr className="bg-[#333] text-white">
          <th className="py-1.5 px-2 text-left">ヘッダー</th>
          <th className="py-1.5 px-2 text-left">値</th>
          <th className="py-1.5 px-2 text-center w-[60px]">状態</th>
        </tr>
      </thead>
      <tbody>
        {SECURITY_HEADERS.map((header) => {
          const value = result.headers[header.name.toLowerCase()];
          const isPresent = !!value;
          return (
            <tr key={header.name} className="border-b border-[#ddd]">
              <td className="py-1.5 px-2">
                <code>{header.name}</code>
                <br />
                <span className="text-[11px] text-[#888]">{header.description}</span>
              </td>
              <td className="py-1.5 px-2">
                {isPresent ? (
                  <code className="text-[#080]">{value}</code>
                ) : (
                  <span className="text-[#c00] italic">未設定</span>
                )}
              </td>
              <td className="py-1.5 px-2 text-center">
                {isPresent ? (
                  <span className="text-[#080] text-[18px]">OK</span>
                ) : (
                  <span className="text-[#c00] text-[18px]">NG</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function HeaderExposure() {
  const { vulnerable, secure, loading, isLoading, fetchVulnerable, fetchSecure } =
    useLabFetch("/api/labs/header-exposure", fetchJsonWithHeaders);

  return (
    <LabLayout
      title="Security Header Misconfiguration"
      subtitle="セキュリティヘッダーの欠如による脆弱性"
      description="ブラウザの保護機能を有効にするHTTPレスポンスヘッダーが設定されておらず、XSSやクリックジャッキング等の攻撃に対する防御層が欠けている脆弱性です。"
    >
      <ComparisonPanel
        vulnerableContent={
          <>
            <p><code>GET /api/labs/header-exposure/vulnerable/</code></p>
            <FetchButton
              onClick={() => fetchVulnerable()}
              disabled={isLoading}
              isLoading={loading?.startsWith("vulnerable")}
              loadingText="送信中..."
            >
              ヘッダーを確認
            </FetchButton>
            <HeaderCheckTable result={vulnerable} />
          </>
        }
        secureContent={
          <>
            <p><code>GET /api/labs/header-exposure/secure/</code></p>
            <FetchButton
              onClick={() => fetchSecure()}
              disabled={isLoading}
              isLoading={loading?.startsWith("secure")}
              loadingText="送信中..."
            >
              ヘッダーを確認
            </FetchButton>
            <HeaderCheckTable result={secure} />
          </>
        }
      />

      {/* セキュリティヘッダー解説 */}
      <CheckpointBox title="各ヘッダーの役割" variant="warning">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="py-1.5 px-2 text-left">ヘッダー</th>
              <th className="py-1.5 px-2 text-left">欠如した場合のリスク</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_HEADERS.map((header) => (
              <tr key={header.name} className="border-b border-[#ddd]">
                <td className="py-1.5 px-2"><code>{header.name}</code></td>
                <td className="py-1.5 px-2">{header.attack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: セキュリティヘッダーが全て「未設定」になっているか</li>
          <li>安全版: 全てのセキュリティヘッダーが「OK」になっているか</li>
          <li>ターミナルで <code>curl -I http://localhost:3000/api/labs/header-exposure/vulnerable/</code> も試してみよう</li>
          <li>注意: ブラウザの fetch API では一部のヘッダーが見えない場合があります。<code>curl -I</code> で正確に確認できます</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
