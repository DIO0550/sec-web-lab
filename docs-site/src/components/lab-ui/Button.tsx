import type { ReactNode } from 'react';
import styles from './Button.module.css';

type Props = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

/**
 * 汎用ボタンコンポーネント
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  children,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
