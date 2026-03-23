import { Hono } from "hono";
import ssrf from "../labs/step06-server-side/ssrf/index.js";
import xxe from "../labs/step06-server-side/xxe/index.js";
import fileUpload from "../labs/step06-server-side/file-upload/index.js";
import crlfInjection from "../labs/step06-server-side/crlf-injection/index.js";
import corsMisconfiguration from "../labs/step06-server-side/cors-misconfiguration/index.js";
import evalInjection from "../labs/step06-server-side/eval-injection/index.js";
import ssrfBypass from "../labs/step06-server-side/ssrf-bypass/index.js";
import zipSlip from "../labs/step06-server-side/zip-slip/index.js";

const step06 = new Hono();
step06.route("/ssrf", ssrf);
step06.route("/xxe", xxe);
step06.route("/file-upload", fileUpload);
step06.route("/crlf-injection", crlfInjection);
step06.route("/cors-misconfiguration", corsMisconfiguration);
step06.route("/eval-injection", evalInjection);
step06.route("/ssrf-bypass", ssrfBypass);
step06.route("/zip-slip", zipSlip);

export default step06;
