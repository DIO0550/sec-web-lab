import { Hono } from "hono";
import { simulateAuthService } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 認証サービスのエラー時にアクセスを拒否（Fail-Closed）
app.get("/admin", (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  try {
    const auth = simulateAuthService(token || "");
    if (!auth || !auth.valid) {
      return c.json({ success: false, message: "認証失敗" }, 401);
    }
    if (auth.role !== "admin") {
      return c.json({ success: false, message: "管理者権限が必要です" }, 403);
    }
    return c.json({ success: true, message: "管理者ページにアクセスしました", data: { secretInfo: "internal-data" } });
  } catch (err) {
    // ✅ Fail-Closed: エラー時は必ずアクセスを拒否
    console.error("Auth service error:", err);
    return c.json({
      success: false,
      message: "認証サービスに接続できません。しばらくしてから再試行してください",
    }, 503);
  }
});

export default app;
