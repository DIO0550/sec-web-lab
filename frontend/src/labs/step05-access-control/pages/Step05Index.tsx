import { Link } from "react-router-dom";

const LABS = [
  {
    id: "idor",
    name: "IDOR (安全でない直接オブジェクト参照)",
    description: "URLやリクエスト中のIDを書き換えるだけで、他ユーザーのデータにアクセスできてしまう脆弱性",
    difficulty: 1,
  },
  {
    id: "path-traversal",
    name: "パストラバーサル",
    description: "ファイルパスに ../  を挿入して、公開ディレクトリ外のシステムファイルを読み取る攻撃",
    difficulty: 1,
  },
  {
    id: "privilege-escalation",
    name: "権限昇格",
    description: "一般ユーザーが管理者用APIに直接アクセスし、管理者限定の操作を実行できてしまう脆弱性",
    difficulty: 2,
  },
  {
    id: "mass-assignment",
    name: "Mass Assignment",
    description: "リクエストに余計なフィールド（role: admin 等）を追加するだけで、権限を不正に変更できてしまう脆弱性",
    difficulty: 2,
  },
];

/**
 * Step05: Access Control（アクセス制御）のラボ一覧ページ
 */
export function Step05Index() {
  return (
    <div>
      <h2>Step 05: Access Control (アクセス制御)</h2>
      <p>
        認可（Authorization）に関する脆弱性を体験します。
        認証（ログイン）が成功しても、「誰が何にアクセスしてよいか」の制御が不十分だと、
        他ユーザーのデータへの不正アクセスや権限昇格が可能になります。
        各ラボで<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>を比較して学べます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step05/${lab.id}`} className="no-underline">
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
                to={`/step05/${lab.id}`}
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
