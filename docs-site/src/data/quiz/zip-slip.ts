import type { QuizData } from "../../components/quiz/types";

/**
 * Zip Slip - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Zip Slip - 理解度テスト",
  description:
    "Zip Slip攻撃の仕組み・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Zip Slip攻撃が成功する根本的な原因はどれか？",
      options: [
        "ZIPファイルの圧縮アルゴリズムに脆弱性があるため",
        "ZIPエントリのファイルパスを検証せずに展開先パスとして使用しているため",
        "サーバーのディスク容量が不足しているため",
        "ZIPライブラリがアップデートされていないため",
      ],
      correctIndex: 1,
      explanation:
        "Zip Slipの根本原因は、ZIPエントリのファイル名（パス）を信頼できないユーザー入力として扱わず、そのまま展開先パスの構築に使用していることです。ZIPの仕様ではエントリ名に ../を含めることが許可されており、検証なしにpath.join()で結合すると展開先ディレクトリの外にファイルが書き込まれます。",
      referenceLink: "/step06-server-side/zip-slip",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Zip Slip対策として最も根本的かつ効果的な方法はどれか？",
      options: [
        "ZIPファイルのサイズを制限する",
        "エントリ名から../ を文字列置換で除去する",
        "path.resolve()で絶対パスに解決し、結果が展開先ディレクトリのプレフィックスで始まるか検証する",
        "ZIPファイルのアップロード機能自体を廃止する",
      ],
      correctIndex: 2,
      explanation:
        "根本対策はpath.resolve()で展開先パスを絶対パスに解決した後、その結果が意図した展開先ディレクトリのプレフィックスで始まるかをstartsWith()で検証することです。../が含まれている場合、path.resolve()により展開先の外を指す絶対パスに解決されるため、このチェックで確実に検出できます。",
      referenceLink: "/step06-server-side/zip-slip",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "ZIPの仕様上、エントリ名に ../ を含むパスを格納することは許可されており、ZIPライブラリはこれを正常なエントリとして処理する。",
      correctAnswer: true,
      explanation:
        "ZIPファイル形式の仕様では、エントリ名にパス区切り文字や ../ を含めることが許可されています。ZIPライブラリはこれらを仕様通りに正常なエントリとして処理します。セキュリティの検証はアプリケーション側の責任であり、ライブラリは自動的にパストラバーサルを防止しません。",
      referenceLink: "/step06-server-side/zip-slip",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Node.jsの path.join() は ../ を正規化して展開先ディレクトリの外を指すパスを生成するが、path.resolve() は ../ を解決しないため安全である。",
      correctAnswer: false,
      explanation:
        "path.join()もpath.resolve()も ../ を正規化・解決します。違いはpath.resolve()が常に絶対パスを返す点です。安全な実装では、path.resolve()で絶対パスに解決した後、その結果が展開先ディレクトリのプレフィックスで始まるかをstartsWith()で検証します。path.resolve()単体で安全になるわけではなく、プレフィックス検証と組み合わせることが重要です。",
      referenceLink: "/step06-server-side/zip-slip",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Zip Slip攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が ../../../tmp/pwned.txt のようなパストラバーサルを含むエントリを持つZIPを作成する",
        "攻撃者がZIPファイルをサーバーのアップロード機能で送信する",
        "サーバーがZIPを展開し、path.join()でエントリパスと展開先ディレクトリを結合する",
        "path.join()が ../ を正規化し、展開先ディレクトリ外のパス（/tmp/pwned.txt）を生成する",
        "サーバーが検証なしにファイルを書き込み、任意の場所にファイルが作成される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 1, 4, 0, 2],
      explanation:
        "攻撃者はまずパストラバーサルを含むZIPを作成してアップロードします。サーバーがpath.join()でエントリパスを結合すると ../ が正規化され、展開先ディレクトリ外のパスが生成されます。検証が行われないため、サーバーはそのパスにファイルを書き込み、結果として任意の場所にファイルが作成されます。",
      referenceLink: "/step06-server-side/zip-slip",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Zip Slipの安全な実装では、path.resolve()で絶対パスに解決した後、resolvedPath.______( extractDir ) でパスが展開先ディレクトリ内に収まるかを検証する。（メソッド名を英語で回答）",
      correctAnswers: ["startsWith"],
      explanation:
        "startsWith()メソッドで解決済みパスが展開先ディレクトリのプレフィックスで始まるかを検証します。../が含まれるエントリはpath.resolve()により展開先外の絶対パスに解決されるため、startsWith()チェックで必ず検出されます。この2つの組み合わせがZip Slipの根本対策です。",
      referenceLink: "/step06-server-side/zip-slip",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "2018年にSnykが公表した、主要なOSSライブラリのZIP展開処理におけるパストラバーサル脆弱性の名称は Zip ______ である。（英語で回答）",
      correctAnswers: ["Slip"],
      explanation:
        "2018年にセキュリティ企業Snykが「Zip Slip」と命名して公表したこの脆弱性は、Java、JavaScript、Ruby、.NET、Goなど多くの言語のZIPライブラリで発見されました。HP、Amazon、Apache、Pivotalなど多数のプロジェクトが影響を受け、ZIPファイルの安全な展開処理の重要性が広く認識されるきっかけとなりました。",
      referenceLink: "/step06-server-side/zip-slip",
    },
  ],
} satisfies QuizData;
