import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  description: string;
  children: ReactNode;
};

/**
 * ラボページ共通のレイアウトラッパー
 * タイトル・サブタイトル・説明を統一的に表示する
 */
export function LabLayout({ title, subtitle, description, children }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <p className="text-[#666]">{description}</p>
      {children}
    </div>
  );
}
