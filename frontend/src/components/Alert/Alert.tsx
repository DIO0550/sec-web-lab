import type { ReactNode } from "react";

type Props = {
  variant: "success" | "error" | "warning" | "info";
  title?: string;
  children?: ReactNode;
  className?: string;
};

/** バリアントごとのスタイルマッピング */
const variantStyles: Record<Props["variant"], string> = {
  success: "bg-success-bg border-success-border text-success-text",
  error: "bg-error-bg-light border-error-border text-error-text-light",
  warning: "bg-warning-bg border-warning-border text-warning-text",
  info: "bg-info-bg border-info-border text-info-text",
};

/**
 * アラートコンポーネント
 *
 * 成功・エラー・警告・情報の4バリアントでフィードバックを表示する。
 * セマンティックカラーを使用し、ダークモードに自動対応する。
 */
export function Alert({
  variant,
  title,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`p-4 rounded-xl border-l-4 ${variantStyles[variant]} ${className}`.trim()}
    >
      {title && <div className="font-semibold">{title}</div>}
      {children}
    </div>
  );
}
