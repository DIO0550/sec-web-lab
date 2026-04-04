import type { ComponentProps } from "react";

type Props = {
  /** ラベルテキスト（指定時に input の上に表示） */
  label?: string;
  /** エラーメッセージ（指定時に input の下に赤字で表示） */
  error?: string;
  /** ラッパー div に追加するクラス名 */
  className?: string;
} & ComponentProps<"input">;

/**
 * ラベル・エラー表示付きの入力コンポーネント
 *
 * label, error, className を抽出し、残りの props を <input> にそのまま展開する。
 * フォーカス時にボーダーとリングで視覚的フィードバックを提供する。
 */
export function Input({ label, error, className = "", ...rest }: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium block mb-1">{label}</label>
      )}
      <input
        {...rest}
        className="py-2 px-3 border border-input-border rounded-md w-full bg-bg-primary text-text-primary transition-all duration-200 focus:border-input-focus focus:ring-2 focus:ring-accent/20 outline-none"
      />
      {error && (
        <p className="text-error-text-light text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
