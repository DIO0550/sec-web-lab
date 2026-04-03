import type { QuizData } from "../../components/quiz/types";

/**
 * SSRF (Server-Side Request Forgery) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "SSRF (Server-Side Request Forgery) - 理解度テスト",
  description:
    "SSRFの攻撃手法・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "SSRFが特にクラウド環境で危険とされる主な理由はどれか？",
      options: [
        "クラウド環境ではファイアウォールが存在しないため",
        "メタデータAPI（169.254.169.254）から一時クレデンシャルを取得でき、AWSリソース全体にアクセスされる可能性があるため",
        "クラウド環境ではSSRFの対策が技術的に不可能であるため",
        "クラウドサーバーはオンプレミスより処理速度が遅く、攻撃を検知できないため",
      ],
      correctIndex: 1,
      explanation:
        "クラウド環境（AWS等）では、インスタンスメタデータAPI（169.254.169.254）にサーバーからアクセスでき、IAMロールの一時クレデンシャルを取得できます。SSRFでこのAPIにアクセスされると、S3バケットやデータベースなどAWSリソース全体への不正アクセスにつながります。2019年のCapital One事件がその代表例です。",
      referenceLink: "/step06-server-side/ssrf",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "SSRF対策として最も根本的かつ効果的な方法はどれか？",
      options: [
        "WAFで内部IPアドレスパターンをブロックする",
        "ユーザーから指定されたURLのホスト名をDNS解決し、解決後のIPアドレスがプライベートIPレンジに含まれないか検証する",
        "URLパラメータを暗号化して送信する",
        "サーバーからの外部リクエストを全て禁止する",
      ],
      correctIndex: 1,
      explanation:
        "SSRFの根本対策は、ユーザー指定URLのホスト名をDNS解決し、結果のIPアドレスがプライベートIPレンジ（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16、127.0.0.0/8、169.254.0.0/16等）に含まれないかを検証することです。さらにプロトコルをhttp/httpsに限定することも重要です。",
      referenceLink: "/step06-server-side/ssrf",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "SSRFでは、サーバーがユーザーの代わりにHTTPリクエストを発行するため、ファイアウォールの内側にある内部サービスにアクセスできる。",
      correctAnswer: true,
      explanation:
        "SSRFの本質は、サーバーのネットワーク権限を悪用することです。サーバーはファイアウォールの内側にあり、内部サービスやクラウドメタデータAPIに直接アクセスできます。攻撃者はサーバーを「踏み台」にすることで、外部からは到達できない内部ネットワークを探索できます。",
      referenceLink: "/step06-server-side/ssrf",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "SSRFはサーバーがURLを取得する機能がある場合にのみ発生し、Webhookやフィード取得のような機能では発生しない。",
      correctAnswer: false,
      explanation:
        "SSRFはURLプレビュー、Webhookの通知先確認、RSS/フィード取得、画像のリモート取得など、サーバーがユーザー指定のURLにリクエストを発行するあらゆる機能で発生する可能性があります。「サーバーがユーザー指定のURLにリクエストを送る」という条件が揃えば、機能の種類に関係なくSSRFのリスクがあります。",
      referenceLink: "/step06-server-side/ssrf",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "SSRFによるクラウドメタデータ取得攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がURL取得機能に内部アドレス（169.254.169.254）を指定する",
        "サーバーがURLの宛先を検証せずにリクエストを発行する",
        "サーバーのネットワーク権限でメタデータAPIにアクセスが成功する",
        "メタデータAPIからIAMロールの一時クレデンシャルが返される",
        "攻撃者がレスポンスからクレデンシャルを取得し、AWSリソースにアクセスする",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "SSRFによるクラウドメタデータ取得では、まず攻撃者がメタデータAPIのアドレスを指定し、サーバーが検証なしにリクエストを発行します。サーバーはファイアウォールの内側にあるため、メタデータAPIにアクセスでき、一時クレデンシャルが返されます。攻撃者はこのクレデンシャルを使ってAWSリソースに不正アクセスします。",
      referenceLink: "/step06-server-side/ssrf",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "SSRFの安全な実装では、ユーザー指定URLのプロトコルをhttp/httpsに限定し、ホスト名をDNS解決した後、解決されたIPアドレスが______IPでないことを検証する。（カタカナ5文字で回答）",
      correctAnswers: ["プライベート"],
      explanation:
        "SSRFの根本対策では、DNS解決後のIPアドレスがプライベートIP（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）、ループバック（127.0.0.0/8）、リンクローカル（169.254.0.0/16）に含まれないかを検証します。これにより、文字列表現に依存しない確実なIPアドレス検証が可能になります。",
      referenceLink: "/step06-server-side/ssrf",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "AWSのインスタンスメタデータサービスのIPアドレスは______である。（ドット区切りのIPv4アドレスで回答）",
      correctAnswers: ["169.254.169.254"],
      explanation:
        "AWSのインスタンスメタデータサービスはリンクローカルアドレス 169.254.169.254 で提供されています。このAPIからIAMロールの一時クレデンシャルやインスタンス情報を取得できるため、SSRFの主要な攻撃対象となります。IMDSv2ではトークンベースのアクセスが導入され、単純なSSRFでのアクセスが困難になっています。",
      referenceLink: "/step06-server-side/ssrf",
    },
  ],
} satisfies QuizData;
