import { useParams, Navigate } from "react-router-dom";
import { Card } from "@/components/Card";
import { DifficultyStars } from "@/components/DifficultyStars";
import { getStep, getLabsForStep } from "@/data/navigation";

/**
 * 全ステップ共通のインデックスページコンポーネント
 * URL パラメータの stepId からステップ情報とラボ一覧を取得して描画する
 */
export function StepIndexPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const step = stepId ? getStep(stepId) : undefined;

  // 不正な stepId の場合はホームにリダイレクト
  if (!step || !stepId) {
    return <Navigate to="/" replace />;
  }

  const labs = getLabsForStep(stepId);

  return (
    <div>
      <h2 className="text-2xl font-semibold border-l-4 border-accent pl-3">
        {step.name}
      </h2>
      <p dangerouslySetInnerHTML={{ __html: step.intro }} />

      <div className="mt-6">
        {labs.map((lab) => (
          <Card
            key={lab.id}
            variant="bordered"
            to={`/${stepId}/${lab.id}`}
            className="mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">{lab.name}</h3>
              <p className="m-0 text-text-secondary text-sm">
                {lab.description}
              </p>
            </div>
            <div className="text-right">
              <DifficultyStars level={lab.difficulty} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
