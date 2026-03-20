import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './OpenRedirectLab.module.css';

const BASE = '/api/labs/open-redirect';

type CheckResult = {
  input: string;
  wouldRedirectTo: string | null;
  isExternal: boolean;
  blocked: boolean;
  reason?: string;
};

const presets = [
  { label: '内部パス (/dashboard)', url: '/dashboard' },
  { label: '外部URL (evil.example.com)', url: 'https://evil.example.com/login' },
  { label: 'プロトコル相対 (//evil.com)', url: '//evil.example.com' },
  { label: 'javascript:', url: 'javascript:alert(1)' },
];

/** リダイレクトテスト（脆弱/安全の各タブ内で使用） */
function RedirectTest({
  mode,
  result,
  isLoading,
  onCheck,
}: {
  mode: 'vulnerable' | 'secure';
  result: CheckResult | null;
  isLoading: boolean;
  onCheck: (mode: 'vulnerable' | 'secure', url: string) => void;
}) {
  const [url, setUrl] = useState('');

  return (
    <div>
      <div className={styles.inputRow}>
        <Input
          label="リダイレクト先URL:"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/dashboard"
          className={styles.inputFlex}
        />
        <FetchButton onClick={() => onCheck(mode, url)} disabled={isLoading}>
          検証
        </FetchButton>
      </div>

      <PresetButtons presets={presets} onSelect={(p) => setUrl(p.url)} className={styles.presets} />

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultArea}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={`${styles.td} ${styles.tdLabel}`}>入力URL</td>
                <td className={styles.td}>
                  <code>{result?.input}</code>
                </td>
              </tr>
              <tr>
                <td className={`${styles.td} ${styles.tdLabel}`}>リダイレクト先</td>
                <td className={styles.td}>
                  <code>{result?.wouldRedirectTo ?? '(なし)'}</code>
                </td>
              </tr>
              <tr>
                <td className={`${styles.td} ${styles.tdLabel}`}>外部URL</td>
                <td className={styles.td}>
                  <span className={result?.isExternal ? styles.statusNg : styles.statusOk}>
                    {result?.isExternal ? 'はい' : 'いいえ'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={`${styles.td} ${styles.tdLabel}`}>ブロック</td>
                <td className={styles.td}>
                  <span className={result?.blocked ? styles.statusOk : styles.statusNg}>
                    {result?.blocked ? 'ブロック済み' : 'ブロックなし'}
                  </span>
                </td>
              </tr>
              {result?.reason && (
                <tr>
                  <td className={`${styles.td} ${styles.tdLabel}`}>理由</td>
                  <td className={styles.td}>{result.reason}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 実際のリダイレクトリンク */}
          <div className={styles.redirectLink}>
            実際のリダイレクトURL:
            <a
              href={`${BASE}/${mode}/redirect?${new URLSearchParams({ url: result?.input ?? '' })}`}
              target="_blank"
              rel="noopener noreferrer"
              className={mode === 'vulnerable' ? styles.statusNg : styles.statusOk}
            >
              {`${BASE}/${mode}/redirect?url=${result?.input ?? ''}`}
            </a>
            <span className={styles.linkNote}>(新しいタブで開きます)</span>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * オープンリダイレクトラボUI
 *
 * リダイレクト先URLの検証不備を悪用して、正規サイトのURLから
 * ユーザーを外部のフィッシングサイトへ誘導する脆弱性を体験する。
 */
export function OpenRedirectLab() {
  const [vulnResult, setVulnResult] = useState<CheckResult | null>(null);
  const [secureResult, setSecureResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (mode: 'vulnerable' | 'secure', url: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ url });
      const res = await fetch(`${BASE}/${mode}/check?${params}`);
      const data: CheckResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      // ネットワークエラー等
      const msg = e instanceof Error ? e.message : String(e);
      const fallback: CheckResult = {
        input: url,
        wouldRedirectTo: null,
        isExternal: false,
        blocked: false,
        reason: `通信エラー: ${msg}`,
      };
      if (mode === 'vulnerable') {
        setVulnResult(fallback);
      } else {
        setSecureResult(fallback);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>リダイレクト検証テスト</h3>
      <p className={styles.description}>
        リダイレクト先URLを指定して、脆弱版と安全版でリダイレクトの挙動を比較します。
        外部URLが指定された場合に、サーバーがそのままリダイレクトするか、ブロックするかを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <RedirectTest
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onCheck={handleCheck}
          />
        }
        secureContent={
          <RedirectTest
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onCheck={handleCheck}
          />
        }
      />

      <CheckpointBox variant="warning" title="攻撃シナリオ">
        <p className={styles.checkpointText}>
          攻撃者は以下のようなURLを作成し、被害者にメールやSNSで送信します:
        </p>
        <pre className={styles.codeBlock}>
          {`https://trusted-site.com/redirect?url=https://evil-site.com/login`}
        </pre>
        <p className={styles.checkpointText}>
          URLの冒頭が正規のドメインであるため、被害者は不審に思わずクリックし、
          フィッシングサイトのログインフォームに認証情報を入力してしまいます。
        </p>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: 外部URL (<code>https://evil.example.com</code>)
            へのリダイレクトが許可されるか
          </li>
          <li>
            安全版: 外部URLがブロックされ、トップページ (<code>/</code>) にフォールバックするか
          </li>
          <li>
            安全版: 内部パス (<code>/dashboard</code>) は正常にリダイレクトされるか
          </li>
          <li>
            <code>//evil.com</code> (プロトコル相対URL) や <code>javascript:</code>{' '}
            スキームへの対処を確認したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
