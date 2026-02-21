import { Link } from "react-router-dom";

const LABS = [
  {
    id: "jwt-vulnerabilities",
    name: "JWT脆弱性",
    description: "JWT署名検証の不備（alg=none攻撃）により、トークンを改ざんして認証をバイパスする脆弱性",
    difficulty: 3,
  },
  {
    id: "ssti",
    name: "SSTI (テンプレートインジェクション)",
    description: "テンプレートエンジンでユーザー入力が式として評価され、任意のコードが実行される脆弱性",
    difficulty: 3,
  },
  {
    id: "race-condition",
    name: "レースコンディション",
    description: "在庫チェックと在庫更新の間のタイミング差を突く同時実行攻撃",
    difficulty: 3,
  },
  {
    id: "deserialization",
    name: "安全でないデシリアライゼーション",
    description: "デシリアライズ時に悪意あるオブジェクトのメソッドが自動実行されるRCE脆弱性",
    difficulty: 3,
  },
  {
    id: "prototype-pollution",
    name: "Prototype Pollution",
    description: "__proto__経由でオブジェクトのプロトタイプを汚染し、権限昇格やRCEが可能になる脆弱性",
    difficulty: 3,
  },
  {
    id: "redos",
    name: "ReDoS (正規表現DoS)",
    description: "危険な正規表現パターンによるバックトラッキング爆発でCPUリソースが枯渇する脆弱性",
    difficulty: 2,
  },
  {
    id: "postmessage",
    name: "postMessage脆弱性",
    description: "window.postMessageのオリジン検証不備により、攻撃者のサイトから任意のメッセージを注入可能",
    difficulty: 2,
  },
];

export function Step08Index() {
  return (
    <div>
      <h2>Step 08: Advanced Techniques (高度な攻撃テクニック)</h2>
      <p>
        より高度な攻撃テクニックを体験します。
        JWT改ざん、テンプレートインジェクション、レースコンディション、
        Prototype Pollutionなど、実際の脆弱性診断で発見される高度な脆弱性を学びます。
      </p>

      <div className="mt-6">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="border border-[#ddd] rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="m-0 mb-1">
                <Link to={`/step08/${lab.id}`} className="no-underline">
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
                to={`/step08/${lab.id}`}
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
