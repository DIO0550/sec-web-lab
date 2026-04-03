import type { QuizData } from "../../components/quiz/types";

/**
 * CORS Misconfiguration - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "CORS設定不備 - 理解度テスト",
  description:
    "CORS設定不備の攻撃手法・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "CORS設定不備による攻撃が成功するために必要な条件の組み合わせとして正しいものはどれか？",
      options: [
        "Access-Control-Allow-Origin: * と credentials: true の同時設定",
        "リクエストのOriginヘッダーを無条件にAccess-Control-Allow-Originに反映し、Access-Control-Allow-Credentials: true も設定していること",
        "サーバーがHTTPSを使用していないこと",
        "CSRFトークンが実装されていないこと",
      ],
      correctIndex: 1,
      explanation:
        "CORS設定不備の攻撃が成立するには、サーバーがリクエストのOriginヘッダーをAccess-Control-Allow-Originにそのまま反映し、かつAccess-Control-Allow-Credentials: trueを設定している必要があります。これにより任意のオリジンからCookie付きでAPIを呼び出せます。なお、ブラウザは * と credentials: true の組み合わせを拒否します。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "CORS設定不備の根本対策として最も適切な方法はどれか？",
      options: [
        "Access-Control-Allow-Origin: * を設定して全オリジンを許可する",
        "CORSヘッダーを一切返さないようにする",
        "許可するオリジンをホワイトリストで管理し、リストに含まれるオリジンのみ許可する",
        "Cookie認証の代わりにBasic認証を使用する",
      ],
      correctIndex: 2,
      explanation:
        "CORS設定不備の根本対策は、許可するオリジンを明示的なホワイトリストで管理することです。リクエストのOriginがリストに含まれる場合のみAccess-Control-Allow-Originに設定し、含まれない場合はCORSヘッダーを返しません。これによりブラウザが未許可オリジンからのレスポンスをスクリプトに渡さなくなります。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Same-Origin Policyにより、異なるオリジンのスクリプトからAPIレスポンスを読み取ることはデフォルトで禁止されている。CORSはこの制限を明示的に緩和するための仕組みである。",
      correctAnswer: true,
      explanation:
        "Same-Origin Policy（同一オリジンポリシー）は、あるオリジンのスクリプトが別オリジンのリソースにアクセスすることをデフォルトで禁止します。CORSはサーバーがAccess-Control-Allow-Originヘッダーで特定のオリジンからのアクセスを許可することで、この制限を安全に緩和する仕組みです。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "CORSの設定ミスによる攻撃では、被害者がターゲットサイトにログイン済みである必要がある。",
      correctAnswer: true,
      explanation:
        "CORS設定不備による攻撃では、攻撃者のサイトからターゲットAPIにcredentials: includeでリクエストを送信します。被害者がターゲットサイトにログイン済みであれば、セッションCookieが自動送信され、認証済みユーザーとしてデータにアクセスできます。未ログインの場合は認証が必要なデータにはアクセスできません。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "CORS設定不備を悪用したデータ窃取攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がターゲットAPIを呼び出すJavaScriptを含む悪意あるサイトを用意する",
        "被害者（ターゲットサイトにログイン済み）が攻撃者のサイトにアクセスする",
        "悪意あるスクリプトがcredentials: includeでターゲットAPIにリクエストを送信する",
        "サーバーがOriginをそのまま反映したAccess-Control-Allow-Originヘッダーを返す",
        "ブラウザがレスポンスをスクリプトに渡し、攻撃者が被害者のデータを取得する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 0, 1, 3],
      explanation:
        "攻撃者はまず悪意あるサイトを用意し、被害者をそのサイトに誘導します。被害者のブラウザでJavaScriptが実行され、Cookie付きでターゲットAPIにリクエストが送信されます。サーバーがOriginを無条件反映するため、ブラウザはレスポンスをスクリプトに渡し、攻撃者はデータを窃取します。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CORSでクロスオリジンリクエスト時にCookieを自動送信するためにfetchのオプションで指定する値は credentials: '______' である。（英語で回答）",
      correctAnswers: ["include"],
      explanation:
        "fetchのcredentialsオプションに 'include' を指定すると、クロスオリジンリクエストでもCookieが自動送信されます。サーバー側でAccess-Control-Allow-Credentials: trueが設定されていれば、ブラウザはレスポンスをスクリプトに渡します。この組み合わせがCORS設定不備による攻撃の鍵です。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "CORSレスポンスヘッダーで、Cookie付きクロスオリジンリクエストを許可するヘッダー名は Access-Control-Allow-______ である。（英語で回答）",
      correctAnswers: ["Credentials"],
      explanation:
        "Access-Control-Allow-Credentials: true ヘッダーが設定されていると、ブラウザはクロスオリジンリクエストでCookieの送信を許可し、レスポンスをスクリプトに渡します。このヘッダーとOriginの無条件反映が組み合わさると、任意のサイトから認証済みユーザーのデータにアクセスできる危険な状態になります。",
      referenceLink: "/step06-server-side/cors-misconfiguration",
    },
  ],
} satisfies QuizData;
