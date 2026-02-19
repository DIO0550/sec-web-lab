import { useState, useCallback } from "react";
import { fetchText, type TextResponse } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { TextViewer } from "../../../components/ResponseViewer";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/directory-listing";
const SENSITIVE_FILES = ["config.bak", "database.sql", ".htpasswd", ".env.backup"];

export function DirectoryListing() {
  const [vulnerableListing, setVulnerableListing] = useState<TextResponse | null>(null);
  const [secureListing, setSecureListing] = useState<TextResponse | null>(null);
  const [fileResults, setFileResults] = useState<Record<string, TextResponse>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const isLoading = loading !== null;

  const handleFetchListing = useCallback(async (mode: "vulnerable" | "secure") => {
    setLoading(`listing-${mode}`);
    try {
      const result = await fetchText(`${BASE}/${mode}/static/`);
      if (mode === "vulnerable") setVulnerableListing(result);
      else setSecureListing(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  }, []);

  const handleFetchFile = useCallback(async (mode: "vulnerable" | "secure", filename: string) => {
    const key = `${mode}-${filename}`;
    setLoading(key);
    try {
      const result = await fetchText(`${BASE}/${mode}/static/${filename}`);
      setFileResults((prev) => ({ ...prev, [key]: result }));
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  }, []);

  const renderDirectorySection = (
    mode: "vulnerable" | "secure",
    listing: TextResponse | null
  ) => {
    const isHtml = listing && listing.status < 400 && listing.contentType.includes("html");
    return (
      <>
        <h4>1. ディレクトリ一覧の取得</h4>
        <p className="text-[13px]"><code>GET {BASE}/{mode}/static/</code></p>
        <FetchButton onClick={() => handleFetchListing(mode)} disabled={isLoading}>
          ディレクトリ一覧を取得
        </FetchButton>
        {listing && (
          <div className="mt-2">
            <div className="text-[13px]">
              Status: <span className={`${listing.status >= 400 ? "text-[#c00]" : "text-[#080]"} font-bold`}>{listing.status}</span>
            </div>
            {isHtml ? (
              <div
                className="bg-white border border-[#ccc] p-3 rounded mt-1 max-h-[300px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: listing.body }}
              />
            ) : (
              <TextViewer result={listing} />
            )}
          </div>
        )}

        <h4 className="mt-4">2. 機密ファイルの取得</h4>
        <p className="text-[13px]">
          {mode === "vulnerable" ? "一覧で見つけたファイルにアクセス:" : "機密ファイルへのアクセスを試行:"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {SENSITIVE_FILES.map((f) => (
            <FetchButton key={f} onClick={() => handleFetchFile(mode, f)} disabled={isLoading} size="small">
              {f}
            </FetchButton>
          ))}
        </div>
        <TextViewer result={fileResults[`${mode}-${SENSITIVE_FILES.find((f) => fileResults[`${mode}-${f}`])}`] ?? null} />
        {/* 全ファイル結果を表示 */}
        {SENSITIVE_FILES.filter((f) => fileResults[`${mode}-${f}`]).map((f) => (
          <div key={f} className="mt-2">
            <code className="text-xs">{f}</code>
            <TextViewer result={fileResults[`${mode}-${f}`] ?? null} />
          </div>
        ))}
      </>
    );
  };

  return (
    <LabLayout
      title="Directory Listing"
      subtitle="ディレクトリリスティングによる情報漏洩"
      description="ディレクトリにアクセスするとファイル一覧が表示され、バックアップファイルや機密ファイルの存在が判明する脆弱性です。"
    >
      <ComparisonPanel
        vulnerableContent={renderDirectorySection("vulnerable", vulnerableListing)}
        secureContent={renderDirectorySection("secure", secureListing)}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: ディレクトリ一覧が表示され、全ファイルの存在が丸見えか</li>
          <li>脆弱版: <code>config.bak</code> や <code>database.sql</code> の中身が取得できるか</li>
          <li>安全版: ディレクトリ一覧が <strong>403 Forbidden</strong> で拒否されるか</li>
          <li>安全版: ドットファイルやバックアップファイルも <strong>403</strong> で拒否されるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
