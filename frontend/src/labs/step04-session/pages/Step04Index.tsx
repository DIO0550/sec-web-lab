import { Link } from "react-router-dom";

const LABS = [
  {
    id: "cookie-manipulation",
    name: "Cookie属性の不備",
    description:
      "セッションCookieにHttpOnly・Secure・SameSite属性が設定されていないと、XSSでの窃取、HTTP傍受、CSRF攻撃が可能になる",
    difficulty: 1,
  },
  {
    id: "session-fixation",
    name: "セッション固定攻撃",
    description:
      "ログイン時にセッションIDを再生成しないと、攻撃者が事前に仕込んだIDで被害者のセッションを乗っ取れる",
    difficulty: 2,
  },
  {
    id: "session-hijacking",
    name: "セッションハイジャック",
    description:
      "XSSでHttpOnlyなしのCookieからセッションIDを盗み出し、他人になりすましてアクセスする",
    difficulty: 2,
  },
  {
    id: "csrf",
    name: "CSRF（クロスサイトリクエストフォージェリ）",
    description:
      "ログイン中のユーザーが罠ページを開くだけで、パスワード変更などの操作が本人の意図なく実行されてしまう",
    difficulty: 2,
  },
];

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
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step04/${lab.id}`} className="no-underline">
                  {lab.name}
                </Link>
              </h3>
              <p className="m-0 text-[#666] text-sm">{lab.description}</p>
            </div>
            <div className="text-right min-w-[80px]">
              <span className="text-xs text-[#888]">
                {"★".repeat(lab.difficulty)}
                {"☆".repeat(3 - lab.difficulty)}
              </span>
              <br />
              <Link
                to={`/step04/${lab.id}`}
                className="inline-block mt-1 px-3 py-1 bg-[#333] text-white rounded no-underline text-[13px]"
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
