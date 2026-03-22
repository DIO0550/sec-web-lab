import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// インメモリのコメントストア
const comments: { original: string; normalized: string; timestamp: number }[] =
  [];

// ⚠️ ブロックリストによるフィルタ（正規化前に適用）
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

// ⚠️ コメント投稿: フィルタ → 正規化 の順序（脆弱）
app.post("/comment", async (c) => {
  const body = await c.req.json<{ body: string }>();
  const { body: commentBody } = body;

  if (!commentBody) {
    return c.json(
      { success: false, message: "コメントを入力してください" },
      400
    );
  }

  // ⚠️ Step 1: ブロックリストでフィルタ（正規化前の文字列に対して実行）
  // 全角文字 ＜ｓｃｒｉｐｔ＞ は半角の <script と一致しないためフィルタを通過する
  const blockedWord = isBlocked(commentBody);
  if (blockedWord) {
    return c.json(
      {
        success: false,
        message: `禁止された文字列が含まれています: "${blockedWord}"`,
        original: commentBody,
        _debug: {
          message: "ブロックリストで検出（正規化前）",
          blockedWord,
        },
      },
      403
    );
  }

  // ⚠️ Step 2: NFKC正規化（フィルタ通過後に実行）
  // ここで ＜ｓｃｒｉｐｔ＞ が <script> に変換されるが、既にフィルタを通過済み
  const normalized = commentBody.normalize("NFKC");

  comments.push({
    original: commentBody,
    normalized,
    timestamp: Date.now(),
  });

  return c.json({
    success: true,
    message: "コメントを投稿しました",
    original: commentBody,
    normalized,
    _debug: {
      message:
        "フィルタ → 正規化の順序: 全角文字がフィルタを通過後に半角に変換される",
      filterPassed: true,
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
      timestamp: cm.timestamp,
    })),
  });
});

export default app;
