import type { ReactNode } from "react";

type Props = {
  onClick: () => void;
  disabled: boolean;
  loadingText?: string;
  isLoading?: boolean;
  children: ReactNode;
  size?: "normal" | "small";
};

/**
 * ローディング状態付きの実行ボタン
 */
export function FetchButton({
  onClick,
  disabled,
  loadingText,
  isLoading,
  children,
  size = "normal",
}: Props) {
  const style = size === "small" ? { fontSize: 12 } : {};
  return (
    <button onClick={onClick} disabled={disabled} style={style}>
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
