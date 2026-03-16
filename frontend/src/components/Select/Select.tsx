import type { ComponentProps } from "react";

type Props = {
  /** ラベルテキスト（指定時に select の上に表示） */
  label?: string;
  /** 選択肢の配列 */
  options: { value: string; label: string }[];
  /** ラッパー div に追加するクラス名 */
  className?: string;
} & Omit<ComponentProps<"select">, "children">;

/**
 * ラベル付きセレクトコンポーネント
 *
 * options 配列から <option> 要素を自動生成する。
 * Input と同様のスタイルパターンを適用する。
 */
export function Select({
  label,
  options,
  className = "",
  ...rest
}: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium block mb-1">{label}</label>
      )}
      <select
        {...rest}
        className="py-2 px-3 border border-input-border rounded-lg w-full bg-bg-primary text-text-primary focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
