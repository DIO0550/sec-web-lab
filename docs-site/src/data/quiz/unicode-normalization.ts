import type { QuizData } from "../../components/quiz/types";

/**
 * Unicode Normalization Bypass - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Unicode Normalization Bypass - 理解度テスト",
  description:
    "Unicode正規化によるフィルタ回避の攻撃手法・発生原因・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Unicode Normalization Bypass が成立する根本原因はどれか？",
      options: [
        "Unicode 自体にセキュリティ上の欠陥があるため",
        "ブロックリストによるフィルタリングの後に Unicode 正規化が行われるため",
        "HTTPS を使用していないため文字化けが発生するため",
        "ブラウザが Unicode を正しく解釈できないため",
      ],
      correctIndex: 1,
      explanation:
        "フィルタリングが正規化の前に行われると、全角文字 'ｓｃｒｉｐｔ' は半角の 'script' と一致しないためフィルタを通過します。その後の NFKC 正規化で 'script' に変換され、XSS が成立します。処理順序の逆転が根本原因です。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Unicode Normalization Bypass に対する安全な対策の組み合わせはどれか？",
      options: [
        "ブロックリストを拡充して全角文字も追加する",
        "正規化をフィルタリングの前に行い、アローリスト方式を採用し、出力時に HTML エスケープする",
        "入力を一切受け付けないようにする",
        "Unicode 文字を使用禁止にする",
      ],
      correctIndex: 1,
      explanation:
        "安全な対策は、(1) 正規化をフィルタの前に行うことで全角文字が半角に変換された状態で検査する、(2) ブロックリストではなくアローリスト方式で許可する文字のみ通す、(3) 出力時に HTML エスケープを行う、の3層防御です。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "NFKC 正規化では、全角の 'ｓ'（U+FF53）が半角の 's'（U+0073）に変換される。",
      correctAnswer: true,
      explanation:
        "NFKC（Compatibility Decomposition followed by Canonical Composition）は互換分解を行うため、全角ラテン文字が対応する半角文字に変換されます。'ｓｃｒｉｐｔ'.normalize('NFKC') は 'script' になります。これがフィルタ回避に悪用されるポイントです。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "ブロックリスト方式のフィルタに Unicode の全バリエーション（全角、ホモグリフ、結合文字）を網羅すれば、Unicode Normalization Bypass を完全に防げる。",
      correctAnswer: false,
      explanation:
        "Unicode には同じ見た目を持つ異なるコードポイントが非常に多数存在します（全角、キリル文字のホモグリフ、結合文字など）。これら全てをブロックリストに網羅するのは事実上不可能です。アローリスト方式で許可する文字のみを通す方が安全です。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "全角文字によるブロックリスト回避で XSS が成立する流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が全角文字で ＜ｓｃｒｉｐｔ＞alert(1)＜/ｓｃｒｉｐｔ＞ を送信する",
        "サーバーのブロックリストが半角の 'script' を検査するが、全角文字は一致しないため通過する",
        "フィルタ通過後に NFKC 正規化が適用され、全角文字が半角に変換される",
        "正規化後の文字列 <script>alert(1)</script> が HTML に埋め込まれる",
        "被害者のブラウザでスクリプトが実行され XSS が成立する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "攻撃者は全角文字でフィルタを回避します。ブロックリストは半角文字しか検査しないため全角文字は通過し、その後の NFKC 正規化で危険な半角文字列に変換されます。正規化後の文字列がHTMLに埋め込まれ、XSS が成立します。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "全角文字を半角文字に変換する Unicode 正規化形式は ______ である。（アルファベット4文字で回答）",
      correctAnswers: ["NFKC", "nfkc"],
      explanation:
        "NFKC（Compatibility Decomposition followed by Canonical Composition）は互換分解後に正準合成を行う正規化形式です。全角→半角の変換、リガチャの分解（ﬁ → fi）などが行われます。'ｓ'.normalize('NFKC') は 's' に変換されます。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "安全な実装では、ブロックリスト方式ではなく ______ 方式（許可リスト）で、許可する文字のみを通すようにフィルタリングする。",
      correctAnswers: ["アローリスト", "ホワイトリスト", "許可リスト", "allowlist"],
      explanation:
        "アローリスト（許可リスト）方式は、許可する文字やパターンを明示的に定義し、それ以外を全て拒否するアプローチです。ブロックリスト方式が既知の危険パターンのみをブロックするのに対し、アローリスト方式は未知の攻撃パターンにも対応できるためより安全です。",
      referenceLink: "/step08-advanced/unicode-normalization",
    },
  ],
} satisfies QuizData;
