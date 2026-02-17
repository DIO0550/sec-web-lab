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
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
      <thead>
        <tr style={{ background: "#333", color: "#fff" }}>
          <th style={{ padding: "6px 8px", textAlign: "left" }}>ヘッダー</th>
          <th style={{ padding: "6px 8px", textAlign: "left" }}>値</th>
          <th style={{ padding: "6px 8px", textAlign: "center", width: 60 }}>状態</th>
        </tr>
      </thead>
      <tbody>
        {SECURITY_HEADERS.map((header) => {
          const value = result.headers[header.name.toLowerCase()];
          const isPresent = !!value;
          return (
            <tr key={header.name} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "6px 8px" }}>
                <code>{header.name}</code>
                <br />
                <span style={{ fontSize: 11, color: "#888" }}>{header.description}</span>
              </td>
              <td style={{ padding: "6px 8px" }}>
                {isPresent ? (
                  <code style={{ color: "#080" }}>{value}</code>
                ) : (
                  <span style={{ color: "#c00", fontStyle: "italic" }}>未設定</span>
                )}
              </td>
              <td style={{ padding: "6px 8px", textAlign: "center" }}>
                {isPresent ? (
                  <span style={{ color: "#080", fontSize: 18 }}>OK</span>
                ) : (
                  <span style={{ color: "#c00", fontSize: 18 }}>NG</span>
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
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>ヘッダー</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>欠如した場合のリスク</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_HEADERS.map((header) => (
              <tr key={header.name} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "6px 8px" }}><code>{header.name}</code></td>
                <td style={{ padding: "6px 8px" }}>{header.attack}</td>
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
