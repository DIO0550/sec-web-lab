import { Link } from "react-router-dom";
import { Card } from "@/components/Card";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step07");

export function Step07Index() {
  return (
    <div>
      <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">Step 07: Design & Logic (設計とロジックの問題)</h2>
      <p>
        アプリケーションの設計やビジネスロジックに起因する脆弱性を体験します。
        レート制限の欠如、不適切なキャッシュ制御、セキュリティヘッダーの未設定など、
        実装ミスだけでなく設計段階で防ぐべき問題を学びます。
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
                <Link to={`/step07/${lab.id}`} className="no-underline">
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
                to={`/step07/${lab.id}`}
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
