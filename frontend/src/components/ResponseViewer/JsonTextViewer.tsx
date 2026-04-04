type JsonTextViewerProps = {
  result: { status: number; body: string } | null;
};

/**
 * JSON 形式のテキストレスポンス表示
 * JSON パース可能ならインデント表示する
 */
export function JsonTextViewer({ result }: JsonTextViewerProps) {
  if (!result) return <div />;
  const isError = result.status >= 400;
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(result.body), null, 2);
  } catch {
    formatted = result.body;
  }
  return (
    <div className="mt-1">
      <span className={`font-bold text-xs ${isError ? "text-error-text" : "text-secure-text"}`}>
        {result.status}
      </span>
      <pre
        className={`bg-vuln-bg ${isError ? "text-vuln-text" : "text-secure-text"} p-4 rounded-xl overflow-auto whitespace-pre-wrap break-all text-xs max-h-[200px]`}
        /* max-h-[200px]: JSONレスポンスの最大表示高さ。コンパクトな表示を維持するため TextViewer より小さい値を使用 */
      >
        {formatted}
      </pre>
    </div>
  );
}
