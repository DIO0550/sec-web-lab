import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// インメモリのコメントストア
const comments: { original: string; normalized: string; sanitized: string; timestamp: number }[] =
  [];

// ブロックリスト（正規化後に適用）
const BLOCKLIST = ["<script", "</script", "onerror", "onclick", "javascript:"];

function isBlocked(input: string): string | null {
  const lower = input.toLowerCase();
  for (const blocked of BLOCKLIST) {
    if (lower.includes(blocked)) {
      return blocked;
    }
  }
  return null;
}

// ✅ HTMLエスケープ関数
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ✅ コメント投稿: 正規化 → フィルタ の正しい順序
app.post("/comment", async (c) => {
  const body = await c.req.json<{ body: string }>();
  const { body: commentBody } = body;

  if (!commentBody) {
    return c.json(
      { success: false, message: "コメントを入力してください" },
      400
    );
  }

  // ✅ Step 1: 先にNFKC正規化を行う
  // 全角文字 ＜ｓｃｒｉｐｔ＞ が <script> に変換された状態でフィルタされる
  const normalized = commentBody.normalize("NFKC");

  // ✅ Step 2: 正規化後の文字列に対してフィルタリング
  const blockedWord = isBlocked(normalized);
  if (blockedWord) {
    return c.json(
      {
        success: false,
        message: `禁止された文字列が含まれています: "${blockedWord}"`,
        original: commentBody,
        normalized,
        _debug: {
          message: "正規化 → フィルタの順序: 正規化後にブロックリストで検出",
          blockedWord,
        },
      },
      403
    );
  }

  // ✅ Step 3: 出力時にHTMLエスケープ（多層防御）
  const sanitized = escapeHtml(normalized);

  comments.push({
    original: commentBody,
    normalized,
    sanitized,
    timestamp: Date.now(),
  });

  return c.json({
    success: true,
    message: "コメントを投稿しました",
    original: commentBody,
    normalized,
    sanitized,
    _debug: {
      message:
        "正規化 → フィルタ → エスケープの正しい順序で処理",
      filterPassed: false,
    },
  });
});

// コメント一覧取得
app.get("/comments", (c) => {
  return c.json({
    success: true,
    comments: comments.map((cm) => ({
      original: cm.original,
      normalized: cm.normalized,
      sanitized: cm.sanitized,
      timestamp: cm.timestamp,
    })),
  });
});

export default app;
