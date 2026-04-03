import type { QuizData } from "../../components/quiz/types";

/**
 * Cache Control - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "キャッシュ制御の不備 - 理解度テスト",
  description:
    "キャッシュ制御ヘッダーの不備による情報漏洩の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "共有PCでユーザーAがログアウトした後、ユーザーBが「戻る」ボタンを押すとユーザーAのマイページが表示される原因はどれか？",
      options: [
        "サーバー側のセッションが正しく無効化されていないため",
        "Cache-Controlヘッダーが未設定で、レスポンスがブラウザキャッシュに残存しているため",
        "ユーザーAのCookieがブラウザに残っているため",
        "ブラウザの「戻る」ボタンが再ログイン処理を自動実行するため",
      ],
      correctIndex: 1,
      explanation:
        "ブラウザの「戻る」ボタンは、ネットワークリクエストを送信せずにブラウザキャッシュ（bfcache）からページを復元します。Cache-Controlヘッダーが設定されていない場合、以前のレスポンスがキャッシュに残っているため、ログアウト後でもユーザーAの個人情報が表示されてしまいます。",
      referenceLink: "/step07-design/cache-control",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Cache-Controlディレクティブで、CDN/プロキシ（共有キャッシュ）への保存を禁止するものはどれか？",
      options: [
        "no-store",
        "no-cache",
        "private",
        "must-revalidate",
      ],
      correctIndex: 2,
      explanation:
        "privateディレクティブは、ブラウザキャッシュ（プライベートキャッシュ）のみ許可し、CDNやリバースプロキシなどの共有キャッシュへの保存を禁止します。no-storeは全てのキャッシュを禁止し、no-cacheはキャッシュを使用する前にサーバーへの問い合わせを必須とします。",
      referenceLink: "/step07-design/cache-control",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "no-storeディレクティブを設定すると、ブラウザはレスポンスをディスクキャッシュに一切保存しないため、「戻る」ボタンによる情報漏洩を防げる。",
      correctAnswer: true,
      explanation:
        "no-storeはレスポンスを一切キャッシュに保存しないよう指示する最も強力なディレクティブです。「戻る」ボタンが押された場合、キャッシュにデータが存在しないためブラウザはサーバーに再リクエストを送信します。ログアウト後はセッションが無効なため認証エラーとなり、情報は表示されません。",
      referenceLink: "/step07-design/cache-control",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Pragma: no-cacheヘッダーは、HTTP/1.0準拠のレガシークライアントとの互換性のために設定する。",
      correctAnswer: true,
      explanation:
        "Pragma: no-cacheはHTTP/1.0時代のキャッシュ制御ヘッダーです。Cache-ControlはHTTP/1.1で導入されたため、HTTP/1.0準拠の古いプロキシやクライアントではCache-Controlが理解されない場合があります。Pragma: no-cacheはその互換性のために設定します。",
      referenceLink: "/step07-design/cache-control",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "CDNキャッシュによる他ユーザーへの情報漏洩の流れを正しい順序に並べ替えてください。",
      items: [
        "ユーザーAがログイン済みでマイページにアクセスする",
        "CDNがCache-Control未設定のレスポンスをキャッシュする",
        "ユーザーB（別のユーザー）が同じURLにアクセスする",
        "CDNがキャッシュされたユーザーAのレスポンスをユーザーBに返す",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "ユーザーAのリクエストに対するレスポンスがCDNにキャッシュされ、その後ユーザーBが同じURLにアクセスすると、CDNがキャッシュヒットとしてユーザーAの個人情報を含むレスポンスをユーザーBに返してしまいます。",
      referenceLink: "/step07-design/cache-control",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "機密データを含むレスポンスに設定すべきCache-Controlの値は「______、no-cache、must-revalidate、private」である。（英語ハイフン付きで回答）",
      correctAnswers: ["no-store"],
      explanation:
        "no-storeはレスポンスを一切キャッシュに保存しないよう指示する最も強力なディレクティブです。パスワード、個人情報、金融データなど最高機密のレスポンスには必ず設定すべきです。",
      referenceLink: "/step07-design/cache-control",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "HTTP/1.0互換のキャッシュ制御ヘッダーで、Cache-Controlが理解されない古いシステムに対して使用するのは ______ である。（英語で回答）",
      correctAnswers: ["Pragma"],
      explanation:
        "PragmaヘッダーはHTTP/1.0由来のキャッシュ制御ヘッダーです。Pragma: no-cacheを設定することで、Cache-Controlを理解しないレガシーなプロキシやクライアントに対してもキャッシュの使用前にサーバーへの問い合わせを要求できます。",
      referenceLink: "/step07-design/cache-control",
    },
  ],
} satisfies QuizData;
