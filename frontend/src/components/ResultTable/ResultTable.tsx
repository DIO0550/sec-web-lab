import type { ReactNode } from "react";

export type Column<T> = {
  key: keyof T & string;
  label: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  /** セルの描画をカスタマイズ。undefined を返すとデフォルトの String() 表示 */
  renderCell?: (column: Column<T>, value: unknown, row: T, rowIndex: number) => ReactNode | undefined;
  /** 行単位のクラス名を返す（条件付き色分け等） */
  getRowClassName?: (row: T, rowIndex: number) => string;
  /** セル単位のクラス名を返す */
  getCellClassName?: (column: Column<T>, row: T) => string;
  /** 行のキー指定（デフォルトは行インデックス） */
  rowKey?: keyof T & string;
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
  renderCell,
  getRowClassName,
  getCellClassName,
  rowKey,
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
          <tr key={rowKey ? String(row[rowKey]) : i} className={getRowClassName?.(row, i) ?? ""}>
            {columns.map((col) => {
              const custom = renderCell?.(col, row[col.key], row, i);
              return (
                <td
                  key={col.key}
                  className={`p-2 px-3 border border-table-border ${getCellClassName?.(col, row) ?? ""}`.trim()}
                >
                  {custom !== undefined ? custom : String(row[col.key] ?? "")}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
