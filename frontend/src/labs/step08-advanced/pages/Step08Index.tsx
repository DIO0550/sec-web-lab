import { Card } from "@/components/Card";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step08");

export function Step08Index() {
  return (
    <div>
      <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">Step 08: Advanced Techniques (高度な攻撃テクニック)</h2>
      <p>
        より高度な攻撃テクニックを体験します。
        JWT改ざん、テンプレートインジェクション、レースコンディション、
        Prototype Pollutionなど、実際の脆弱性診断で発見される高度な脆弱性を学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <Card
            key={lab.id}
            variant="bordered"
            to={`/step08/${lab.id}`}
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
