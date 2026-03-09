import type { ReactNode } from "react";

type Props = {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

/** バリアントごとのスタイルマッピング */
const variantStyles: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "bg-transparent border border-border hover:bg-bg-secondary",
  danger: "bg-danger text-white hover:bg-danger-hover",
  ghost: "bg-transparent hover:bg-bg-secondary text-text-secondary",
};

/** サイズごとのスタイルマッピング */
const sizeStyles: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xs py-0.5 px-2",
  md: "text-sm py-1.5 px-4",
};

/**
 * 汎用ボタンコンポーネント
 *
 * variant でスタイルバリエーション、size でサイズを指定する。
 * disabled 時は半透明・クリック不可になる。
 */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  onClick,
  children,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`cursor-pointer rounded transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
