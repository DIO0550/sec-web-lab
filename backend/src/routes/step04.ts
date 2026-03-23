import { Hono } from "hono";
import cookieManipulation from "../labs/step04-session/cookie-manipulation/index.js";
import sessionFixation from "../labs/step04-session/session-fixation/index.js";
import sessionHijacking from "../labs/step04-session/session-hijacking/index.js";
import csrf from "../labs/step04-session/csrf/index.js";
import predictableSessionId from "../labs/step04-session/predictable-session-id/index.js";
import sessionExpiration from "../labs/step04-session/session-expiration/index.js";
import tokenReplay from "../labs/step04-session/token-replay/index.js";

const step04 = new Hono();
step04.route("/cookie-manipulation", cookieManipulation);
step04.route("/session-fixation", sessionFixation);
step04.route("/session-hijacking", sessionHijacking);
step04.route("/csrf", csrf);
step04.route("/predictable-session-id", predictableSessionId);
step04.route("/session-expiration", sessionExpiration);
step04.route("/token-replay", tokenReplay);

export default step04;
