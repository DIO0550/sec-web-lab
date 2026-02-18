import type { TextResponse, HeaderResponse } from "../hooks/useLabFetch";

// --- ヘッダー付きレスポンスの表示 ---

type HeaderViewerProps = {
  result: HeaderResponse | null;
  mode: "vulnerable" | "secure";
};

/**
 * JSON レスポンス + ヘッダーの表示コンポーネント
 */
export function HeaderViewer({ result, mode }: HeaderViewerProps) {
  if (!result) return null;
  const isVuln = mode === "vulnerable";
  return (
    <div className="mt-4">
      <h4>レスポンスヘッダー</h4>
      <pre className={`${isVuln ? "bg-vuln-bg text-vuln-text" : "bg-secure-bg text-secure-text"} p-3 rounded overflow-auto`}>
        {Object.entries(result.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")}
      </pre>
      <h4>レスポンスボディ</h4>
      <pre className="bg-[#f5f5f5] p-3 rounded overflow-auto">
        {JSON.stringify(result.body, null, 2)}
      </pre>
    </div>
  );
}

// --- テキストレスポンスの表示 ---

type TextViewerProps = {
  result: TextResponse | null;
};

/**
 * テキストレスポンスの表示コンポーネント
 * ステータスコードに応じて色分けする
 */
export function TextViewer({ result }: TextViewerProps) {
  if (!result) return null;
  const isError = result.status >= 400;
  return (
    <div className="mt-2">
      <div>
        Status:{" "}
        <span className={`font-bold ${isError ? "text-[#c00]" : "text-[#080]"}`}>
          {result.status}
        </span>
      </div>
      <pre
        className={`${isError ? "bg-error-bg text-error-text" : "bg-vuln-bg text-vuln-text"} p-3 rounded overflow-auto text-[13px] max-h-[200px]`}
      >
        {result.body}
      </pre>
    </div>
  );
}

// --- JSON テキストレスポンスの表示（ErrorMessageLeakage 用） ---

type JsonTextViewerProps = {
  result: { status: number; body: string } | null;
};

/**
 * JSON 形式のテキストレスポンス表示
 * JSON パース可能ならインデント表示する
 */
export function JsonTextViewer({ result }: JsonTextViewerProps) {
  if (!result) return null;
  const isError = result.status >= 400;
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(result.body), null, 2);
  } catch {
    formatted = result.body;
  }
  return (
    <div className="mt-1">
      <span className={`font-bold text-[13px] ${isError ? "text-[#c00]" : "text-[#080]"}`}>
        {result.status}
      </span>
      <pre
        className={`bg-vuln-bg ${isError ? "text-vuln-text" : "text-secure-text"} p-2.5 rounded overflow-auto text-xs max-h-[200px]`}
      >
        {formatted}
      </pre>
    </div>
  );
}
