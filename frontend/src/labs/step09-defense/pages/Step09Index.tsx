import { Link } from "react-router-dom";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step09");

export function Step09Index() {
  return (
    <div>
      <h2>Step 09: Defense (守りを固める)</h2>
      <p>
        守りの観点からセキュリティを強化する方法を体験します。
        適切なエラーハンドリング、ログ管理、Fail-Closed設計、CSP、入力バリデーションなど、
        攻撃を防ぐための防御的な実装パターンを学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-border-light dark:border-border-light rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step09/${lab.id}`} className="no-underline">
                  {lab.name}
                </Link>
              </h3>
              <p className="m-0 text-text-secondary dark:text-text-secondary text-sm">{lab.description}</p>
            </div>
            <div className="text-right min-w-[80px]">
              <span className="text-xs text-text-muted dark:text-text-muted">
                {"★".repeat(lab.difficulty)}{"☆".repeat(3 - lab.difficulty)}
              </span>
              <br />
              <Link
                to={`/step09/${lab.id}`}
                className="inline-block mt-1 px-3 py-1 bg-accent dark:bg-accent text-white rounded no-underline text-[13px] hover:bg-accent-hover dark:hover:bg-accent-hover"
              >
                Start
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
