import { Link } from "react-router-dom";
import { getLabsForStep } from "@/data/navigation";

const LABS = getLabsForStep("step04");

/**
 * Step04: Session（セッション管理）のラボ一覧ページ
 */
export function Step04Index() {
  return (
    <div>
      <h2>Step 04: Session Management (セッション管理)</h2>
      <p>
        Cookieベースのセッション管理に関する脆弱性を体験します。
        Cookie属性の不備、セッション固定、セッションハイジャック、CSRFなど、
        セッション管理に関わる代表的な問題を
        <strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>
        で学べます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-border-light dark:border-border-light rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step04/${lab.id}`} className="no-underline">
                  {lab.name}
                </Link>
              </h3>
              <p className="m-0 text-text-secondary dark:text-text-secondary text-sm">{lab.description}</p>
            </div>
            <div className="text-right min-w-[80px]">
              <span className="text-xs text-text-muted dark:text-text-muted">
                {"★".repeat(lab.difficulty)}
                {"☆".repeat(3 - lab.difficulty)}
              </span>
              <br />
              <Link
                to={`/step04/${lab.id}`}
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
