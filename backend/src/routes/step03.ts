import { Hono } from "hono";
import plaintextPassword from "../labs/step03-auth/plaintext-password/index.js";
import weakHash from "../labs/step03-auth/weak-hash/index.js";
import bruteForce from "../labs/step03-auth/brute-force/index.js";
import defaultCredentials from "../labs/step03-auth/default-credentials/index.js";
import weakPasswordPolicy from "../labs/step03-auth/weak-password-policy/index.js";
import usernameEnumeration from "../labs/step03-auth/username-enumeration/index.js";

const step03 = new Hono();
step03.route("/plaintext-password", plaintextPassword);
step03.route("/weak-hash", weakHash);
step03.route("/brute-force", bruteForce);
step03.route("/default-credentials", defaultCredentials);
step03.route("/weak-password-policy", weakPasswordPolicy);
step03.route("/username-enumeration", usernameEnumeration);

export default step03;
