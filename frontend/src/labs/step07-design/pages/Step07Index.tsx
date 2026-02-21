import { Link } from "react-router-dom";

const LABS = [
  {
    id: "rate-limiting",
    name: "レート制限なし",
    description: "APIにレート制限がなく、無制限にログイン試行（ブルートフォース攻撃）が可能な脆弱性",
    difficulty: 1,
  },
  {
    id: "clickjacking",
    name: "クリックジャッキング",
    description: "透明なiframeでページを重ねて、ユーザーに意図しないクリック操作をさせる攻撃",
    difficulty: 1,
  },
  {
    id: "sensitive-data-http",
    name: "HTTPでの機密データ送信",
    description: "暗号化されていないHTTP通信で、パスワードやセッションが平文で流れる脆弱性",
    difficulty: 1,
  },
  {
    id: "http-methods",
    name: "不要なHTTPメソッド許可",
    description: "PUT/DELETE/TRACE等の不要なメソッドが許可され、リソースの不正操作が可能な脆弱性",
    difficulty: 1,
  },
  {
    id: "password-reset",
    name: "推測可能なパスワードリセット",
    description: "パスワードリセットトークンが連番で推測可能、有効期限なしでアカウント乗っ取りが可能",
    difficulty: 2,
  },
  {
    id: "business-logic",
    name: "ビジネスロジックの欠陥",
    description: "数量を負の値にして残高を増やす、在庫超過注文など、アプリ固有のロジック脆弱性",
    difficulty: 2,
  },
  {
    id: "unsigned-data",
    name: "署名なしデータの信頼",
    description: "CookieやHTTPヘッダーのRole値を署名なしで信頼し、改ざんで権限昇格できる脆弱性",
    difficulty: 2,
  },
  {
    id: "security-headers",
    name: "セキュリティヘッダー未設定",
    description: "CSP, HSTS, X-Content-Type-Options等のセキュリティヘッダーが未設定の脆弱性",
    difficulty: 1,
  },
  {
    id: "cache-control",
    name: "キャッシュ制御の不備",
    description: "機密データを含むレスポンスにCache-Controlが設定されず、キャッシュに残存する脆弱性",
    difficulty: 1,
  },
  {
    id: "web-storage-abuse",
    name: "Web Storageの不適切な使用",
    description: "JWTトークンをlocalStorageに保存し、XSSで窃取可能になる脆弱性",
    difficulty: 2,
  },
];

export function Step07Index() {
  return (
    <div>
      <h2>Step 07: Design & Logic (設計とロジックの問題)</h2>
      <p>
        アプリケーションの設計やビジネスロジックに起因する脆弱性を体験します。
        レート制限の欠如、不適切なキャッシュ制御、セキュリティヘッダーの未設定など、
        実装ミスだけでなく設計段階で防ぐべき問題を学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step07/${lab.id}`} className="no-underline">
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
                to={`/step07/${lab.id}`}
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
