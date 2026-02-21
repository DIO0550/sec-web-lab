import { Link } from "react-router-dom";

const LABS = [
  {
    id: "ssrf",
    name: "SSRF (Server-Side Request Forgery)",
    description: "サーバーを踏み台にして内部ネットワークやメタデータAPIに不正アクセスする攻撃",
    difficulty: 2,
  },
  {
    id: "xxe",
    name: "XXE (XML External Entity)",
    description: "XMLの外部エンティティ参照を悪用してサーバー上のファイルを読み取る攻撃",
    difficulty: 2,
  },
  {
    id: "file-upload",
    name: "ファイルアップロード攻撃",
    description: "ファイルアップロードの検証不備を悪用して実行可能ファイルをアップロードする攻撃",
    difficulty: 2,
  },
  {
    id: "crlf-injection",
    name: "CRLFインジェクション",
    description: "HTTPレスポンスヘッダーに改行コードを注入して任意のヘッダーを追加する攻撃",
    difficulty: 2,
  },
  {
    id: "cors-misconfiguration",
    name: "CORS設定ミス",
    description: "オリジン間リソース共有の設定不備により、攻撃者のサイトから認証データを窃取される脆弱性",
    difficulty: 2,
  },
  {
    id: "eval-injection",
    name: "evalインジェクション",
    description: "eval()によるユーザー入力の直接実行で、任意のコードが実行される脆弱性",
    difficulty: 2,
  },
];

export function Step06Index() {
  return (
    <div>
      <h2>Step 06: Server-Side Attacks (サーバーサイド攻撃)</h2>
      <p>
        サーバーサイドで発生する脆弱性を体験します。
        SSRF、XXE、ファイルアップロード、CRLFインジェクションなど、
        サーバーの内部機能や設定を悪用した攻撃とその対策を学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step06/${lab.id}`} className="no-underline">
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
                to={`/step06/${lab.id}`}
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
