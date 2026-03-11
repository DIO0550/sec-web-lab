import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ スタックトレースをログに記録し、ユーザーには一般メッセージのみ返す
app.get("/error", (c) => {
  try {
    const obj: Record<string, unknown> = {};
    (obj as { nested: { deep: { call: () => void } } }).nested.deep.call();
    return c.json({ success: true });
  } catch (err) {
    // ✅ スタックトレースはサーバーログに記録
    console.error("Internal error:", err);
    // ✅ ユーザーにはエラーIDと一般メッセージのみ返す
    const errorId = Math.random().toString(36).substring(2, 10);
    return c.json({
      success: false,
      message: "内部エラーが発生しました",
      errorId,
      // ✅ スタックトレースや内部情報は含めない
    }, 500);
  }
});

// ✅ デバッグ情報を含めない
app.get("/debug", (c) => {
  return c.json({
    success: false,
    message: "内部エラーが発生しました",
    errorId: Math.random().toString(36).substring(2, 10),
  }, 500);
});

export default app;
