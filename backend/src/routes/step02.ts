import { Hono } from "hono";
import sqlInjection from "../labs/step02-injection/sql-injection/index.js";
import xss from "../labs/step02-injection/xss/index.js";
import commandInjection from "../labs/step02-injection/command-injection/index.js";
import openRedirect from "../labs/step02-injection/open-redirect/index.js";
import csvInjection from "../labs/step02-injection/csv-injection/index.js";
import hpp from "../labs/step02-injection/hpp/index.js";
import mailHeaderInjection from "../labs/step02-injection/mail-header-injection/index.js";

const step02 = new Hono();
step02.route("/sql-injection", sqlInjection);
step02.route("/xss", xss);
step02.route("/command-injection", commandInjection);
step02.route("/open-redirect", openRedirect);
step02.route("/csv-injection", csvInjection);
step02.route("/hpp", hpp);
step02.route("/mail-header-injection", mailHeaderInjection);

export default step02;
