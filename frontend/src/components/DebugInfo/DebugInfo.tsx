type Props = {
  /** 表示対象のデバッグ情報オブジェクト（null/undefined なら何も表示しない） */
  debug: Record<string, unknown> | null | undefined;
  /** details の summary テキスト */
  summary?: string;
  /** 特定のフィールドをコードブロックで強調表示する */
  codeField?: string;
  className?: string;
};

/**
 * デバッグ情報の折りたたみ表示コンポーネント
 *
 * ラボページの `_debug` オブジェクトを details/summary で表示するパターンを共通化する。
 *
 * @example
 * <DebugInfo debug={result._debug} summary="実行されたSQL" codeField="query" />
 */
export function DebugInfo({
  debug,
  summary = "デバッグ情報",
  codeField,
  className = "",
}: Props) {
  if (!debug) {
    return <div />;
  }

  return (
    <details className={`mt-2 ${className}`.trim()}>
      <summary className="text-xs text-text-muted cursor-pointer">{summary}</summary>
      {codeField && debug[codeField] != null && (
        <pre className="text-xs bg-code-bg text-code-text text-vuln-text p-3 rounded-lg">
          {String(debug[codeField])}
        </pre>
      )}
      {Object.entries(debug)
        .filter(([key]) => key !== codeField)
        .map(([key, value]) => (
          <div key={key} className="text-xs text-text-muted">
            {key}: {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </div>
        ))}
    </details>
  );
}
