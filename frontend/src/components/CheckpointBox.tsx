import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  variant?: "default" | "warning";
};

const VARIANT_CLASS = {
  default: "bg-[#f0f0f0]",
  warning: "bg-[#fff8e1]",
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
