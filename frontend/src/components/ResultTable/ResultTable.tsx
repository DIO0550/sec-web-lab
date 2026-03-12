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
  if (data.length === 0) return null;

  return (
    <table className={`w-full text-xs border-collapse ${className}`.trim()}>
      <thead>
        <tr className="bg-[#f5f5f5]">
          {columns.map((col) => (
            <th key={col.key} className="p-1 border border-[#ddd] text-left">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key} className="p-1 border border-[#ddd]">
                {String(row[col.key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
