import type { QuizData } from "../../components/quiz/types";

/**
 * Open Redirect - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Open Redirect - 理解度テスト",
  description:
    "オープンリダイレクトの攻撃手法・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "オープンリダイレクトが特にフィッシング攻撃に有効な理由はどれか？",
      options: [
        "リダイレクト先のページを暗号化できるから",
        "URL の冒頭が正規のドメインであるため、被害者やセキュリティツールが不審に思いにくいから",
        "リダイレクト時にブラウザの Cookie が自動送信されるから",
        "リダイレクトのレスポンスコードが 200 であるため検知されにくいから",
      ],
      correctIndex: 1,
      explanation:
        "オープンリダイレクトでは URL の冒頭が正規のドメイン（例: trusted-site.com/redirect?url=...）であるため、メールフィルタやユーザーの目視確認をすり抜けやすくなります。被害者は正規のサイトにアクセスしていると思い込み、リダイレクト先のフィッシングサイトで認証情報を入力してしまいます。",
      referenceLink: "/step02-injection/open-redirect",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "オープンリダイレクトの対策として最も効果的な方法はどれか？",
      options: [
        "リダイレクト先 URL を Base64 エンコードする",
        "HTTPS のみを許可する",
        "許可リスト（ホワイトリスト）による URL 検証を行う",
        "リダイレクトの回数を制限する",
      ],
      correctIndex: 2,
      explanation:
        "リダイレクト先を許可リストで検証し、自サイトの内部パスか、明示的に許可されたドメインのみリダイレクトを許可するのが最も効果的です。それ以外の URL はデフォルトのページにリダイレクトさせます。URL の直接指定をやめて間接参照（ID でマッピング）を使う方法も根本対策になります。",
      referenceLink: "/step02-injection/open-redirect",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "オープンリダイレクトでは、ブラウザが 302 レスポンスを受け取ると自動的にリダイレクトするため、ユーザーが遷移先を確認する余地がほとんどない。",
      correctAnswer: true,
      explanation:
        "ブラウザは 302 Found レスポンスの Location ヘッダーに指定された URL に自動的に遷移します。アドレスバーに一瞬だけ正規のドメインが表示された後、即座にフィッシングサイトに遷移するため、ユーザーが遷移先を確認して判断する余地はほとんどありません。",
      referenceLink: "/step02-injection/open-redirect",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "リダイレクト先 URL のスキームが https であることを確認すれば、オープンリダイレクト攻撃を防止できる。",
      correctAnswer: false,
      explanation:
        "攻撃者のフィッシングサイトも HTTPS を使用できるため、スキームの確認だけではオープンリダイレクトは防止できません。https://evil-site.com も HTTPS です。重要なのはスキームではなく、リダイレクト先のホスト名（ドメイン）が許可リストに含まれているかどうかを検証することです。",
      referenceLink: "/step02-injection/open-redirect",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "オープンリダイレクトを悪用したフィッシング攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が正規サイトのリダイレクトエンドポイントを利用してフィッシングサイトへのリンクを作成する",
        "被害者がリンクをクリックし、正規サイトのサーバーにリクエストを送信する",
        "サーバーが URL パラメータを検証せずに Location ヘッダーに設定してリダイレクトする",
        "ブラウザが自動的にフィッシングサイトに遷移する",
        "被害者がフィッシングサイトで認証情報を入力し、攻撃者に窃取される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 1, 4, 0, 2],
      explanation:
        "攻撃者は正規サイトのリダイレクトエンドポイントを悪用してリンクを作成します。被害者がクリックすると、サーバーは検証なしにリダイレクトし、ブラウザが自動的にフィッシングサイトに遷移します。被害者は正規サイトだと思い込んで認証情報を入力し、窃取されます。",
      referenceLink: "/step02-injection/open-redirect",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "HTTP リダイレクトでは、サーバーがレスポンスの ______ ヘッダーにリダイレクト先 URL を設定する。（英語で回答）",
      correctAnswers: ["Location"],
      explanation:
        "HTTP リダイレクト（301, 302 等）では、サーバーがレスポンスの Location ヘッダーにリダイレクト先の URL を設定します。ブラウザはこのヘッダーの値を読み取り、自動的にその URL に遷移します。オープンリダイレクトでは、この Location ヘッダーの値が攻撃者によって制御されてしまいます。",
      referenceLink: "/step02-injection/open-redirect",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "//evil.com のようなプロトコル相対 URL によるバイパスを防ぐには、内部パスの判定で url.startsWith('/') に加えて !url.startsWith('______') のチェックが必要である。（記号2文字で回答）",
      correctAnswers: ["//"],
      explanation:
        "// で始まる URL はプロトコル相対 URL と呼ばれ、現在のページのプロトコル（http: または https:）を引き継いで外部サイトに遷移します。/dashboard のような内部パスは / で始まりますが、//evil.com も / で始まるため、!url.startsWith('//') の追加チェックで区別する必要があります。",
      referenceLink: "/step02-injection/open-redirect",
    },
  ],
} satisfies QuizData;
