// ナビゲーションデータの唯一の正（Single Source of Truth）
// サイドバー、Home.tsx、各 StepNNIndex.tsx のすべてがこのデータを参照する

export type Lab = {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  path: string;
};

export type Step = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  intro: string;
  path: string;
  icon: string;
};

export type StepWithLabs = Step & {
  labs: Lab[];
};

const STEP_DEFINITIONS: Step[] = [
  {
    id: "step01",
    name: "Step 01: Recon (偵察フェーズ)",
    shortName: "Recon",
    description:
      "攻撃者がターゲットの情報を収集するフェーズで悪用される脆弱性を体験",
    intro:
      "攻撃者がターゲットの情報を収集するフェーズで悪用される脆弱性を体験します。各ラボには<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>があり、攻撃と防御の両方を学べます。",
    path: "/step01",
    icon: "🔍",
  },
  {
    id: "step02",
    name: "Step 02: Injection (インジェクション)",
    shortName: "Injection",
    description:
      "SQL Injection, XSS, コマンドインジェクション等の入力値を悪用した攻撃",
    intro:
      "ユーザーの入力値がSQL文・HTML・シェルコマンド等のコードとして解釈されてしまう脆弱性を体験します。各ラボには<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>があり、攻撃と防御の両方を学べます。",
    path: "/step02",
    icon: "💉",
  },
  {
    id: "step03",
    name: "Step 03: Authentication (認証)",
    shortName: "Auth",
    description: "認証の欠陥を悪用した攻撃",
    intro:
      "パスワードの保存方法・認証の仕組みに関する脆弱性を体験します。平文保存、弱いハッシュ、ブルートフォース、デフォルト認証情報、弱いパスワードポリシーなど、認証に関わる代表的な問題を<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>で学べます。",
    path: "/step03",
    icon: "🔑",
  },
  {
    id: "step04",
    name: "Step 04: Session Management (セッション管理)",
    shortName: "Session",
    description: "セッション管理の脆弱性を悪用した攻撃",
    intro:
      "Cookieベースのセッション管理に関する脆弱性を体験します。Cookie属性の不備、セッション固定、セッションハイジャック、CSRFなど、セッション管理に関わる代表的な問題を<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>で学べます。",
    path: "/step04",
    icon: "🍪",
  },
  {
    id: "step05",
    name: "Step 05: Access Control (アクセス制御)",
    shortName: "Access",
    description: "アクセス制御の不備を悪用した攻撃",
    intro:
      "認可（Authorization）に関する脆弱性を体験します。認証（ログイン）が成功しても、「誰が何にアクセスしてよいか」の制御が不十分だと、他ユーザーのデータへの不正アクセスや権限昇格が可能になります。各ラボで<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>を比較して学べます。",
    path: "/step05",
    icon: "🚪",
  },
  {
    id: "step06",
    name: "Step 06: Server-Side Attacks (サーバーサイド攻撃)",
    shortName: "Server",
    description:
      "SSRF, XXE, ファイルアップロード等のサーバーサイド脆弱性を体験",
    intro:
      "サーバーサイドで発生する脆弱性を体験します。SSRF、XXE、ファイルアップロード、CRLFインジェクションなど、サーバーの内部機能や設定を悪用した攻撃とその対策を学びます。",
    path: "/step06",
    icon: "🖥️",
  },
  {
    id: "step07",
    name: "Step 07: Design & Logic (設計とロジックの問題)",
    shortName: "Design",
    description:
      "レート制限、ビジネスロジック、セキュリティヘッダー等の設計上の問題",
    intro:
      "アプリケーションの設計やビジネスロジックに起因する脆弱性を体験します。レート制限の欠如、不適切なキャッシュ制御、セキュリティヘッダーの未設定など、実装ミスだけでなく設計段階で防ぐべき問題を学びます。",
    path: "/step07",
    icon: "⚙️",
  },
  {
    id: "step08",
    name: "Step 08: Advanced Techniques (高度な攻撃テクニック)",
    shortName: "Advanced",
    description:
      "JWT改ざん、SSTI、レースコンディション、Prototype Pollution等の高度な手法",
    intro:
      "より高度な攻撃テクニックを体験します。JWT改ざん、テンプレートインジェクション、レースコンディション、Prototype Pollutionなど、実際の脆弱性診断で発見される高度な脆弱性を学びます。",
    path: "/step08",
    icon: "⚡",
  },
  {
    id: "step09",
    name: "Step 09: Defense (守りを固める)",
    shortName: "Defense",
    description:
      "エラーハンドリング、ログ管理、CSP、入力バリデーション等の防御手法",
    intro:
      "守りの観点からセキュリティを強化する方法を体験します。適切なエラーハンドリング、ログ管理、Fail-Closed設計、CSP、入力バリデーションなど、攻撃を防ぐための防御的な実装パターンを学びます。",
    path: "/step09",
    icon: "🛡️",
  },
];

const LABS_BY_STEP: Record<string, Lab[]> = {
  step01: [
    {
      id: "header-leakage",
      name: "HTTPヘッダー情報漏洩",
      description:
        "X-Powered-By, Server 等のヘッダーから技術スタックが特定される",
      difficulty: 1,
      path: "/step01/header-leakage",
    },
    {
      id: "sensitive-file-exposure",
      name: "機密ファイルの露出",
      description:
        ".env, .git/, robots.txt 等の機密ファイルがWebからアクセス可能",
      difficulty: 1,
      path: "/step01/sensitive-file-exposure",
    },
    {
      id: "error-message-leakage",
      name: "エラーメッセージ情報漏洩",
      description:
        "エラーメッセージにSQL文やスタックトレース等の内部情報が含まれる",
      difficulty: 1,
      path: "/step01/error-message-leakage",
    },
    {
      id: "directory-listing",
      name: "ディレクトリリスティング",
      description:
        "ディレクトリ一覧が表示され、ファイル構成が外部から丸見えになる",
      difficulty: 1,
      path: "/step01/directory-listing",
    },
    {
      id: "header-exposure",
      name: "セキュリティヘッダー欠如",
      description:
        "セキュリティヘッダーが未設定でブラウザの保護機能が無効のまま",
      difficulty: 1,
      path: "/step01/header-exposure",
    },
  ],
  step02: [
    {
      id: "sql-injection",
      name: "SQLインジェクション",
      description:
        "ログインフォームや検索機能でSQLを注入し、認証バイパスやデータ抽出を行う",
      difficulty: 1,
      path: "/step02/sql-injection",
    },
    {
      id: "xss",
      name: "クロスサイトスクリプティング (XSS)",
      description:
        "Reflected XSS / Stored XSS でユーザーのブラウザ上にスクリプトを実行させる",
      difficulty: 1,
      path: "/step02/xss",
    },
    {
      id: "command-injection",
      name: "OSコマンドインジェクション",
      description:
        "ping ツールの入力欄からシェルメタ文字を注入し、サーバー上で任意のコマンドを実行する",
      difficulty: 2,
      path: "/step02/command-injection",
    },
    {
      id: "open-redirect",
      name: "オープンリダイレクト",
      description:
        "リダイレクト先URLの検証不備を利用して、外部のフィッシングサイトへ誘導する",
      difficulty: 1,
      path: "/step02/open-redirect",
    },
  ],
  step03: [
    {
      id: "plaintext-password",
      name: "平文パスワード保存",
      description:
        "パスワードをハッシュ化せず平文でDBに保存していると、漏洩時に全パスワードが即座に悪用される",
      difficulty: 1,
      path: "/step03/plaintext-password",
    },
    {
      id: "weak-hash",
      name: "弱いハッシュアルゴリズム",
      description:
        "MD5/SHA1でハッシュ化しても、レインボーテーブルで数秒で元のパスワードに戻せてしまう",
      difficulty: 2,
      path: "/step03/weak-hash",
    },
    {
      id: "brute-force",
      name: "ブルートフォース攻撃",
      description:
        "ログイン試行に回数制限がないと、パスワード辞書を使った総当たりで突破される",
      difficulty: 1,
      path: "/step03/brute-force",
    },
    {
      id: "default-credentials",
      name: "デフォルト認証情報",
      description:
        "admin/admin123 等の初期パスワードが変更されないまま運用されると、即座に管理者権限を奪取される",
      difficulty: 1,
      path: "/step03/default-credentials",
    },
    {
      id: "weak-password-policy",
      name: "弱いパスワードポリシー",
      description:
        "パスワード強度チェックがないと、123456 等の弱いパスワードが登録でき、辞書攻撃で瞬時に突破される",
      difficulty: 1,
      path: "/step03/weak-password-policy",
    },
  ],
  step04: [
    {
      id: "cookie-manipulation",
      name: "Cookie属性の不備",
      description:
        "セッションCookieにHttpOnly・Secure・SameSite属性が設定されていないと、XSSでの窃取、HTTP傍受、CSRF攻撃が可能になる",
      difficulty: 1,
      path: "/step04/cookie-manipulation",
    },
    {
      id: "session-fixation",
      name: "セッション固定攻撃",
      description:
        "ログイン時にセッションIDを再生成しないと、攻撃者が事前に仕込んだIDで被害者のセッションを乗っ取れる",
      difficulty: 2,
      path: "/step04/session-fixation",
    },
    {
      id: "session-hijacking",
      name: "セッションハイジャック",
      description:
        "XSSでHttpOnlyなしのCookieからセッションIDを盗み出し、他人になりすましてアクセスする",
      difficulty: 2,
      path: "/step04/session-hijacking",
    },
    {
      id: "csrf",
      name: "CSRF（クロスサイトリクエストフォージェリ）",
      description:
        "ログイン中のユーザーが罠ページを開くだけで、パスワード変更などの操作が本人の意図なく実行されてしまう",
      difficulty: 2,
      path: "/step04/csrf",
    },
  ],
  step05: [
    {
      id: "idor",
      name: "IDOR (安全でない直接オブジェクト参照)",
      description:
        "URLやリクエスト中のIDを書き換えるだけで、他ユーザーのデータにアクセスできてしまう脆弱性",
      difficulty: 1,
      path: "/step05/idor",
    },
    {
      id: "path-traversal",
      name: "パストラバーサル",
      description:
        "ファイルパスに ../  を挿入して、公開ディレクトリ外のシステムファイルを読み取る攻撃",
      difficulty: 1,
      path: "/step05/path-traversal",
    },
    {
      id: "privilege-escalation",
      name: "権限昇格",
      description:
        "一般ユーザーが管理者用APIに直接アクセスし、管理者限定の操作を実行できてしまう脆弱性",
      difficulty: 2,
      path: "/step05/privilege-escalation",
    },
    {
      id: "mass-assignment",
      name: "Mass Assignment",
      description:
        "リクエストに余計なフィールド（role: admin 等）を追加するだけで、権限を不正に変更できてしまう脆弱性",
      difficulty: 2,
      path: "/step05/mass-assignment",
    },
  ],
  step06: [
    {
      id: "ssrf",
      name: "SSRF (Server-Side Request Forgery)",
      description:
        "サーバーを踏み台にして内部ネットワークやメタデータAPIに不正アクセスする攻撃",
      difficulty: 2,
      path: "/step06/ssrf",
    },
    {
      id: "xxe",
      name: "XXE (XML External Entity)",
      description:
        "XMLの外部エンティティ参照を悪用してサーバー上のファイルを読み取る攻撃",
      difficulty: 2,
      path: "/step06/xxe",
    },
    {
      id: "file-upload",
      name: "ファイルアップロード攻撃",
      description:
        "ファイルアップロードの検証不備を悪用して実行可能ファイルをアップロードする攻撃",
      difficulty: 2,
      path: "/step06/file-upload",
    },
    {
      id: "crlf-injection",
      name: "CRLFインジェクション",
      description:
        "HTTPレスポンスヘッダーに改行コードを注入して任意のヘッダーを追加する攻撃",
      difficulty: 2,
      path: "/step06/crlf-injection",
    },
    {
      id: "cors-misconfiguration",
      name: "CORS設定ミス",
      description:
        "オリジン間リソース共有の設定不備により、攻撃者のサイトから認証データを窃取される脆弱性",
      difficulty: 2,
      path: "/step06/cors-misconfiguration",
    },
    {
      id: "eval-injection",
      name: "evalインジェクション",
      description:
        "eval()によるユーザー入力の直接実行で、任意のコードが実行される脆弱性",
      difficulty: 2,
      path: "/step06/eval-injection",
    },
  ],
  step07: [
    {
      id: "rate-limiting",
      name: "レート制限なし",
      description:
        "APIにレート制限がなく、無制限にログイン試行（ブルートフォース攻撃）が可能な脆弱性",
      difficulty: 1,
      path: "/step07/rate-limiting",
    },
    {
      id: "clickjacking",
      name: "クリックジャッキング",
      description:
        "透明なiframeでページを重ねて、ユーザーに意図しないクリック操作をさせる攻撃",
      difficulty: 1,
      path: "/step07/clickjacking",
    },
    {
      id: "sensitive-data-http",
      name: "HTTPでの機密データ送信",
      description:
        "暗号化されていないHTTP通信で、パスワードやセッションが平文で流れる脆弱性",
      difficulty: 1,
      path: "/step07/sensitive-data-http",
    },
    {
      id: "http-methods",
      name: "不要なHTTPメソッド許可",
      description:
        "PUT/DELETE/TRACE等の不要なメソッドが許可され、リソースの不正操作が可能な脆弱性",
      difficulty: 1,
      path: "/step07/http-methods",
    },
    {
      id: "password-reset",
      name: "推測可能なパスワードリセット",
      description:
        "パスワードリセットトークンが連番で推測可能、有効期限なしでアカウント乗っ取りが可能",
      difficulty: 2,
      path: "/step07/password-reset",
    },
    {
      id: "business-logic",
      name: "ビジネスロジックの欠陥",
      description:
        "数量を負の値にして残高を増やす、在庫超過注文など、アプリ固有のロジック脆弱性",
      difficulty: 2,
      path: "/step07/business-logic",
    },
    {
      id: "unsigned-data",
      name: "署名なしデータの信頼",
      description:
        "CookieやHTTPヘッダーのRole値を署名なしで信頼し、改ざんで権限昇格できる脆弱性",
      difficulty: 2,
      path: "/step07/unsigned-data",
    },
    {
      id: "security-headers",
      name: "セキュリティヘッダー未設定",
      description:
        "CSP, HSTS, X-Content-Type-Options等のセキュリティヘッダーが未設定の脆弱性",
      difficulty: 1,
      path: "/step07/security-headers",
    },
    {
      id: "cache-control",
      name: "キャッシュ制御の不備",
      description:
        "機密データを含むレスポンスにCache-Controlが設定されず、キャッシュに残存する脆弱性",
      difficulty: 1,
      path: "/step07/cache-control",
    },
    {
      id: "web-storage-abuse",
      name: "Web Storageの不適切な使用",
      description:
        "JWTトークンをlocalStorageに保存し、XSSで窃取可能になる脆弱性",
      difficulty: 2,
      path: "/step07/web-storage-abuse",
    },
  ],
  step08: [
    {
      id: "jwt-vulnerabilities",
      name: "JWT脆弱性",
      description:
        "JWT署名検証の不備（alg=none攻撃）により、トークンを改ざんして認証をバイパスする脆弱性",
      difficulty: 3,
      path: "/step08/jwt-vulnerabilities",
    },
    {
      id: "ssti",
      name: "SSTI (テンプレートインジェクション)",
      description:
        "テンプレートエンジンでユーザー入力が式として評価され、任意のコードが実行される脆弱性",
      difficulty: 3,
      path: "/step08/ssti",
    },
    {
      id: "race-condition",
      name: "レースコンディション",
      description:
        "在庫チェックと在庫更新の間のタイミング差を突く同時実行攻撃",
      difficulty: 3,
      path: "/step08/race-condition",
    },
    {
      id: "deserialization",
      name: "安全でないデシリアライゼーション",
      description:
        "デシリアライズ時に悪意あるオブジェクトのメソッドが自動実行されるRCE脆弱性",
      difficulty: 3,
      path: "/step08/deserialization",
    },
    {
      id: "prototype-pollution",
      name: "Prototype Pollution",
      description:
        "__proto__経由でオブジェクトのプロトタイプを汚染し、権限昇格やRCEが可能になる脆弱性",
      difficulty: 3,
      path: "/step08/prototype-pollution",
    },
    {
      id: "redos",
      name: "ReDoS (正規表現DoS)",
      description:
        "危険な正規表現パターンによるバックトラッキング爆発でCPUリソースが枯渇する脆弱性",
      difficulty: 2,
      path: "/step08/redos",
    },
    {
      id: "postmessage",
      name: "postMessage脆弱性",
      description:
        "window.postMessageのオリジン検証不備により、攻撃者のサイトから任意のメッセージを注入可能",
      difficulty: 2,
      path: "/step08/postmessage",
    },
  ],
  step09: [
    {
      id: "error-messages",
      name: "詳細エラーメッセージ露出",
      description:
        "エラーメッセージにDB構造やクエリが含まれ、攻撃者に内部情報を提供してしまう脆弱性",
      difficulty: 1,
      path: "/step09/error-messages",
    },
    {
      id: "stack-trace",
      name: "スタックトレース漏洩",
      description:
        "スタックトレースやデバッグ情報がレスポンスに含まれ、ソースコード構造が露出する脆弱性",
      difficulty: 1,
      path: "/step09/stack-trace",
    },
    {
      id: "logging",
      name: "不適切なログ記録",
      description:
        "パスワードやトークン等の機密情報がログに平文で記録される脆弱性",
      difficulty: 1,
      path: "/step09/logging",
    },
    {
      id: "log-injection",
      name: "ログインジェクション",
      description:
        "ユーザー入力に改行コードを含めてログを改ざんし、偽のログ行を作成する攻撃",
      difficulty: 2,
      path: "/step09/log-injection",
    },
    {
      id: "fail-open",
      name: "Fail-Open",
      description:
        "認証サービス障害時にアクセスを許可してしまう危険なデフォルト動作",
      difficulty: 2,
      path: "/step09/fail-open",
    },
    {
      id: "csp",
      name: "CSP (Content Security Policy)",
      description:
        "Content Security Policyの設定によるXSS緩和策の効果を体験",
      difficulty: 2,
      path: "/step09/csp",
    },
    {
      id: "input-validation",
      name: "入力バリデーション設計",
      description:
        "サーバー側での型・形式・範囲の検証による多層防御の実践",
      difficulty: 1,
      path: "/step09/input-validation",
    },
  ],
};

/** ステップとラボを結合した完全なナビゲーションデータ */
export const NAVIGATION: StepWithLabs[] = STEP_DEFINITIONS.map((step) => ({
  ...step,
  labs: LABS_BY_STEP[step.id] ?? [],
}));

/** ステップIDからラボ一覧を取得 */
export function getLabsForStep(stepId: string): Lab[] {
  return LABS_BY_STEP[stepId] ?? [];
}

/** ステップIDからステップ情報を取得 */
export function getStep(stepId: string): Step | undefined {
  return STEP_DEFINITIONS.find((s) => s.id === stepId);
}
