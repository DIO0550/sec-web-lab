import { Card } from "@/components/Card";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step03");

/**
 * Step03: Auth（認証）のラボ一覧ページ
 */
export function Step03Index() {
  return (
    <div>
      <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">Step 03: Authentication (認証)</h2>
      <p>
        パスワードの保存方法・認証の仕組みに関する脆弱性を体験します。
        平文保存、弱いハッシュ、ブルートフォース、デフォルト認証情報、弱いパスワードポリシーなど、
        認証に関わる代表的な問題を<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>で学べます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <Card
            key={lab.id}
            variant="bordered"
            to={`/step03/${lab.id}`}
            className="mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">{lab.name}</h3>
              <p className="m-0 text-text-secondary text-sm">{lab.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted">
                {"★".repeat(lab.difficulty)}{"☆".repeat(3 - lab.difficulty)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
