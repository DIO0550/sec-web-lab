import type { QuizData } from "../../components/quiz/types";

/**
 * Content Security Policyの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "Content Security Policy - 理解度テスト",
  description:
    "CSPの仕組み、主要なディレクティブ、nonce-based CSPによる防御、段階的導入の方法についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "CSPのscript-srcディレクティブに'unsafe-inline'を指定した場合の問題点はどれか？",
      options: [
        "外部スクリプトの読み込みがブロックされる",
        "インラインスクリプトの実行が許可されるため、XSS攻撃をブロックできない",
        "ページの読み込み速度が大幅に低下する",
        "すべてのスクリプトの実行がブロックされる",
      ],
      correctIndex: 1,
      explanation:
        "'unsafe-inline'はインラインスクリプトの実行を許可します。これによりXSSで注入されたインラインスクリプトもそのまま実行されてしまい、CSPが存在しないのとほぼ同じ状態になります。",
      referenceLink: "/step09-defense/csp",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "nonce-based CSPで攻撃者が注入したスクリプトが実行されない理由として正しいのはどれか？",
      options: [
        "攻撃者のスクリプトはファイルサイズが大きすぎるから",
        "攻撃者のスクリプトには正しいnonce属性がなく、nonceはリクエストごとに変わるため推測できないから",
        "攻撃者のIPアドレスがブロックされているから",
        "攻撃者のスクリプトはHTTPSでないから",
      ],
      correctIndex: 1,
      explanation:
        "nonce-based CSPでは、サーバーがリクエストごとにcrypto.randomBytes()で生成した一意のnonceをCSPヘッダとscriptタグに設定します。攻撃者が注入したスクリプトにはこのnonceがなく、毎回変わるため推測も不可能です。",
      referenceLink: "/step09-defense/csp",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "CSPはXSSの根本対策であり、出力エスケープの代替として使用できる。",
      correctAnswer: false,
      explanation:
        "CSPはXSSの根本対策ではなく「多層防御」です。XSSの根本対策は出力エスケープであり、CSPはエスケープ漏れがあった場合の安全網として機能します。CSPを設定しているからといってエスケープを省略してはいけません。",
      referenceLink: "/step09-defense/csp",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Content-Security-Policy-Report-Onlyヘッダを使うと、違反をブロックせずにレポートのみ送信できるため、既存アプリケーションへのCSPの段階的導入に有効である。",
      correctAnswer: true,
      explanation:
        "Report-Onlyモードでは違反を検出してもブロックせず、レポートのみを送信します。これにより正規のスクリプトがブロックされないか影響を調査でき、ポリシーを調整した後に本番のCSPに切り替えるという段階的導入が可能です。",
      referenceLink: "/step09-defense/csp",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "既存アプリケーションにCSPを段階的に導入する手順を正しい順序に並べ替えてください。",
      items: [
        "Content-Security-Policy-Report-Onlyでレポートのみ収集する",
        "レポートを分析し、正規リソースがブロック対象になっていないか確認する",
        "ポリシーを調整して誤検知を解消する",
        "Content-Security-Policyに切り替えて実際にブロックを有効化する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 0, 2, 1],
      explanation:
        "CSPの段階的導入では、まずReport-Onlyで影響を調査し、レポートを分析して正規リソースへの影響を確認します。誤検知を解消した後、本番のContent-Security-Policyに切り替えてブロックを有効化します。",
      referenceLink: "/step09-defense/csp",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CSPの ______ ディレクティブは、他のディレクティブで指定されていないリソースのフォールバックとして機能する。",
      correctAnswers: ["default-src", "default_src"],
      explanation:
        "default-srcディレクティブは、script-src、style-src、img-srcなど個別のディレクティブで指定されていないリソースのフォールバックポリシーとして機能します。例えばdefault-src 'self'とすると、個別指定がないリソースは全て同一オリジンのみ許可されます。",
      referenceLink: "/step09-defense/csp",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "CSPでnonceを持つスクリプトから動的に読み込まれたスクリプトも自動的に許可するキーワードは '______' である。（ハイフン含む英語で回答）",
      correctAnswers: ["strict-dynamic"],
      explanation:
        "'strict-dynamic'キーワードにより、nonceで許可されたスクリプトが動的にロードするスクリプトも自動的に信頼されます。これによりホワイトリスト管理の負担が軽減され、複雑なアプリケーションでもnonce-based CSPの運用が現実的になります。",
      referenceLink: "/step09-defense/csp",
    },
  ],
} satisfies QuizData;
