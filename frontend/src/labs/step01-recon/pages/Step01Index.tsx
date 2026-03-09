import { Link } from "react-router-dom";
import { Card } from "@/components/Card";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step01");

/**
 * Step01: Recon（偵察フェーズ）のラボ一覧ページ
 */
export function Step01Index() {
  return (
    <div>
      <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">Step 01: Recon (偵察フェーズ)</h2>
      <p>
        攻撃者がターゲットの情報を収集するフェーズで悪用される脆弱性を体験します。
        各ラボには<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>があり、
        攻撃と防御の両方を学べます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <Card
            key={lab.id}
            variant="bordered"
            className="mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step01/${lab.id}`} className="no-underline">
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
                to={`/step01/${lab.id}`}
                className="inline-block mt-1 px-3 py-1 bg-accent dark:bg-accent text-white rounded no-underline text-[13px] hover:bg-accent-hover dark:hover:bg-accent-hover"
              >
                Start
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
