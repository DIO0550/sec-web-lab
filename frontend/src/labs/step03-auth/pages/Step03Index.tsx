import { Link } from "react-router-dom";

const LABS = [
  {
    id: "plaintext-password",
    name: "平文パスワード保存",
    description: "パスワードをハッシュ化せず平文でDBに保存していると、漏洩時に全パスワードが即座に悪用される",
    difficulty: 1,
  },
  {
    id: "weak-hash",
    name: "弱いハッシュアルゴリズム",
    description: "MD5/SHA1でハッシュ化しても、レインボーテーブルで数秒で元のパスワードに戻せてしまう",
    difficulty: 2,
  },
  {
    id: "brute-force",
    name: "ブルートフォース攻撃",
    description: "ログイン試行に回数制限がないと、パスワード辞書を使った総当たりで突破される",
    difficulty: 1,
  },
  {
    id: "default-credentials",
    name: "デフォルト認証情報",
    description: "admin/admin123 等の初期パスワードが変更されないまま運用されると、即座に管理者権限を奪取される",
    difficulty: 1,
  },
  {
    id: "weak-password-policy",
    name: "弱いパスワードポリシー",
    description: "パスワード強度チェックがないと、123456 等の弱いパスワードが登録でき、辞書攻撃で瞬時に突破される",
    difficulty: 1,
  },
];

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
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step03/${lab.id}`} className="no-underline">
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
                to={`/step03/${lab.id}`}
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
