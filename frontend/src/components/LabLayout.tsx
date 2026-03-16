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
      <div className="mb-8">
        <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">
          {title}
        </h2>
        <p className="text-sm text-accent font-medium mt-1.5">
          {subtitle}
        </p>
        <p className="mt-1.5 text-text-secondary">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
