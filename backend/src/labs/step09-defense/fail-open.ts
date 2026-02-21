import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Fail-Open
// 認証・認可処理の失敗時に許可してしまう
// ========================================

// 認証サービスのシミュレーション（時々エラーを返す）
let authServiceDown = false;

function simulateAuthService(token: string): { valid: boolean; role: string } | null {
  if (authServiceDown) {
    throw new Error("Authentication service unavailable");
  }
  if (token === "valid-admin-token") return { valid: true, role: "admin" };
  if (token === "valid-user-token") return { valid: true, role: "user" };
  return null;
}

// --- 脆弱バージョン ---

// ⚠️ 認証サービスのエラー時にアクセスを許可（Fail-Open）
app.get("/vulnerable/admin", (c) => {
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

// --- 安全バージョン ---

// ✅ 認証サービスのエラー時にアクセスを拒否（Fail-Closed）
app.get("/secure/admin", (c) => {
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

// 認証サービスの状態制御
app.post("/toggle-auth-service", (c) => {
  authServiceDown = !authServiceDown;
  return c.json({
    authServiceDown,
    message: authServiceDown ? "認証サービスを停止しました" : "認証サービスを復旧しました",
  });
});

app.get("/auth-service-status", (c) => {
  return c.json({ authServiceDown });
});

// リセット
app.post("/reset", (c) => {
  authServiceDown = false;
  return c.json({ message: "リセットしました" });
});

export default app;
