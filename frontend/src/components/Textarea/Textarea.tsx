import type { ComponentProps } from "react";

type Props = {
  /** ラベルテキスト（指定時に textarea の上に表示） */
  label?: string;
  /** 等幅フォント + 小文字サイズ（コード入力用） */
  mono?: boolean;
  /** ラッパー div に追加するクラス名 */
  className?: string;
} & ComponentProps<"textarea">;

/**
 * ラベル付きテキストエリアコンポーネント
 *
 * Input と同様のスタイルパターンを適用する。
 * mono=true でコード入力に適した等幅フォントになる。
 */
export function Textarea({
  label,
  mono = false,
  className = "",
  rows = 4,
  ...rest
}: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium block mb-1">{label}</label>
      )}
      <textarea
        rows={rows}
        {...rest}
        className={`py-2 px-3 border border-input-border rounded-lg w-full bg-bg-primary text-text-primary focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}
