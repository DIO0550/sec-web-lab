import type { QuizData } from "../../components/quiz/types";

/**
 * Path Traversal - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Path Traversal - 理解度テスト",
  description:
    "パストラバーサルの攻撃手法・発生条件・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "パストラバーサル攻撃が成功する根本的な原因はどれか？",
      options: [
        "サーバーがHTTPSを使用していないため",
        "ファイル名に含まれる ../  を検出するWAFが設定されていないため",
        "ユーザー入力をそのままファイルパスに結合し、解決後のパスが許可されたディレクトリ内にあるか検証していないため",
        "ファイルシステムのパーミッションが適切に設定されていないため",
      ],
      correctIndex: 2,
      explanation:
        "パストラバーサルの根本原因は、ユーザー入力をそのままファイルパスに結合し、最終的に解決されたパスが許可されたディレクトリ（ベースディレクトリ）内に収まっているかを検証していないことです。WAFやパーミッションは多層防御であり、根本対策ではありません。",
      referenceLink: "/step05-access-control/path-traversal",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "パストラバーサル対策として最も確実な方法はどれか？",
      options: [
        "ユーザー入力から ../ という文字列を除去するフィルタリング",
        "path.resolve() でパスを正規化した後、startsWith() でベースディレクトリ内か検証する",
        "ファイル名に使用できる文字を英数字のみに制限する",
        "Webサーバーを root ユーザーで実行しない",
      ],
      correctIndex: 1,
      explanation:
        "path.resolve() でパスを正規化（絶対パスに変換）した後、startsWith() でベースディレクトリ内に収まっているか検証する方法が最も確実です。../ のフィルタリングはエンコーディングによるバイパスが可能であり、文字制限は正当なファイル名を制限しすぎる場合があります。",
      referenceLink: "/step05-access-control/path-traversal",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "ユーザー入力から ../ という文字列を単純に除去するだけで、パストラバーサル攻撃を完全に防ぐことができる。",
      correctAnswer: false,
      explanation:
        "../ の単純な除去では不十分です。攻撃者はURLエンコーディング（%2e%2e%2f）、二重エンコーディング、....// のようなパターンで除去をバイパスできます。根本対策はパスを正規化した後にベースディレクトリ内にあるかを検証することです。",
      referenceLink: "/step05-access-control/path-traversal",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "path.join() はパストラバーサルを防ぐための安全な関数であり、../ を含む入力を無害化してくれる。",
      correctAnswer: false,
      explanation:
        "path.join() はパスの結合を行うだけで、セキュリティ上の検証は行いません。path.join('/app/uploads', '../../../etc/passwd') は '/etc/passwd' を返します。パストラバーサル対策にはpath.resolve() で正規化した後に startsWith() で検証する必要があります。",
      referenceLink: "/step05-access-control/path-traversal",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "パストラバーサルによるシステムファイル読み取り攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がファイル配信エンドポイント（例: /api/files?name=report.pdf）を発見する",
        "name パラメータに ../../../etc/passwd を指定してリクエストを送信する",
        "サーバーが /app/uploads/../../../etc/passwd をパス結合し、/etc/passwd に解決する",
        "サーバーがパス検証なしで /etc/passwd を読み込みレスポンスとして返す",
        "攻撃者が .env やSSH鍵など、さまざまな機密ファイルを順に読み取る",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 1, 0, 3],
      explanation:
        "パストラバーサル攻撃では、まずファイル配信エンドポイントを発見し、../ を使ってベースディレクトリから脱出します。サーバーがパスを検証せずにファイルを読み込むため、/etc/passwd などのシステムファイルが取得されます。",
      referenceLink: "/step05-access-control/path-traversal",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ファイルシステムにおいて、..（ドットドット）は______ディレクトリを意味する特殊な表記である。（漢字1文字で回答）",
      correctAnswers: ["親"],
      explanation:
        ".. はファイルシステムにおいて「親ディレクトリ」を意味します。../を繰り返すことで、現在のディレクトリから上位ディレクトリへ遡ることができます。パストラバーサル攻撃はこの仕組みを悪用して、公開ディレクトリの外にあるファイルにアクセスします。",
      referenceLink: "/step05-access-control/path-traversal",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Node.js でパストラバーサル対策を行う際、パスを絶対パスに正規化するために使用する関数は path.______ である。（英単語で回答）",
      correctAnswers: ["resolve"],
      explanation:
        "path.resolve() はパスを正規化して絶対パスに変換します。../を含むパスも解決した結果を返すため、startsWith() と組み合わせることで、最終パスがベースディレクトリ内に収まっているか検証できます。path.join() はパスの結合のみでセキュリティ検証は行いません。",
      referenceLink: "/step05-access-control/path-traversal",
    },
  ],
} satisfies QuizData;
