import type { ReactNode } from "react";
import { Tabs } from "./Tabs";

type Props = {
  vulnerableContent: ReactNode;
  secureContent: ReactNode;
};

/**
 * 脆弱バージョン / 安全バージョンのタブ切り替え比較レイアウト
 */
export function ComparisonPanel({ vulnerableContent, secureContent }: Props) {
  return (
    <div className="mt-8">
      <Tabs
        keepMounted
        tabs={[
          {
            id: "vulnerable",
            label: <span className="text-vuln-text font-semibold">脆弱バージョン</span>,
            content: vulnerableContent,
          },
          {
            id: "secure",
            label: <span className="text-secure-text font-semibold">安全バージョン</span>,
            content: secureContent,
          },
        ]}
      />
    </div>
  );
}
