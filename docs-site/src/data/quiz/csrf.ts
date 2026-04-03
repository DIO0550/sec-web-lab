import type { QuizData } from "../../components/quiz/types";

/**
 * CSRFの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "CSRF - 理解度テスト",
  description:
    "CSRF攻撃の仕組み、CSRFトークンによる防御、SameSite属性との関係についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "CSRF攻撃が成立するために必要な前提条件として正しいものはどれか？",
      options: [
        "被害者のブラウザにXSS脆弱性が存在する",
        "被害者がターゲットサイトにログイン中であり、CookieがクロスサイトリクエストでもFor送信される",
        "攻撃者がターゲットサイトのデータベースにアクセスできる",
        "被害者のパスワードが弱い",
      ],
      correctIndex: 1,
      explanation:
        "CSRF攻撃は、被害者がターゲットサイトにログイン中（セッションCookieが有効）であり、クロスサイトリクエストでもCookieが自動送信される状態で成立します。攻撃者は罠ページを介して被害者のブラウザからリクエストを送信させ、Cookieが自動付与されることを悪用します。",
      referenceLink: "/step04-session/csrf",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "CSRFトークンによる防御が有効な理由はどれか？",
      options: [
        "トークンが暗号化されているため、攻撃者が解読できない",
        "攻撃者の罠ページからはターゲットサイトのCSRFトークンを読み取れないため、正しいトークンを含むリクエストを構築できない",
        "トークンによってリクエストの送信元IPアドレスが検証される",
        "トークンがCookieに保存されるため、クロスサイトリクエストでは送信されない",
      ],
      correctIndex: 1,
      explanation:
        "CSRFトークンは同一オリジンポリシーにより、攻撃者の罠ページからは読み取れません。サーバーはリクエストにトークンが含まれているか検証するため、トークンを知らない攻撃者は正当なリクエストを偽造できません。",
      referenceLink: "/step04-session/csrf",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "CSRF攻撃では、攻撃者は被害者のCookieやセッションIDを直接取得する必要がある。",
      correctAnswer: false,
      explanation:
        "CSRF攻撃では攻撃者はCookieを直接取得する必要はありません。被害者のブラウザがターゲットサイトへのリクエスト時にCookieを自動的に付与する仕組みを悪用するため、攻撃者はCookieの中身を知らなくても攻撃が成立します。",
      referenceLink: "/step04-session/csrf",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "GETリクエストで状態変更（パスワード変更、送金など）を行うAPIは、CSRF攻撃のリスクが特に高い。",
      correctAnswer: true,
      explanation:
        "GETリクエストはimg要素のsrc属性やリンクのhref属性など、多くの場面で自動的に発行されます。GETで状態変更を行うAPIは、imgタグを埋め込むだけでCSRF攻撃が成立するため、特にリスクが高くなります。状態変更はPOST以上のメソッドで行うべきです。",
      referenceLink: "/step04-session/csrf",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "CSRF攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "被害者がターゲットサイトにログインしセッションCookieを取得する",
        "攻撃者が罠ページ（自動送信フォーム等）を用意する",
        "被害者が罠ページにアクセスする",
        "ブラウザがターゲットサイトへのリクエストにCookieを自動付与して送信する",
        "サーバーが正規のリクエストとして処理してしまう",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "CSRF攻撃は、被害者のログイン→攻撃者の罠ページ準備→被害者のアクセス→Cookie自動付与でリクエスト送信→サーバーの処理という流れで進みます。サーバーが正規リクエストと区別できないことが問題の本質です。",
      referenceLink: "/step04-session/csrf",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CSRF対策として、フォーム送信時にサーバーが検証するための秘密のトークンを ______ トークンと呼ぶ。",
      correctAnswers: ["CSRF", "csrf", "Anti-CSRF", "anti-csrf"],
      explanation:
        "CSRFトークン（Anti-CSRFトークン）は、サーバーが生成してフォームに埋め込む一意のトークンです。リクエスト時にトークンを検証することで、正規のフォームから送信されたリクエストであることを確認し、外部サイトからの偽造リクエストを拒否します。",
      referenceLink: "/step04-session/csrf",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Cookie属性の ______ をStrictに設定すると、クロスサイトリクエストでCookieが送信されなくなり、CSRF攻撃を緩和できる。",
      correctAnswers: ["SameSite", "samesite", "sameSite", "SAMESITE"],
      explanation:
        "SameSite属性をStrictに設定すると、外部サイトからのリクエストにCookieが一切付与されません。これによりCSRF攻撃の成立条件であるCookieの自動送信を防ぐことができます。ただし、外部リンクからの遷移でもCookieが送られないため、UXとのバランスを考慮する必要があります。",
      referenceLink: "/step04-session/csrf",
    },
  ],
} satisfies QuizData;
