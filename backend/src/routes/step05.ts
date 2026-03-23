import { Hono } from "hono";
import idor from "../labs/step05-access-control/idor/index.js";
import pathTraversal from "../labs/step05-access-control/path-traversal/index.js";
import privilegeEscalation from "../labs/step05-access-control/privilege-escalation/index.js";
import massAssignment from "../labs/step05-access-control/mass-assignment/index.js";

const step05 = new Hono();
step05.route("/idor", idor);
step05.route("/path-traversal", pathTraversal);
step05.route("/privilege-escalation", privilegeEscalation);
step05.route("/mass-assignment", massAssignment);

export default step05;
