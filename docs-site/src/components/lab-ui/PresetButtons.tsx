import { Button } from './Button';
import styles from './PresetButtons.module.css';

type Props<T extends { label: string }> = {
  presets: T[];
  onSelect: (preset: T) => void;
  className?: string;
};

/**
 * プリセット選択ボタン群
 *
 * ラボページでよく使われる「プリセット:」+ ゴーストボタン群のパターンを共通化する。
 */
export function PresetButtons<T extends { label: string }>({
  presets,
  onSelect,
  className = '',
}: Props<T>) {
  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <span className={styles.label}>プリセット:</span>
      <div className={styles.buttons}>
        {presets.map((p) => (
          <Button key={p.label} variant="ghost" size="sm" onClick={() => onSelect(p)}>
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
