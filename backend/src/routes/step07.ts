import { Hono } from "hono";
import rateLimiting from "../labs/step07-design/rate-limiting/index.js";
import clickjacking from "../labs/step07-design/clickjacking/index.js";
import sensitiveDataHttp from "../labs/step07-design/sensitive-data-http/index.js";
import httpMethods from "../labs/step07-design/http-methods/index.js";
import passwordReset from "../labs/step07-design/password-reset/index.js";
import businessLogic from "../labs/step07-design/business-logic/index.js";
import unsignedData from "../labs/step07-design/unsigned-data/index.js";
import securityHeaders from "../labs/step07-design/security-headers/index.js";
import cacheControl from "../labs/step07-design/cache-control/index.js";
import webStorageAbuse from "../labs/step07-design/web-storage-abuse/index.js";
import hostHeaderInjection from "../labs/step07-design/host-header-injection/index.js";
import xffTrust from "../labs/step07-design/xff-trust/index.js";

const step07 = new Hono();
step07.route("/rate-limiting", rateLimiting);
step07.route("/clickjacking", clickjacking);
step07.route("/sensitive-data-http", sensitiveDataHttp);
step07.route("/http-methods", httpMethods);
step07.route("/password-reset", passwordReset);
step07.route("/business-logic", businessLogic);
step07.route("/unsigned-data", unsignedData);
step07.route("/security-headers", securityHeaders);
step07.route("/cache-control", cacheControl);
step07.route("/web-storage-abuse", webStorageAbuse);
step07.route("/host-header-injection", hostHeaderInjection);
step07.route("/xff-trust", xffTrust);

export default step07;
