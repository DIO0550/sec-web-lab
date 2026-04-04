import type { HeaderResponse } from "@/hooks/useLabFetch";

type HeaderViewerProps = {
  result: HeaderResponse | null;
  mode: "vulnerable" | "secure";
};

/**
 * JSON レスポンス + ヘッダーの表示コンポーネント
 */
export function HeaderViewer({ result, mode }: HeaderViewerProps) {
  if (!result) return <div className="mt-4" />;
  const isVuln = mode === "vulnerable";
  return (
    <div className="mt-4">
      <h4>レスポンスヘッダー</h4>
      <pre className={`${isVuln ? "bg-vuln-bg text-vuln-text" : "bg-secure-bg text-secure-text"} p-4 rounded-xl overflow-auto whitespace-pre-wrap break-all`}>
        {Object.entries(result.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")}
      </pre>
      <h4>レスポンスボディ</h4>
      <pre className="bg-bg-secondary p-4 rounded-xl overflow-auto whitespace-pre-wrap break-all">
        {JSON.stringify(result.body, null, 2)}
      </pre>
    </div>
  );
}
