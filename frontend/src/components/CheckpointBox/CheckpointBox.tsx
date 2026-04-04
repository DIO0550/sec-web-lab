import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  variant?: "default" | "warning";
};

const VARIANT_CLASS = {
  default: "bg-bg-tertiary",
  warning: "bg-warning-bg",
} as const;

/**
 * 確認ポイントや注意事項を表示するボックス
 */
export function CheckpointBox({ title = "確認ポイント", children, variant = "default" }: Props) {
  return (
    <div className={`mt-10 p-6 rounded-xl ${VARIANT_CLASS[variant]}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}
