import { Link } from "react-router-dom";

const LABS = [
  {
    id: "header-leakage",
    name: "HTTPヘッダー情報漏洩",
    description: "X-Powered-By, Server 等のヘッダーから技術スタックが特定される",
    difficulty: 1,
  },
  {
    id: "sensitive-file-exposure",
    name: "機密ファイルの露出",
    description: ".env, .git/, robots.txt 等の機密ファイルがWebからアクセス可能",
    difficulty: 1,
  },
  {
    id: "error-message-leakage",
    name: "エラーメッセージ情報漏洩",
    description: "エラーメッセージにSQL文やスタックトレース等の内部情報が含まれる",
    difficulty: 1,
  },
  {
    id: "directory-listing",
    name: "ディレクトリリスティング",
    description: "ディレクトリ一覧が表示され、ファイル構成が外部から丸見えになる",
    difficulty: 1,
  },
  {
    id: "header-exposure",
    name: "セキュリティヘッダー欠如",
    description: "セキュリティヘッダーが未設定でブラウザの保護機能が無効のまま",
    difficulty: 1,
  },
];

/**
 * Step01: Recon（偵察フェーズ）のラボ一覧ページ
 */
export function Step01Index() {
  return (
    <div>
      <h2>Step 01: Recon (偵察フェーズ)</h2>
      <p>
        攻撃者がターゲットの情報を収集するフェーズで悪用される脆弱性を体験します。
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
                <Link to={`/step01/${lab.id}`} className="no-underline">
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
                to={`/step01/${lab.id}`}
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
