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
    <div className="flex gap-6 mt-6">
      <div className="flex-1">
        <h3 className="text-[#c00]">脆弱バージョン</h3>
        {vulnerableContent}
      </div>
      <div className="flex-1">
        <h3 className="text-[#080]">安全バージョン</h3>
        {secureContent}
      </div>
    </div>
  );
}
