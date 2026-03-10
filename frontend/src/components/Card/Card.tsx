import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  variant?: "default" | "bordered";
  className?: string;
  to?: string;
  children: ReactNode;
};

/** バリアントごとのスタイルマッピング */
const variantStyles: Record<NonNullable<Props["variant"]>, string> = {
  default: "bg-bg-primary rounded p-4",
  bordered: "bg-bg-primary border border-border-light rounded p-4",
};

/** インタラクティブカード用のスタイル（to 指定時のみ適用） */
const interactiveStyles =
  "block no-underline text-inherit cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-bg-secondary hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

/**
 * カードコンポーネント
 *
 * コンテンツをカード状のコンテナで囲む。
 * bordered バリアントはボーダー付きで視覚的に区切りを表現する。
 * to を指定するとカード全体がクリック可能なリンクになり、ホバー効果が有効になる。
 */
export function Card({
  variant = "default",
  className = "",
  to,
  children,
}: Props) {
  const baseClassName = `${variantStyles[variant]} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={`${baseClassName} ${interactiveStyles}`}>
        {children}
      </Link>
    );
  }

  return (
    <div className={baseClassName}>
      {children}
    </div>
  );
}
