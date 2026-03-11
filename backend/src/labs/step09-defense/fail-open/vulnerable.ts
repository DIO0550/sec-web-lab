import { Hono } from "hono";
import { simulateAuthService } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ 認証サービスのエラー時にアクセスを許可（Fail-Open）
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
  } catch {
    // ⚠️ 認証サービスのエラー時にアクセスを許可してしまう
    // → 認証サービスが落ちるとすべてのリクエストが通る
    return c.json({
      success: true,
      message: "管理者ページにアクセスしました（認証サービス障害中）",
      data: { secretInfo: "internal-data" },
      _debug: {
        message: "Fail-Open: 認証サービスのエラー時にアクセスを許可してしまった",
      },
    });
  }
});

export default app;
