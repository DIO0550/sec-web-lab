import type { QuizData } from "../../components/quiz/types";

/**
 * Host Header Injection - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Hostヘッダインジェクション - 理解度テスト",
  description:
    "Hostヘッダ汚染によるリンク詐称の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Host Header Injectionで攻撃者が偽のHostヘッダを送信した場合、最も深刻な影響はどれか？",
      options: [
        "サーバーのDNS設定が変更される",
        "パスワードリセットメールに攻撃者のドメインを含むリンクが生成され、トークンが窃取される",
        "サーバーのTLS証明書が無効化される",
        "ブラウザのCookieが攻撃者のドメインに送信される",
      ],
      correctIndex: 1,
      explanation:
        "サーバーがHostヘッダの値を検証せずにパスワードリセットリンクのURL生成に使用すると、攻撃者のドメイン（例: evil.example）を含むリセットリンクが被害者のメールに送信されます。被害者がリンクをクリックすると、トークンが攻撃者のサーバーに送信され、アカウントを乗っ取られます。",
      referenceLink: "/step07-design/host-header-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Host Header Injectionの根本的な対策として最も適切なものはどれか？",
      options: [
        "Hostヘッダの値を正規表現でバリデーションする",
        "URL生成に使用するベースURLを環境変数でハードコードし、Hostヘッダに依存しない",
        "HTTPSを使用してHostヘッダを暗号化する",
        "リバースプロキシを使用してHostヘッダを転送する",
      ],
      correctIndex: 1,
      explanation:
        "最も確実な対策は、URL生成に使用するベースURLを環境変数やアプリケーション設定で定義し、Hostヘッダに一切依存しないことです。これにより、攻撃者がどのようなHostヘッダを送信しても、生成されるリンクは常に正しいドメインを指します。",
      referenceLink: "/step07-design/host-header-injection",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "Host Header Injectionで生成されたパスワードリセットメールは正規のサーバーから送信されるため、SPF/DKIM認証をパスし、被害者がフィッシングと見抜くのは困難である。",
      correctAnswer: true,
      explanation:
        "攻撃者はHostヘッダを偽装するだけであり、メール自体は正規のサーバーから送信されます。そのためSPF/DKIMなどのメール認証は正当なものとなり、被害者はメールの送信元からフィッシングと判断することが非常に困難です。",
      referenceLink: "/step07-design/host-header-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "ブラウザ経由のリクエストではHostヘッダは自動的に正しい値が設定されるため、Host Header Injectionはcurlやスクリプトからのリクエストでのみ発生する。",
      correctAnswer: true,
      explanation:
        "ブラウザはアクセス先のドメインに基づいてHostヘッダを自動的に設定するため、通常のブラウザ操作ではHostヘッダを偽装できません。しかし攻撃者はcurlやカスタムスクリプトで任意のHostヘッダを設定してリクエストを送信できるため、サーバー側での検証が必要です。",
      referenceLink: "/step07-design/host-header-injection",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "Host Header Injectionによるパスワードリセットトークン窃取の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がHost: evil.exampleを設定してリセットをリクエストする",
        "サーバーがHostヘッダを検証せずにリセットリンクを生成する",
        "被害者のメールにevil.exampleを含むリセットリンクが届く",
        "被害者がリンクをクリックしトークンが攻撃者のサーバーに送信される",
        "攻撃者が盗んだトークンで被害者のパスワードを変更する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "攻撃者が偽のHostヘッダを送信すると、サーバーはその値を使ってリセットリンクを生成し、被害者のメールに送信します。被害者がリンクをクリックするとトークンが攻撃者のサーバーに到達し、アカウント乗っ取りが完了します。",
      referenceLink: "/step07-design/host-header-injection",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "DjangoではHost Header Injectionを防ぐために、設定ファイルで許可するホスト名を定義する ______ 設定が用意されている。（大文字アンダースコア区切りで回答）",
      correctAnswers: ["ALLOWED_HOSTS"],
      explanation:
        "DjangoのALLOWED_HOSTS設定は、許可するホスト名のリストを定義します。リクエストのHostヘッダがこのリストに含まれない場合、Djangoは400 Bad Requestを返します。CVE-2012-4520の修正としてこの検証が強化されました。",
      referenceLink: "/step07-design/host-header-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "リバースプロキシ環境でHostヘッダの代わりに使用されることがある、転送元ホスト名を示すヘッダーは X-______-Host である。（英語で回答）",
      correctAnswers: ["Forwarded"],
      explanation:
        "X-Forwarded-Hostヘッダーは、リバースプロキシがオリジナルのHostヘッダー値を保持するために使用します。ただしこのヘッダーもクライアントが自由に設定できるため、信頼できるプロキシからのリクエストでのみ参照し、それ以外では環境変数のベースURLを使用すべきです。",
      referenceLink: "/step07-design/host-header-injection",
    },
  ],
} satisfies QuizData;
