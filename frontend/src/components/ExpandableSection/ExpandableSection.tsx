import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * CSS Grid ベースの展開アニメーションコンポーネント
 *
 * grid-template-rows: 0fr -> 1fr でスムーズにスライドダウン/アップする。
 * レイアウトシフトを防止するため、children は常に DOM に存在する。
 */
export function ExpandableSection({ isOpen, children, className = "" }: Props) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${className}`.trim()}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
