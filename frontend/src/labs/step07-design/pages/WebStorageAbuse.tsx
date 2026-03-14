import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/web-storage-abuse";

type StorageResult = {
  success: boolean;
  message: string;
  token?: string;
  _debug?: { message: string; risks?: string[]; xssPayload?: string };
};

function StoragePanel({
  mode,
  result,
  isLoading,
  onLogin,
}: {
  mode: "vulnerable" | "secure";
  result: StorageResult | null;
  isLoading: boolean;
  onLogin: () => void;
}) {
  return (
    <div>
      <p className="text-xs text-text-secondary mb-2">admin / admin123 でログイン</p>
      <FetchButton onClick={onLogin} disabled={isLoading}>
        ログイン
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className={`mt-2 p-3 rounded ${result?.success ? "bg-success-bg border border-success-border" : "bg-error-bg-light border border-error-border"}`}>
          <div className="text-sm font-bold">{result?.message}</div>
          {result?.token && (
            <div className="mt-2">
              <div className="text-xs font-bold">レスポンスに含まれるトークン:</div>
              <pre className="text-xs bg-code-bg p-2 rounded mt-1 overflow-auto break-all">{result?.token}</pre>
              <div className="text-xs text-error-text-light mt-1">
                → フロントエンドがlocalStorage.setItem("token", ...) で保存する想定
              </div>
            </div>
          )}
          {!result?.token && result?.success && (
            <div className="text-xs text-success-text mt-1">
              トークンはHttpOnly Cookieに保存（JavaScriptからアクセス不可）
            </div>
          )}
          {result?._debug && (
            <div className="mt-2">
              <div className="text-xs text-text-muted italic">{result?._debug.message}</div>
              {result?._debug.risks && (
                <ul className="text-xs text-error-text-light mt-1">
                  {result?._debug.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
              {result?._debug.xssPayload && (
                <div className="mt-1">
                  <div className="text-xs font-bold text-error-text-light">XSS窃取コード:</div>
                  <pre className="text-[10px] bg-warning-bg p-1 rounded overflow-auto">{result?._debug.xssPayload}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

export function WebStorageAbuse() {
  const result = useComparisonFetch<StorageResult>(BASE);

  const handleLogin = async (mode: "vulnerable" | "secure") => {
    await result.postJson(mode, "/login", { username: "admin", password: "admin123" }, (e) => ({
      success: false,
      message: (e as Error).message,
    }));
  };

  return (
    <LabLayout
      title="Web Storageの不適切な使用"
      subtitle="localStorage/sessionStorageへの機密データ保存"
      description="JWTトークンをlocalStorageに保存すると、XSS攻撃でlocalStorage.getItem()でトークンを窃取される脆弱性を体験します。HttpOnly Cookieによる安全な代替手段を学びます。"
    >
      <ComparisonPanel
        vulnerableContent={<StoragePanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onLogin={() => handleLogin("vulnerable")} />}
        secureContent={<StoragePanel mode="secure" result={result.secure} isLoading={result.loading} onLogin={() => handleLogin("secure")} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: トークンがレスポンスボディに含まれている（localStorageに保存される想定）か</li>
          <li>安全版: トークンがHttpOnly Cookieに設定されているか</li>
          <li>XSSがあった場合のlocalStorage vs HttpOnly Cookieの安全性の違いを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
