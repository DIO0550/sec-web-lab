type Props = {
  level: number;
  max?: number;
};

/** 難易度を星で表示するコンポーネント */
export function DifficultyStars({ level, max = 3 }: Props) {
  const clamped = Math.max(0, Math.min(level, max));
  return (
    <span className="text-xs text-text-muted">
      {"★".repeat(clamped)}
      {"☆".repeat(max - clamped)}
    </span>
  );
}
