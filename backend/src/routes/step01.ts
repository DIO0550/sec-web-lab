import { Hono } from "hono";
import headerLeakage from "../labs/step01-recon/header-leakage/index.js";
import sensitiveFileExposure from "../labs/step01-recon/sensitive-file-exposure/index.js";
import errorMessageLeakage from "../labs/step01-recon/error-message-leakage/index.js";
import directoryListing from "../labs/step01-recon/directory-listing/index.js";
import headerExposure from "../labs/step01-recon/header-exposure/index.js";

const step01 = new Hono();
step01.route("/header-leakage", headerLeakage);
step01.route("/sensitive-file-exposure", sensitiveFileExposure);
step01.route("/error-message-leakage", errorMessageLeakage);
step01.route("/directory-listing", directoryListing);
step01.route("/header-exposure", headerExposure);

export default step01;
