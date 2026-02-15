import type { TextResponse, HeaderResponse } from "../hooks/useLabFetch";

// --- テーマカラー定数 ---
const COLORS = {
  vulnerable: { bg: "#1a1a2e", text: "#e94560" },
  secure: { bg: "#1a2e1a", text: "#4ecdc4" },
  error: { bg: "#2e1a1a", text: "#ff6b6b" },
} as const;

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
  const theme = COLORS[mode];
  return (
    <div style={{ marginTop: 16 }}>
      <h4>レスポンスヘッダー</h4>
      <pre style={{ background: theme.bg, color: theme.text, padding: 12, borderRadius: 4, overflow: "auto" }}>
        {Object.entries(result.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")}
      </pre>
      <h4>レスポンスボディ</h4>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4, overflow: "auto" }}>
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
  const theme = isError ? COLORS.error : COLORS.vulnerable;
  return (
    <div style={{ marginTop: 8 }}>
      <div>
        Status:{" "}
        <span style={{ color: isError ? "#c00" : "#080", fontWeight: "bold" }}>
          {result.status}
        </span>
      </div>
      <pre
        style={{
          background: theme.bg,
          color: theme.text,
          padding: 12,
          borderRadius: 4,
          overflow: "auto",
          fontSize: 13,
          maxHeight: 200,
        }}
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
    <div style={{ marginTop: 4 }}>
      <span style={{ color: isError ? "#c00" : "#080", fontWeight: "bold", fontSize: 13 }}>
        {result.status}
      </span>
      <pre
        style={{
          background: "#1a1a2e",
          color: isError ? "#e94560" : "#4ecdc4",
          padding: 10,
          borderRadius: 4,
          overflow: "auto",
          fontSize: 12,
          maxHeight: 200,
        }}
      >
        {formatted}
      </pre>
    </div>
  );
}
