import type { QuizData } from "../../components/quiz/types";

/**
 * Unrestricted File Upload - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "ファイルアップロードの検証不備 - 理解度テスト",
  description:
    "ファイルアップロード攻撃の仕組み・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ファイルアップロード攻撃で、アップロードされたHTMLファイルが同一オリジンで配信された場合に発生する最大の脅威はどれか？",
      options: [
        "サーバーのディスク容量が不足する",
        "同一オリジンのXSSとしてCookieやDOMへのアクセスが可能になる",
        "ファイルがウイルスに感染する",
        "ブラウザのキャッシュが破損する",
      ],
      correctIndex: 1,
      explanation:
        "悪意あるHTMLファイルがアプリケーションと同一オリジンから配信されると、埋め込まれたJavaScriptが同一オリジンの権限で実行されます。これはStored XSSと同等の攻撃であり、セッションCookie、個人情報、CSRFトークンの窃取が可能になります。",
      referenceLink: "/step06-server-side/file-upload",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ファイルアップロードの安全な検証方法として最も効果的な組み合わせはどれか？",
      options: [
        "Content-Typeヘッダーの検証のみ",
        "ファイル名の長さ制限とウイルススキャン",
        "拡張子のホワイトリスト検証とマジックバイト（ファイル先頭バイト列）による内容検証",
        "JavaScriptによるクライアント側でのファイル形式チェック",
      ],
      correctIndex: 2,
      explanation:
        "最も効果的な対策は拡張子のホワイトリスト検証とマジックバイトによるコンテンツ検証の二重チェックです。拡張子だけでは偽装可能であり、Content-Typeヘッダーもクライアントが自由に設定できます。マジックバイト検証によりファイルの実際の内容を確認することで、拡張子偽装も検出できます。",
      referenceLink: "/step06-server-side/file-upload",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Content-Typeヘッダー（MIMEタイプ）の検証だけではファイルアップロード攻撃を防ぐことができない。なぜなら、Content-Typeヘッダーはクライアント側で自由に偽装できるためである。",
      correctAnswer: true,
      explanation:
        "Content-Typeヘッダーはクライアント（ブラウザやcurl等）が設定するものであり、攻撃者は任意の値に変更できます。例えば、HTMLファイルのContent-Typeを image/jpeg に偽装して送信できます。そのため、Content-Typeの検証だけでは不十分であり、マジックバイトによるファイル内容の検証が必要です。",
      referenceLink: "/step06-server-side/file-upload",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "アップロードファイルを元のファイル名のまま保存しても、拡張子の検証さえ行えばセキュリティ上の問題はない。",
      correctAnswer: false,
      explanation:
        "元のファイル名をそのまま使用すると、パストラバーサル攻撃（../../ を含むファイル名）やファイル名の衝突による上書き攻撃のリスクがあります。安全な実装ではランダムに生成したファイル名（UUID等）を使用し、元のファイル名は使用しません。",
      referenceLink: "/step06-server-side/file-upload",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ファイルアップロード攻撃によるXSSの流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がJavaScriptを含むHTMLファイルを作成する",
        "ファイルアップロード機能を使ってHTMLファイルをサーバーにアップロードする",
        "サーバーが検証なしにファイルを保存し、配信URLを返す",
        "被害者が配信URLにアクセスし、ブラウザがHTMLファイルを解釈する",
        "同一オリジンでJavaScriptが実行され、CookieやDOMにアクセスされる",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 1, 4, 0, 2],
      explanation:
        "攻撃者はまず悪意あるHTMLファイルを作成し、検証のないアップロード機能でサーバーに保存させます。サーバーが配信URLを返すと、そのURLにアクセスした被害者のブラウザがHTMLを解釈し、JavaScriptが同一オリジンの権限で実行されます。",
      referenceLink: "/step06-server-side/file-upload",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ファイルの先頭数バイトを確認してファイル形式を判別する手法で使用されるバイト列を______バイトと呼ぶ。（カタカナ4文字で回答）",
      correctAnswers: ["マジック"],
      explanation:
        "マジックバイト（Magic Bytes / File Signature）は、ファイルの先頭に存在する固定のバイト列で、ファイルの実際の形式を識別するために使われます。例えばJPEGは 0xFF 0xD8 0xFF、PNGは 0x89 0x50 0x4E 0x47 で始まります。拡張子の偽装を検出するための重要な検証手段です。",
      referenceLink: "/step06-server-side/file-upload",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "アップロードファイルをブラウザにインラインで表示させずダウンロードさせるためのHTTPヘッダーは Content-Disposition: ______ である。（英語で回答）",
      correctAnswers: ["attachment"],
      explanation:
        "Content-Disposition: attachment ヘッダーを設定すると、ブラウザはファイルをインラインで表示せずダウンロードとして処理します。これにより、HTMLファイルがアップロードされてもブラウザ内で実行されず、XSSを防止する多層防御となります。",
      referenceLink: "/step06-server-side/file-upload",
    },
  ],
} satisfies QuizData;
