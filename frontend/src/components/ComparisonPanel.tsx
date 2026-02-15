import type { ReactNode } from "react";

type Props = {
  vulnerableContent: ReactNode;
  secureContent: ReactNode;
};

/**
 * 脆弱バージョン / 安全バージョンの横並び比較レイアウト
 */
export function ComparisonPanel({ vulnerableContent, secureContent }: Props) {
  return (
    <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ color: "#c00" }}>脆弱バージョン</h3>
        {vulnerableContent}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ color: "#080" }}>安全バージョン</h3>
        {secureContent}
      </div>
    </div>
  );
}
