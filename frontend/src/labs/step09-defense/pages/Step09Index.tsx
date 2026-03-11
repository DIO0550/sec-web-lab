import { Card } from "@/components/Card";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step09");

export function Step09Index() {
  return (
    <div>
      <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">Step 09: Defense (守りを固める)</h2>
      <p>
        守りの観点からセキュリティを強化する方法を体験します。
        適切なエラーハンドリング、ログ管理、Fail-Closed設計、CSP、入力バリデーションなど、
        攻撃を防ぐための防御的な実装パターンを学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <Card
            key={lab.id}
            variant="bordered"
            to={`/step09/${lab.id}`}
            className="mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">{lab.name}</h3>
              <p className="m-0 text-text-secondary dark:text-text-secondary text-sm">{lab.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted dark:text-text-muted">
                {"★".repeat(lab.difficulty)}{"☆".repeat(3 - lab.difficulty)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
