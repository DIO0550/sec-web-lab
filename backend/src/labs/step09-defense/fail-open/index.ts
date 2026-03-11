import { Hono } from "hono";
import { authServiceDown, setAuthServiceDown } from "./shared.js";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// 認証サービスの状態制御
app.post("/toggle-auth-service", (c) => {
  setAuthServiceDown(!authServiceDown);
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
  setAuthServiceDown(false);
  return c.json({ message: "リセットしました" });
});

export default app;
