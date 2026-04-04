import type { QuizData } from "../../components/quiz/types";

/**
 * ディレクトリリスティング - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "ディレクトリリスティング - 理解度テスト",
  description:
    "ディレクトリ一覧表示による情報漏洩のリスクと対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ディレクトリリスティングが有効な場合、攻撃者にとって最大の利点は何か？",
      options: [
        "サーバーのCPU使用率を上げてDoS攻撃ができる",
        "URLを推測する必要なく、存在するすべてのファイルを把握できる",
        "ディレクトリの作成日時からサーバーの稼働時間がわかる",
        "ファイルのパーミッション情報が取得できる",
      ],
      correctIndex: 1,
      explanation:
        "ディレクトリリスティングが有効だと、攻撃者はブラウザでアクセスするだけでディレクトリ内のすべてのファイルを把握できます。バックアップファイルや設定ファイルなど、直接URLを知らなければアクセスできなかったファイルの存在が明らかになります。",
      referenceLink: "/step01-recon/directory-listing",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ディレクトリリスティングを無効化する安全な実装として正しいものはどれか？",
      options: [
        "すべてのディレクトリにindex.htmlを配置する",
        "パスがスラッシュで終わるリクエストを検知し、403 Forbiddenを返すミドルウェアを設置する",
        "静的ファイルのContent-Typeをすべてapplication/octet-streamに変更する",
        "ディレクトリ名をランダムな文字列に変更する",
      ],
      correctIndex: 1,
      explanation:
        "パスがスラッシュで終わるリクエスト（ディレクトリアクセス）を検知し、403 Forbiddenを返すミドルウェアを設置することで、ファイル一覧の表示を防ぎます。攻撃者はファイル名を推測するしかなくなり、発見が格段に困難になります。",
      referenceLink: "/step01-recon/directory-listing",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "ディレクトリリスティングの確認にはブラウザだけで十分であり、特別な攻撃ツールは不要である。",
      correctAnswer: true,
      explanation:
        "ディレクトリリスティングはブラウザでディレクトリURLにアクセスするだけで確認できます。/static/, /uploads/, /backup/ など一般的なディレクトリ名を順番に試すだけの、非常にコストの低い偵察手法です。",
      referenceLink: "/step01-recon/directory-listing",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "ディレクトリリスティングを無効化すれば、バックアップファイルや設定ファイルへの直接アクセスも防げる。",
      correctAnswer: false,
      explanation:
        "ディレクトリリスティングの無効化はファイル一覧の表示を防ぐだけです。ファイル名がわかればURLを直接指定してアクセスできるため、不要なファイルを公開ディレクトリから除去する根本対策も必要です。",
      referenceLink: "/step01-recon/directory-listing",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ディレクトリリスティングを利用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "/static/ や /uploads/ など一般的なディレクトリURLにアクセスする",
        "サーバーがディレクトリ内のファイル一覧をHTMLとして返す",
        "一覧からバックアップファイルや設定ファイルなど攻撃対象を特定する",
        "特定したファイルに直接アクセスして内容を取得する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 3, 0, 1],
      explanation:
        "攻撃者はまず一般的なディレクトリURLにアクセスし、ファイル一覧を取得します。一覧からバックアップファイルやDBダンプなどの攻撃対象を特定し、それらに直接アクセスして内容を取得します。",
      referenceLink: "/step01-recon/directory-listing",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Webサーバーがディレクトリへのリクエストを受けたとき、______ ファイルが存在すればそれを返し、存在しなければディレクトリ一覧を表示する。（ファイル名で回答）",
      correctAnswers: ["index.html"],
      explanation:
        "Webサーバーはディレクトリへのリクエストに対して、まずindex.htmlの存在を確認します。存在すればそれを返し、存在しなければディレクトリ内容を自動生成したHTMLとして返却します（ディレクトリリスティングが有効な場合）。",
      referenceLink: "/step01-recon/directory-listing",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Nginxでディレクトリリスティングを無効化する設定ディレクティブは ______ off; である。（英小文字で回答）",
      correctAnswers: ["autoindex"],
      explanation:
        "Nginxではautoindex off; を設定することでディレクトリリスティングを無効化できます。Apache HTTP Serverではデフォルトで Options +Indexes が有効な場合があり、Options -Indexes で無効化します。",
      referenceLink: "/step01-recon/directory-listing",
    },
  ],
} satisfies QuizData;
