import type { QuizData } from "../../components/quiz/types";

/**
 * SSRF Bypass - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め1問（計6問）
 */
export const quizData = {
  title: "SSRFフィルタ回避 - 理解度テスト",
  description:
    "SSRFフィルタの回避テクニックと適切な対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "文字列マッチングによるSSRFブロックリストが根本的に不十分な理由として最も適切なのはどれか？",
      options: [
        "正規表現の処理速度が遅く、大量リクエストに対応できないため",
        "IPアドレスには16進数・8進数・IPv6・10進整数など多数の代替表現があり、全てを文字列リストで網羅するのが不可能なため",
        "ブロックリストに登録できるIPアドレスの数に上限があるため",
        "JavaScriptの文字列比較が大文字小文字を区別しないため",
      ],
      correctIndex: 1,
      explanation:
        "127.0.0.1は16進数（0x7f000001）、8進数（0177.0.0.1）、IPv6（[::1]）、10進整数（2130706433）、IPv4マップドIPv6（[::ffff:127.0.0.1]）など多数の形式で表現できます。文字列マッチングではこれら全てのバリエーションをカバーすることは現実的に不可能であり、必ず回避手法が存在します。",
      referenceLink: "/step06-server-side/ssrf-bypass",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "SSRFフィルタ回避に対する根本的な対策はどれか？",
      options: [
        "ブロックリストのパターン数を増やしてより多くのIP表現をカバーする",
        "URLの文字列を検証するのではなく、DNS解決後の実際のIPアドレスを検証する",
        "リクエストのUser-Agentヘッダーを検証する",
        "HTTPSのみを許可し、HTTPリクエストを全てブロックする",
      ],
      correctIndex: 1,
      explanation:
        "根本対策は、URLの文字列表現ではなくDNS解決後の実際のIPアドレスを検証することです。ホスト名がどのような形式で指定されても、OSがDNS解決した結果は同じIPアドレスになります。さらに、DNS Rebinding対策として解決済みIPで直接リクエストを発行することも重要です。",
      referenceLink: "/step06-server-side/ssrf-bypass",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "0x7f000001 は 127.0.0.1 の16進数表現であり、文字列マッチングで localhost や 127.0.0.1 をブロックしていても、この表現を使えばSSRFフィルタを回避できる。",
      correctAnswer: true,
      explanation:
        "0x7f000001は127.0.0.1の16進数表現です。OSのネットワークスタックはこの表現を正しく127.0.0.1として解決しますが、文字列マッチングのブロックリストには含まれていないため、フィルタを通過します。同様に8進数（0177.0.0.1）や10進整数（2130706433）でも回避可能です。",
      referenceLink: "/step06-server-side/ssrf-bypass",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "DNS Rebinding攻撃では、DNSサーバーが最初の問い合わせでは外部IPを返し、2回目の問い合わせではプライベートIPを返すことで、SSRF検証を回避する。",
      correctAnswer: true,
      explanation:
        "DNS Rebinding攻撃では、攻撃者が管理するDNSサーバーを設定し、最初のDNSクエリ（検証時）では外部IPを返して検証を通過させ、2回目のDNSクエリ（実際のリクエスト時）ではプライベートIP（127.0.0.1等）を返します。この検証時と通信時のタイミング差（TOCTOU）を悪用します。対策として、DNS解決済みIPで直接リクエストを発行するDNS pinningが有効です。",
      referenceLink: "/step06-server-side/ssrf-bypass",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "SSRFフィルタ回避攻撃の典型的な流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がlocalhostや127.0.0.1でSSRFを試みるが、ブロックリストにより拒否される",
        "攻撃者がブロックリストの存在と文字列マッチング方式を推測する",
        "127.0.0.1の代替表現（16進数、8進数、IPv6等）でフィルタ回避を試みる",
        "代替表現がブロックリストに含まれないため、フィルタを通過する",
        "サーバーが内部ネットワークにリクエストを送信し、内部情報が取得される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [4, 2, 0, 3, 1],
      explanation:
        "攻撃者はまず基本的なSSRFを試み、ブロックリストの存在を確認します。次に文字列マッチング方式であることを推測し、IPアドレスの代替表現で回避を試みます。ブロックリストに含まれない表現がフィルタを通過し、結果として内部サービスにアクセスできてしまいます。",
      referenceLink: "/step06-server-side/ssrf-bypass",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "DNS Rebinding対策として、DNS解決で得られたIPアドレスを直接使ってリクエストを発行する手法を DNS ______ と呼ぶ。（英語で回答）",
      correctAnswers: ["pinning"],
      explanation:
        "DNS pinning（DNSピニング）は、DNS解決で得られたIPアドレスを固定（pin）し、そのIPアドレスを直接使ってHTTPリクエストを発行する手法です。これにより、検証時と通信時でDNS解決結果が変わるDNS Rebinding攻撃を防止できます。ホスト名による再解決を行わないことがポイントです。",
      referenceLink: "/step06-server-side/ssrf-bypass",
    },
  ],
} satisfies QuizData;
