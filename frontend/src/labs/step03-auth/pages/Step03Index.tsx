import { Link } from "react-router-dom";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step03");

/**
 * Step03: Auth（認証）のラボ一覧ページ
 */
export function Step03Index() {
  return (
    <div>
      <h2>Step 03: Authentication (認証)</h2>
      <p>
        パスワードの保存方法・認証の仕組みに関する脆弱性を体験します。
        平文保存、弱いハッシュ、ブルートフォース、デフォルト認証情報、弱いパスワードポリシーなど、
        認証に関わる代表的な問題を<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>で学べます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-border-light dark:border-border-light rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step03/${lab.id}`} className="no-underline">
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
                to={`/step03/${lab.id}`}
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
