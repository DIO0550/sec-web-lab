import { Hono } from "hono";
import errorMessages from "../labs/step09-defense/error-messages/index.js";
import stackTrace from "../labs/step09-defense/stack-trace/index.js";
import logging from "../labs/step09-defense/logging/index.js";
import logInjection from "../labs/step09-defense/log-injection/index.js";
import failOpen from "../labs/step09-defense/fail-open/index.js";
import csp from "../labs/step09-defense/csp/index.js";
import inputValidation from "../labs/step09-defense/input-validation/index.js";

const step09 = new Hono();
step09.route("/error-messages", errorMessages);
step09.route("/stack-trace", stackTrace);
step09.route("/logging", logging);
step09.route("/log-injection", logInjection);
step09.route("/fail-open", failOpen);
step09.route("/csp", csp);
step09.route("/input-validation", inputValidation);

export default step09;
