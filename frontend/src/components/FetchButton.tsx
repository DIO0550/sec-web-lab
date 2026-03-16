import type { ReactNode } from "react";
import { Button } from "@/components/Button";

type Props = {
  onClick: () => void;
  disabled: boolean;
  loadingText?: string;
  isLoading?: boolean;
  children: ReactNode;
};

/**
 * ローディング状態付きの実行ボタン
 *
 * 内部で共通 Button コンポーネントを使用。
 * isLoading 時は disabled にし、loadingText があればそれを表示する。
 * 常に md サイズで表示される。
 */
export function FetchButton({
  onClick,
  disabled,
  loadingText,
  isLoading,
  children,
}: Props) {
  return (
    <Button
      variant="primary"
      size="md"
      disabled={disabled || !!isLoading}
      onClick={onClick}
    >
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
