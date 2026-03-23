import { Hono } from "hono";
import step01 from "./step01.js";
import step02 from "./step02.js";
import step03 from "./step03.js";
import step04 from "./step04.js";
import step05 from "./step05.js";
import step06 from "./step06.js";
import step07 from "./step07.js";
import step08 from "./step08.js";
import step09 from "./step09.js";
import { labCatalogueHandler } from "../data/lab-catalogue.js";

const routes = new Hono();

// 各ステップのラボルートを登録
routes.route("/labs", step01);
routes.route("/labs", step02);
routes.route("/labs", step03);
routes.route("/labs", step04);
routes.route("/labs", step05);
routes.route("/labs", step06);
routes.route("/labs", step07);
routes.route("/labs", step08);
routes.route("/labs", step09);

// ラボ一覧API
routes.get("/labs", labCatalogueHandler);

export default routes;
