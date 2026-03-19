import type { ReactNode } from 'react';
import { Button } from './Button';

type Props = {
  onClick: () => void;
  disabled: boolean;
  loadingText?: string;
  isLoading?: boolean;
  children: ReactNode;
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
