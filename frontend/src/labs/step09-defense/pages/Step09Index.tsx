import { Link } from "react-router-dom";

const LABS = [
  {
    id: "error-messages",
    name: "詳細エラーメッセージ露出",
    description: "エラーメッセージにDB構造やクエリが含まれ、攻撃者に内部情報を提供してしまう脆弱性",
    difficulty: 1,
  },
  {
    id: "stack-trace",
    name: "スタックトレース漏洩",
    description: "スタックトレースやデバッグ情報がレスポンスに含まれ、ソースコード構造が露出する脆弱性",
    difficulty: 1,
  },
  {
    id: "logging",
    name: "不適切なログ記録",
    description: "パスワードやトークン等の機密情報がログに平文で記録される脆弱性",
    difficulty: 1,
  },
  {
    id: "log-injection",
    name: "ログインジェクション",
    description: "ユーザー入力に改行コードを含めてログを改ざんし、偽のログ行を作成する攻撃",
    difficulty: 2,
  },
  {
    id: "fail-open",
    name: "Fail-Open",
    description: "認証サービス障害時にアクセスを許可してしまう危険なデフォルト動作",
    difficulty: 2,
  },
  {
    id: "csp",
    name: "CSP (Content Security Policy)",
    description: "Content Security Policyの設定によるXSS緩和策の効果を体験",
    difficulty: 2,
  },
  {
    id: "input-validation",
    name: "入力バリデーション設計",
    description: "サーバー側での型・形式・範囲の検証による多層防御の実践",
    difficulty: 1,
  },
];

export function Step09Index() {
  return (
    <div>
      <h2>Step 09: Defense (守りを固める)</h2>
      <p>
        守りの観点からセキュリティを強化する方法を体験します。
        適切なエラーハンドリング、ログ管理、Fail-Closed設計、CSP、入力バリデーションなど、
        攻撃を防ぐための防御的な実装パターンを学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step09/${lab.id}`} className="no-underline">
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
                to={`/step09/${lab.id}`}
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
