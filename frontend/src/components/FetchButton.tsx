import type { ReactNode } from "react";
import { Button } from "@/components/Button";

type Props = {
  onClick: () => void;
  disabled: boolean;
  loadingText?: string;
  isLoading?: boolean;
  children: ReactNode;
  size?: "normal" | "small";
};

/** FetchButton の size を Button の size にマッピング */
const sizeMap: Record<NonNullable<Props["size"]>, "sm" | "md"> = {
  normal: "md",
  small: "sm",
};

/**
 * ローディング状態付きの実行ボタン
 *
 * 内部で共通 Button コンポーネントを使用。
 * isLoading 時は disabled にし、loadingText があればそれを表示する。
 */
export function FetchButton({
  onClick,
  disabled,
  loadingText,
  isLoading,
  children,
  size = "normal",
}: Props) {
  return (
    <Button
      variant="primary"
      size={sizeMap[size]}
      disabled={disabled || !!isLoading}
      onClick={onClick}
    >
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
