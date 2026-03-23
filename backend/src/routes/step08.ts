import { Hono } from "hono";
import jwtVulnerabilities from "../labs/step08-advanced/jwt-vulnerabilities/index.js";
import ssti from "../labs/step08-advanced/ssti/index.js";
import raceCondition from "../labs/step08-advanced/race-condition/index.js";
import deserialization from "../labs/step08-advanced/deserialization/index.js";
import prototypePollution from "../labs/step08-advanced/prototype-pollution/index.js";
import redos from "../labs/step08-advanced/redos/index.js";
import postmessage from "../labs/step08-advanced/postmessage/index.js";
import unicodeNormalization from "../labs/step08-advanced/unicode-normalization/index.js";

const step08 = new Hono();
step08.route("/jwt-vulnerabilities", jwtVulnerabilities);
step08.route("/ssti", ssti);
step08.route("/race-condition", raceCondition);
step08.route("/deserialization", deserialization);
step08.route("/prototype-pollution", prototypePollution);
step08.route("/redos", redos);
step08.route("/postmessage", postmessage);
step08.route("/unicode-normalization", unicodeNormalization);

export default step08;
