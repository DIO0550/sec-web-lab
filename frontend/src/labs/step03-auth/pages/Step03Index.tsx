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
                <Link to={`/step03/${lab.id}`} style={{ textDecoration: "none" }}>
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
                to={`/step03/${lab.id}`}
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
