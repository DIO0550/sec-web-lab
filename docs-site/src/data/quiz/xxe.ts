import type { QuizData } from "../../components/quiz/types";

/**
 * XXE (XML External Entity) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "XXE (XML External Entity) - 理解度テスト",
  description:
    "XXEの攻撃手法・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "XXE攻撃で攻撃者がサーバー上のファイルを読み取るために利用するXMLの機能はどれか？",
      options: [
        "XMLスキーマ（XSD）によるバリデーション機能",
        "DTD（Document Type Definition）の外部エンティティ定義機能",
        "XPath によるノード検索機能",
        "XSLT によるデータ変換機能",
      ],
      correctIndex: 1,
      explanation:
        "XXE攻撃では、DTD（Document Type Definition）の外部エンティティ定義機能を悪用します。SYSTEMキーワードでfile://プロトコルを指定することで、XMLパーサーにサーバー上のファイル（/etc/passwd等）を読み込ませ、その内容をXMLデータに展開させることができます。",
      referenceLink: "/step06-server-side/xxe",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "XXE対策として最も根本的かつ効果的な方法はどれか？",
      options: [
        "XMLデータのサイズを制限する",
        "WAFで<!ENTITY>パターンをブロックする",
        "XMLパーサーの外部エンティティ解決を無効化する",
        "XMLデータをBase64エンコードして受け取る",
      ],
      correctIndex: 2,
      explanation:
        "XXEの根本対策は、XMLパーサーの設定で外部エンティティの解決を明示的に無効化することです。例えばfast-xml-parserでは processEntities: false を設定します。これにより、SYSTEM キーワードで指定されたファイルパスやURLが解決されなくなり、ファイル読み取りやSSRFが防止されます。",
      referenceLink: "/step06-server-side/xxe",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "JSONを使用するAPIではXXE脆弱性は原理的に発生しない。",
      correctAnswer: true,
      explanation:
        "JSONにはエンティティの概念がないため、XXEは原理的に発生しません。XXEはXML固有のDTDとエンティティ機能を悪用する攻撃であり、JSONパーサーにはそのような機能が存在しません。XMLからJSONへの移行はXXEの根本対策の一つです。",
      referenceLink: "/step06-server-side/xxe",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "XXE攻撃ではファイルの読み取りだけでなく、Billion Laughs Attackによるサーバーのメモリ枯渇（DoS攻撃）も可能である。",
      correctAnswer: true,
      explanation:
        "Billion Laughs Attack（XML爆弾）は、エンティティを再帰的に参照させることで指数関数的にデータを膨張させ、サーバーのメモリを枯渇させる攻撃です。XXEと同じくDTDのエンティティ機能を悪用します。外部エンティティの無効化やDTD処理の完全無効化で防止できます。",
      referenceLink: "/step06-server-side/xxe",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "XXEによるサーバーファイル読み取り攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がDTDで外部エンティティ（file:///etc/passwd）を定義したXMLを作成する",
        "攻撃者がXMLデータをサーバーのAPIに送信する",
        "XMLパーサーがエンティティ定義を処理し、SYSTEMで指定されたファイルを読み取る",
        "ファイルの内容がエンティティの値として展開され、XMLデータに埋め込まれる",
        "サーバーがパース結果をレスポンスとして返し、攻撃者がファイル内容を取得する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 1, 0, 3],
      explanation:
        "XXE攻撃では、まず攻撃者が外部エンティティを定義したXMLを作成し、APIに送信します。XMLパーサーがSYSTEMキーワードで指定されたファイルを読み取り、その内容をエンティティの値として展開します。パース結果がレスポンスに含まれるため、攻撃者はファイルの内容を取得できます。",
      referenceLink: "/step06-server-side/xxe",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "XMLの外部エンティティ定義で、外部リソースを参照するために使用するキーワードは______である。（英語で回答）",
      correctAnswers: ["SYSTEM"],
      explanation:
        "XMLのDTDでは、SYSTEMキーワードを使って外部リソースのURIを指定します。例えば <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> と記述すると、パーサーが /etc/passwd ファイルを読み取ってエンティティの値として展開します。このSYSTEMキーワードによる外部参照がXXE攻撃の核心です。",
      referenceLink: "/step06-server-side/xxe",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "fast-xml-parserで外部エンティティの処理を無効化するには、______オプションをfalseに設定する。（キャメルケースで回答）",
      correctAnswers: ["processEntities"],
      explanation:
        "fast-xml-parserでは processEntities: false を設定することで、エンティティの展開自体を無効化できます。これにより、SYSTEMキーワードで指定されたファイルパスやURLが解決されなくなり、XXE攻撃を防止できます。",
      referenceLink: "/step06-server-side/xxe",
    },
  ],
} satisfies QuizData;
