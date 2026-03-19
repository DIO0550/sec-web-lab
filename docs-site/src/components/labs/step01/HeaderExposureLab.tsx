import Link from '@docusaurus/Link';
import { useLabFetch, fetchJsonWithHeaders, type HeaderResponse } from '@site/src/hooks/useLabFetch';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { EndpointUrl } from '@site/src/components/lab-ui/EndpointUrl';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './HeaderExposureLab.module.css';

// チェックするセキュリティヘッダーの定義
// labLink パスは Docusaurus のドキュメントパスに合わせて更新済み
const SECURITY_HEADERS = [
  {
    name: 'X-Content-Type-Options',
    description: 'MIMEスニッフィング防止',
    attack: 'ブラウザがContent-Typeを無視して中身を推測実行する',
    labLink: null,
  },
  {
    name: 'X-Frame-Options',
    description: 'クリックジャッキング防止',
    attack: 'iframeに埋め込まれて意図しない操作をさせられる',
    labLink: { path: '/step07-design/clickjacking', label: 'Clickjacking ラボ' },
  },
  {
    name: 'X-XSS-Protection',
    description: 'XSSフィルター (レガシー)',
    attack: 'レガシーブラウザでXSSフィルターが動作しない',
    labLink: { path: '/step02-injection/xss', label: 'XSS ラボ' },
  },
  {
    name: 'Content-Security-Policy',
    description: 'リソース読み込み制限',
    attack: '外部スクリプトの注入が容易になる',
    labLink: { path: '/step09-defense/csp', label: 'CSP ラボ' },
  },
  {
    name: 'Strict-Transport-Security',
    description: 'HTTPS強制',
    attack: '中間者攻撃でHTTP通信を傍受される',
    labLink: { path: '/step07-design/sensitive-data-http', label: 'HTTP通信の危険性 ラボ' },
  },
  {
    name: 'Referrer-Policy',
    description: 'リファラー制御',
    attack: 'URLのクエリパラメータ等が外部サイトに漏洩する',
    labLink: null,
  },
];

function HeaderCheckTable({ result }: { result: HeaderResponse | null }) {
  if (!result) return <div />;
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tableHeaderRow}>
          <th className={styles.th}>ヘッダー</th>
          <th className={styles.th}>値</th>
          <th className={styles.thCenter}>状態</th>
        </tr>
      </thead>
      <tbody>
        {SECURITY_HEADERS.map((header) => {
          const value = result.headers[header.name.toLowerCase()];
          const isPresent = !!value;
          return (
            <tr key={header.name} className={styles.tr}>
              <td className={styles.td}>
                <code>{header.name}</code>
                <br />
                <span className={styles.headerDescription}>{header.description}</span>
              </td>
              <td className={styles.td}>
                {isPresent ? (
                  <code className={styles.valuePresent}>{value}</code>
                ) : (
                  <span className={styles.valueMissing}>未設定</span>
                )}
              </td>
              <td className={styles.tdCenter}>
                {isPresent ? (
                  <span className={styles.statusOk}>OK</span>
                ) : (
                  <span className={styles.statusNg}>NG</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Security Header Misconfiguration ラボ UI
 *
 * パターンA + HeaderCheckTable + @docusaurus/Link
 */
export function HeaderExposureLab() {
  const { vulnerable, secure, loading, isLoading, error, fetchVulnerable, fetchSecure } =
    useLabFetch('/api/labs/header-exposure', fetchJsonWithHeaders);

  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}

      <ComparisonPanel
        vulnerableContent={
          <>
            <EndpointUrl
              method="GET"
              action={
                <FetchButton
                  onClick={() => fetchVulnerable()}
                  disabled={isLoading}
                  isLoading={loading?.startsWith('vulnerable')}
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
                  isLoading={loading?.startsWith('secure')}
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
        <table className={styles.infoTable}>
          <thead>
            <tr className={styles.infoHeaderRow}>
              <th className={styles.th}>ヘッダー</th>
              <th className={styles.th}>欠如した場合のリスク</th>
              <th className={styles.th}>攻撃を体験</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_HEADERS.map((header) => (
              <tr key={header.name} className={styles.tr}>
                <td className={styles.td}><code>{header.name}</code></td>
                <td className={styles.td}>{header.attack}</td>
                <td className={styles.td}>
                  {header.labLink ? (
                    <Link to={header.labLink.path} className={styles.labLink}>
                      {header.labLink.label} →
                    </Link>
                  ) : (
                    <span className={styles.noLink}>—</span>
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
    </>
  );
}
