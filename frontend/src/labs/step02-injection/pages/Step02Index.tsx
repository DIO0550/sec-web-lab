import { Link } from "react-router-dom";

const LABS = [
  {
    id: "sql-injection",
    name: "SQLインジェクション",
    description: "ログインフォームや検索機能でSQLを注入し、認証バイパスやデータ抽出を行う",
    difficulty: 1,
  },
  {
    id: "xss",
    name: "クロスサイトスクリプティング (XSS)",
    description: "Reflected XSS / Stored XSS でユーザーのブラウザ上にスクリプトを実行させる",
    difficulty: 1,
  },
  {
    id: "command-injection",
    name: "OSコマンドインジェクション",
    description: "ping ツールの入力欄からシェルメタ文字を注入し、サーバー上で任意のコマンドを実行する",
    difficulty: 2,
  },
  {
    id: "open-redirect",
    name: "オープンリダイレクト",
    description: "リダイレクト先URLの検証不備を利用して、外部のフィッシングサイトへ誘導する",
    difficulty: 1,
  },
];

/**
 * Step02: Injection（インジェクション）のラボ一覧ページ
 */
export function Step02Index() {
  return (
    <div>
      <h2>Step 02: Injection (インジェクション)</h2>
      <p>
        ユーザーの入力値がSQL文・HTML・シェルコマンド等のコードとして解釈されてしまう脆弱性を体験します。
        各ラボには<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>があり、
        攻撃と防御の両方を学べます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step02/${lab.id}`} className="no-underline">
                  {lab.name}
                </Link>
              </h3>
              <p className="m-0 text-[#666] text-sm">{lab.description}</p>
            </div>
            <div className="text-right min-w-[80px]">
              <span className="text-xs text-[#888]">
                {"★".repeat(lab.difficulty)}{"☆".repeat(3 - lab.difficulty)}
              </span>
              <br />
              <Link
                to={`/step02/${lab.id}`}
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
