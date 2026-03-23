import type { TextResponse } from "@/hooks/useLabFetch";

type TextViewerProps = {
  result: TextResponse | null;
};

/**
 * テキストレスポンスの表示コンポーネント
 * ステータスコードに応じて色分けする
 */
export function TextViewer({ result }: TextViewerProps) {
  if (!result) return <div />;
  const isError = result.status >= 400;
  return (
    <div className="mt-2">
      <div>
        Status:{" "}
        <span className={`font-bold ${isError ? "text-error-text" : "text-secure-text"}`}>
          {result.status}
        </span>
      </div>
      <pre
        className={`${isError ? "bg-error-bg text-error-text" : "bg-vuln-bg text-vuln-text"} p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all text-xs max-h-[300px]`}
        /* max-h-[300px]: テキストレスポンスの最大表示高さ。長いレスポンスをスクロール可能にする */
      >
        {result.body}
      </pre>
    </div>
  );
}
