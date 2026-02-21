import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Prototype Pollution
// Object.assign()等によるプロトタイプ汚染
// ========================================

// --- 脆弱バージョン ---

// ⚠️ 深いマージでプロトタイプ汚染が可能
function vulnerableMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    // ⚠️ __proto__ や constructor.prototype 経由でオブジェクトのプロトタイプを汚染できる
    if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
      if (!(key in target)) {
        target[key] = {};
      }
      vulnerableMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

app.post("/vulnerable/merge", async (c) => {
  const body = await c.req.json();

  // ⚠️ ユーザー入力をそのままマージ
  const config: Record<string, unknown> = { theme: "light", lang: "ja" };
  vulnerableMerge(config, body);

  // プロトタイプ汚染の確認
  const emptyObj: Record<string, unknown> = {};
  const polluted = (emptyObj as Record<string, unknown>)["isAdmin"];

  return c.json({
    success: true,
    config,
    _debug: {
      message: "__proto__ 経由でプロトタイプを汚染可能",
      prototypeCheck: {
        isAdmin: polluted,
        polluted: polluted !== undefined,
      },
      hint: '{"__proto__": {"isAdmin": true}} を送信してみてください',
    },
  });
});

// ⚠️ プロトタイプ汚染で権限チェックをバイパス
app.get("/vulnerable/admin", (c) => {
  const user: Record<string, unknown> = { name: "user1", role: "user" };

  // ⚠️ isAdmin がプロトタイプ汚染で true になっている場合
  if ((user as Record<string, unknown>)["isAdmin"]) {
    return c.json({
      success: true,
      message: "管理者ページにアクセスしました（プロトタイプ汚染）",
      _debug: { message: "Object.prototype.isAdmin が true に汚染されている" },
    });
  }

  return c.json({ success: false, message: "管理者権限が必要です" }, 403);
});

// --- 安全バージョン ---

// ✅ 安全なマージ（__proto__, constructor, prototype を拒否）
function safeMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    // ✅ 危険なキーを拒否
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
      if (!(key in target)) {
        target[key] = {};
      }
      safeMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

app.post("/secure/merge", async (c) => {
  const body = await c.req.json();

  // ✅ Object.create(null) でプロトタイプなしオブジェクトを使用
  const config: Record<string, unknown> = Object.create(null);
  config.theme = "light";
  config.lang = "ja";

  safeMerge(config, body);

  return c.json({
    success: true,
    config,
  });
});

// リセット（プロトタイプの汚染を解除）
app.post("/reset", (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (Object.prototype as any).isAdmin;
  return c.json({ message: "リセットしました" });
});

export default app;
