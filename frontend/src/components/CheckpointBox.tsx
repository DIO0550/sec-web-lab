import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  variant?: "default" | "warning";
};

const VARIANT_CLASS = {
  default: "bg-bg-tertiary dark:bg-bg-tertiary",
  warning: "bg-warning-bg dark:bg-warning-bg",
} as const;

/**
 * 確認ポイントや注意事項を表示するボックス
 */
export function CheckpointBox({ title = "確認ポイント", children, variant = "default" }: Props) {
  return (
    <div className={`mt-8 p-4 rounded ${VARIANT_CLASS[variant]}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
