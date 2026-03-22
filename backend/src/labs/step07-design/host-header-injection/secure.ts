import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ベースURLをハードコード（環境変数から取得）— Hostヘッダに依存しない
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

// ✅ 許可するホスト名のリスト
const ALLOWED_HOSTS = new Set(["localhost:5173", "localhost:3000"]);

app.post("/reset-request", async (c) => {
  const body = await c.req.json<{ email: string }>();
  const { email } = body;

  if (!email) {
    return c.json(
      { success: false, message: "メールアドレスを入力してください" },
      400
    );
  }

  // ✅ X-Custom-Host ヘッダの値を許可リストで検証
  const customHost = c.req.header("x-custom-host");
  if (customHost && !ALLOWED_HOSTS.has(customHost)) {
    return c.json(
      {
        success: false,
        message: "不正なHostヘッダです",
        _debug: {
          message: "許可リストに含まれないHostヘッダを拒否",
          rejectedHost: customHost,
          allowedHosts: Array.from(ALLOWED_HOSTS),
        },
      },
      400
    );
  }

  const token = randomUUID();

  // ✅ 環境変数のベースURLを使用 — Hostヘッダの値は一切参照しない
  const resetLink = `${BASE_URL}/reset?token=${token}`;

  return c.json({
    success: true,
    message: "リセットメールを送信しました",
    resetLink,
    token,
    _debug: {
      message: "ハードコードされたベースURLを使用（Hostヘッダに依存しない）",
      usedBaseUrl: BASE_URL,
    },
  });
});

export default app;
