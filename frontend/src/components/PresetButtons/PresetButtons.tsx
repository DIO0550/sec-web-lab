import { Button } from "@/components/Button";

type Props<T extends { label: string }> = {
  presets: T[];
  onSelect: (preset: T) => void;
  className?: string;
};

/**
 * プリセット選択ボタン群
 *
 * ラボページでよく使われる「プリセット:」+ ゴーストボタン群のパターンを共通化する。
 *
 * @example
 * const presets = [
 *   { label: "正常ログイン", username: "admin", password: "admin123" },
 *   { label: "' OR 1=1 --", username: "' OR 1=1 --", password: "anything" },
 * ];
 * <PresetButtons
 *   presets={presets}
 *   onSelect={(p) => { setUsername(p.username); setPassword(p.password); }}
 * />
 */
export function PresetButtons<T extends { label: string }>({
  presets,
  onSelect,
  className = "",
}: Props<T>) {
  return (
    <div className={className}>
      <span className="text-xs text-text-muted">プリセット:</span>
      <div className="flex gap-2 flex-wrap mt-1.5">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant="ghost"
            size="sm"
            onClick={() => onSelect(p)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
