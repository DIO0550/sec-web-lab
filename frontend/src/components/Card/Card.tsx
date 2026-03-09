import type { ReactNode } from "react";

type Props = {
  variant?: "default" | "bordered";
  className?: string;
  children: ReactNode;
};

/** バリアントごとのスタイルマッピング */
const variantStyles: Record<NonNullable<Props["variant"]>, string> = {
  default: "bg-bg-primary rounded p-4",
  bordered: "bg-bg-primary border border-border-light rounded p-4",
};

/**
 * カードコンポーネント
 *
 * コンテンツをカード状のコンテナで囲む。
 * bordered バリアントはボーダー付きで視覚的に区切りを表現する。
 */
export function Card({
  variant = "default",
  className = "",
  children,
}: Props) {
  return (
    <div className={`${variantStyles[variant]} ${className}`.trim()}>
      {children}
    </div>
  );
}
