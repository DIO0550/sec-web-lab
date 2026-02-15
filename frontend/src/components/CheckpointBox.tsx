import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  variant?: "default" | "warning";
};

const STYLES = {
  default: { background: "#f0f0f0" },
  warning: { background: "#fff8e1" },
} as const;

/**
 * 確認ポイントや注意事項を表示するボックス
 */
export function CheckpointBox({ title = "確認ポイント", children, variant = "default" }: Props) {
  return (
    <div style={{ marginTop: 32, padding: 16, borderRadius: 4, ...STYLES[variant] }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
