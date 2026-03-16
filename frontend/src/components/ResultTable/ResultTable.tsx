type Column<T> = {
  key: keyof T & string;
  label: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
};

/**
 * シンプルなデータテーブルコンポーネント
 *
 * ラボページで検索結果や辞書攻撃ログなどを表形式で表示するパターンを共通化する。
 *
 * @example
 * <ResultTable
 *   columns={[
 *     { key: "title", label: "title" },
 *     { key: "content", label: "content" },
 *   ]}
 *   data={result.results}
 * />
 */
export function ResultTable<T extends Record<string, unknown>>({
  columns,
  data,
  className = "",
}: Props<T>) {
  if (data.length === 0) {
    return <div />;
  }

  return (
    <table className={`w-full text-sm border-collapse ${className}`.trim()}>
      <thead>
        <tr className="bg-table-header-bg">
          {columns.map((col) => (
            <th key={col.key} className="p-2 px-3 border border-table-border text-left font-medium">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key} className="p-2 px-3 border border-table-border">
                {String(row[col.key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
