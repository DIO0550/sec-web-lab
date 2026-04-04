import { useState, useCallback } from "react";
import { fetchText, type TextResponse } from "@/hooks/useLabFetch";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { TextViewer } from "@/components/ResponseViewer";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Tabs } from "@/components/Tabs";
import { EndpointUrl } from "@/components/EndpointUrl";

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
      <Tabs
        tabs={[
          {
            id: "listing",
            label: "ディレクトリ一覧",
            content: (
              <div>
                <EndpointUrl
                  method="GET"
                  className="mb-2"
                  action={
                    <FetchButton onClick={() => handleFetchListing(mode)} disabled={isLoading}>
                      取得
                    </FetchButton>
                  }
                >
                  {BASE}/{mode}/static/
                </EndpointUrl>
                <ExpandableSection isOpen={!!listing}>
                  <div className="mt-2">
                    <div className="text-sm">
                      Status: <span className={`${listing?.status !== undefined && listing.status >= 400 ? "text-status-ng" : "text-status-ok"} font-bold`}>{listing?.status}</span>
                    </div>
                    {isHtml ? (
                      <div
                        className="bg-bg-primary border border-input-border p-3 rounded mt-1 max-h-[300px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: listing?.body ?? "" }}
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
                  className="mb-2"
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
