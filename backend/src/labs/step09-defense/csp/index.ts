import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// CSPの検証シミュレーション
app.post("/check-csp", async (c) => {
  const body = await c.req.json<{ csp: string; payload: string }>();
  const { csp, payload } = body;

  const violations: string[] = [];

  if (payload.includes("<script>") && !csp.includes("'unsafe-inline'")) {
    violations.push("インラインスクリプトがCSPによりブロックされます");
  }
  if (payload.includes("eval(") && !csp.includes("'unsafe-eval'")) {
    violations.push("eval()がCSPによりブロックされます");
  }
  if (payload.includes("src=") && csp.includes("script-src 'self'")) {
    violations.push("外部スクリプトの読み込みがCSPによりブロックされます");
  }

  return c.json({
    success: true,
    violations,
    blocked: violations.length > 0,
  });
});

export default app;
