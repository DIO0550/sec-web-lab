import { useState, useCallback } from 'react';
import { fetchText, type TextResponse } from '@site/src/hooks/useLabFetch';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { TextViewer } from '@site/src/components/lab-ui/ResponseViewer';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Tabs } from '@site/src/components/lab-ui/Tabs';
import { EndpointUrl } from '@site/src/components/lab-ui/EndpointUrl';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './DirectoryListingLab.module.css';

const BASE = '/api/labs/directory-listing';
const SENSITIVE_FILES = ['config.bak', 'database.sql', '.htpasswd', '.env.backup'];

/**
 * Directory Listing ラボ UI
 *
 * パターンC: useState + fetchText (カスタム状態管理)
 */
export function DirectoryListingLab() {
  const [vulnerableListing, setVulnerableListing] = useState<TextResponse | null>(null);
  const [secureListing, setSecureListing] = useState<TextResponse | null>(null);
  const [fileResults, setFileResults] = useState<Record<string, TextResponse>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading !== null;

  const handleFetchListing = useCallback(async (mode: 'vulnerable' | 'secure') => {
    setLoading(`listing-${mode}`);
    setError(null);
    try {
      const result = await fetchText(`${BASE}/${mode}/static/`);
      if (mode === 'vulnerable') setVulnerableListing(result);
      else setSecureListing(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`取得に失敗しました: ${msg}`);
    }
    setLoading(null);
  }, []);

  const handleFetchFile = useCallback(async (mode: 'vulnerable' | 'secure', filename: string) => {
    const key = `${mode}-${filename}`;
    setLoading(key);
    setError(null);
    try {
      const result = await fetchText(`${BASE}/${mode}/static/${filename}`);
      setFileResults((prev) => ({ ...prev, [key]: result }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`取得に失敗しました: ${msg}`);
    }
    setLoading(null);
  }, []);

  const renderDirectorySection = (
    mode: 'vulnerable' | 'secure',
    listing: TextResponse | null,
  ) => {
    const isHtml = listing && listing.status < 400 && listing.contentType.includes('html');
    return (
      <Tabs
        tabs={[
          {
            id: 'listing',
            label: 'ディレクトリ一覧',
            content: (
              <div>
                <EndpointUrl
                  method="GET"
                  className={styles.mb2}
                  action={
                    <FetchButton onClick={() => handleFetchListing(mode)} disabled={isLoading}>
                      取得
                    </FetchButton>
                  }
                >
                  {BASE}/{mode}/static/
                </EndpointUrl>
                <ExpandableSection isOpen={!!listing}>
                  <div className={styles.mt2}>
                    <div className={styles.statusText}>
                      Status:{' '}
                      <span className={listing?.status !== undefined && listing.status >= 400 ? styles.statusNg : styles.statusOk}>
                        {listing?.status}
                      </span>
                    </div>
                    {isHtml ? (
                      <div
                        className={styles.htmlPreview}
                        dangerouslySetInnerHTML={{ __html: listing?.body ?? '' }}
                      />
                    ) : (
                      <TextViewer result={listing} />
                    )}
                  </div>
                </ExpandableSection>
              </div>
            ),
          },
          ...SENSITIVE_FILES.map((f) => ({
            id: f,
            label: f,
            content: (
              <div>
                <EndpointUrl
                  method="GET"
                  className={styles.mb2}
                  action={
                    <FetchButton onClick={() => handleFetchFile(mode, f)} disabled={isLoading}>
                      取得
                    </FetchButton>
                  }
                >
                  {BASE}/{mode}/static/{f}
                </EndpointUrl>
                <TextViewer result={fileResults[`${mode}-${f}`] ?? null} />
              </div>
            ),
          })),
        ]}
        keepMounted
      />
    );
  };

  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}

      <ComparisonPanel
        vulnerableContent={renderDirectorySection('vulnerable', vulnerableListing)}
        secureContent={renderDirectorySection('secure', secureListing)}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: ディレクトリ一覧が表示され、全ファイルの存在が丸見えか</li>
          <li>脆弱版: <code>config.bak</code> や <code>database.sql</code> の中身が取得できるか</li>
          <li>安全版: ディレクトリ一覧が <strong>403 Forbidden</strong> で拒否されるか</li>
          <li>安全版: ドットファイルやバックアップファイルも <strong>403</strong> で拒否されるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
