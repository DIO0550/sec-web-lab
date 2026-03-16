import { Link } from "react-router-dom";
import { useLabFetch, fetchJsonWithHeaders, type HeaderResponse } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { EndpointUrl } from "../../../components/EndpointUrl";

// チェックするセキュリティヘッダーの定義
const SECURITY_HEADERS = [
  {
    name: "X-Content-Type-Options",
    description: "MIMEスニッフィング防止",
    attack: "ブラウザがContent-Typeを無視して中身を推測実行する",
    labLink: null,
  },
  {
    name: "X-Frame-Options",
    description: "クリックジャッキング防止",
    attack: "iframeに埋め込まれて意図しない操作をさせられる",
    labLink: { path: "/step07/clickjacking", label: "Clickjacking ラボ" },
  },
  {
    name: "X-XSS-Protection",
    description: "XSSフィルター (レガシー)",
    attack: "レガシーブラウザでXSSフィルターが動作しない",
    labLink: { path: "/step02/xss", label: "XSS ラボ" },
  },
  {
    name: "Content-Security-Policy",
    description: "リソース読み込み制限",
    attack: "外部スクリプトの注入が容易になる",
    labLink: { path: "/step09/csp", label: "CSP ラボ" },
  },
  {
    name: "Strict-Transport-Security",
    description: "HTTPS強制",
    attack: "中間者攻撃でHTTP通信を傍受される",
    labLink: { path: "/step07/sensitive-data-http", label: "HTTP通信の危険性 ラボ" },
  },
  {
    name: "Referrer-Policy",
    description: "リファラー制御",
    attack: "URLのクエリパラメータ等が外部サイトに漏洩する",
    labLink: null,
  },
];

function HeaderCheckTable({ result }: { result: HeaderResponse | null }) {
  if (!result) return <div />;
  return (
    <table className="w-full border-collapse text-sm mt-2">
      <thead>
        <tr className="bg-table-header-bg text-white">
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
            <tr key={header.name} className="border-b border-table-border">
              <td className="py-1.5 px-2">
                <code>{header.name}</code>
                <br />
                <span className="text-xs text-text-muted">{header.description}</span>
              </td>
              <td className="py-1.5 px-2">
                {isPresent ? (
                  <code className="text-status-ok">{value}</code>
                ) : (
                  <span className="text-status-ng italic">未設定</span>
                )}
              </td>
              <td className="py-1.5 px-2 text-center">
                {isPresent ? (
                  <span className="text-status-ok text-lg">OK</span>
                ) : (
                  <span className="text-status-ng text-lg">NG</span>
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
            <EndpointUrl
              method="GET"
              action={
                <FetchButton
                  onClick={() => fetchVulnerable()}
                  disabled={isLoading}
                  isLoading={loading?.startsWith("vulnerable")}
                  loadingText="送信中..."
                >
                  ヘッダーを確認
                </FetchButton>
              }
            >
              /api/labs/header-exposure/vulnerable/
            </EndpointUrl>
            <ExpandableSection isOpen={!!vulnerable}>
              <HeaderCheckTable result={vulnerable} />
            </ExpandableSection>
          </>
        }
        secureContent={
          <>
            <EndpointUrl
              method="GET"
              action={
                <FetchButton
                  onClick={() => fetchSecure()}
                  disabled={isLoading}
                  isLoading={loading?.startsWith("secure")}
                  loadingText="送信中..."
                >
                  ヘッダーを確認
                </FetchButton>
              }
            >
              /api/labs/header-exposure/secure/
            </EndpointUrl>
            <ExpandableSection isOpen={!!secure}>
              <HeaderCheckTable result={secure} />
            </ExpandableSection>
          </>
        }
      />

      {/* セキュリティヘッダー解説 */}
      <CheckpointBox title="各ヘッダーの役割" variant="warning">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-code-bg">
              <th className="py-1.5 px-2 text-left">ヘッダー</th>
              <th className="py-1.5 px-2 text-left">欠如した場合のリスク</th>
              <th className="py-1.5 px-2 text-left">攻撃を体験</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_HEADERS.map((header) => (
              <tr key={header.name} className="border-b border-table-border">
                <td className="py-1.5 px-2"><code>{header.name}</code></td>
                <td className="py-1.5 px-2">{header.attack}</td>
                <td className="py-1.5 px-2">
                  {header.labLink ? (
                    <Link to={header.labLink.path} className="text-accent hover:underline">
                      {header.labLink.label} →
                    </Link>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
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
