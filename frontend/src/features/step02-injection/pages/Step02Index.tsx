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

      <div style={{ marginTop: 24 }}>
        {LABS.map((lab) => (
          <div
            key={lab.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px 0" }}>
                <Link to={`/step02/${lab.id}`} style={{ textDecoration: "none" }}>
                  {lab.name}
                </Link>
              </h3>
              <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{lab.description}</p>
            </div>
            <div style={{ textAlign: "right", minWidth: 80 }}>
              <span style={{ fontSize: 12, color: "#888" }}>
                {"★".repeat(lab.difficulty)}{"☆".repeat(3 - lab.difficulty)}
              </span>
              <br />
              <Link
                to={`/step02/${lab.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 4,
                  padding: "4px 12px",
                  background: "#333",
                  color: "#fff",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontSize: 13,
                }}
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
