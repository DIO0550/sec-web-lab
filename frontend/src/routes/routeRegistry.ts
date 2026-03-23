import type { ComponentType } from "react";

// Step01: Recon
import { HeaderLeakage } from "@/labs/step01-recon";
import { SensitiveFileExposure } from "@/labs/step01-recon";
import { ErrorMessageLeakage } from "@/labs/step01-recon";
import { DirectoryListing } from "@/labs/step01-recon";
import { HeaderExposure } from "@/labs/step01-recon";

// Step02: Injection
import { SqlInjection } from "@/labs/step02-injection";
import { Xss } from "@/labs/step02-injection";
import { CommandInjection } from "@/labs/step02-injection";
import { OpenRedirect } from "@/labs/step02-injection";

// Step03: Auth
import { PlaintextPassword } from "@/labs/step03-auth";
import { WeakHash } from "@/labs/step03-auth";
import { BruteForce } from "@/labs/step03-auth";
import { DefaultCredentials } from "@/labs/step03-auth";
import { WeakPasswordPolicy } from "@/labs/step03-auth";

// Step04: Session
import { CookieManipulation } from "@/labs/step04-session";
import { SessionFixation } from "@/labs/step04-session";
import { SessionHijacking } from "@/labs/step04-session";
import { Csrf } from "@/labs/step04-session";

// Step05: Access Control
import { Idor } from "@/labs/step05-access-control";
import { PathTraversal } from "@/labs/step05-access-control";
import { PrivilegeEscalation } from "@/labs/step05-access-control";
import { MassAssignment } from "@/labs/step05-access-control";

// Step06: Server-Side
import { Ssrf } from "@/labs/step06-server-side";
import { Xxe } from "@/labs/step06-server-side";
import { FileUpload } from "@/labs/step06-server-side";
import { CrlfInjection } from "@/labs/step06-server-side";
import { CorsMisconfiguration } from "@/labs/step06-server-side";
import { EvalInjection } from "@/labs/step06-server-side";

// Step07: Design & Logic
import { RateLimiting } from "@/labs/step07-design";
import { Clickjacking } from "@/labs/step07-design";
import { SensitiveDataHttp } from "@/labs/step07-design";
import { HttpMethods } from "@/labs/step07-design";
import { PasswordReset } from "@/labs/step07-design";
import { BusinessLogic } from "@/labs/step07-design";
import { UnsignedData } from "@/labs/step07-design";
import { SecurityHeaders } from "@/labs/step07-design";
import { CacheControl } from "@/labs/step07-design";
import { WebStorageAbuse } from "@/labs/step07-design";

// Step08: Advanced
import { JwtVulnerabilities } from "@/labs/step08-advanced";
import { Ssti } from "@/labs/step08-advanced";
import { RaceCondition } from "@/labs/step08-advanced";
import { Deserialization } from "@/labs/step08-advanced";
import { PrototypePollution } from "@/labs/step08-advanced";
import { Redos } from "@/labs/step08-advanced";
import { Postmessage } from "@/labs/step08-advanced";

// Step09: Defense
import { ErrorMessages } from "@/labs/step09-defense";
import { StackTrace } from "@/labs/step09-defense";
import { Logging } from "@/labs/step09-defense";
import { LogInjection } from "@/labs/step09-defense";
import { FailOpen } from "@/labs/step09-defense";
import { Csp } from "@/labs/step09-defense";
import { InputValidation } from "@/labs/step09-defense";

/** ラボ ID からコンポーネントへのマッピング */
export const ROUTE_REGISTRY: Record<string, ComponentType> = {
  // Step01
  "header-leakage": HeaderLeakage,
  "sensitive-file-exposure": SensitiveFileExposure,
  "error-message-leakage": ErrorMessageLeakage,
  "directory-listing": DirectoryListing,
  "header-exposure": HeaderExposure,
  // Step02
  "sql-injection": SqlInjection,
  "xss": Xss,
  "command-injection": CommandInjection,
  "open-redirect": OpenRedirect,
  // Step03
  "plaintext-password": PlaintextPassword,
  "weak-hash": WeakHash,
  "brute-force": BruteForce,
  "default-credentials": DefaultCredentials,
  "weak-password-policy": WeakPasswordPolicy,
  // Step04
  "cookie-manipulation": CookieManipulation,
  "session-fixation": SessionFixation,
  "session-hijacking": SessionHijacking,
  "csrf": Csrf,
  // Step05
  "idor": Idor,
  "path-traversal": PathTraversal,
  "privilege-escalation": PrivilegeEscalation,
  "mass-assignment": MassAssignment,
  // Step06
  "ssrf": Ssrf,
  "xxe": Xxe,
  "file-upload": FileUpload,
  "crlf-injection": CrlfInjection,
  "cors-misconfiguration": CorsMisconfiguration,
  "eval-injection": EvalInjection,
  // Step07
  "rate-limiting": RateLimiting,
  "clickjacking": Clickjacking,
  "sensitive-data-http": SensitiveDataHttp,
  "http-methods": HttpMethods,
  "password-reset": PasswordReset,
  "business-logic": BusinessLogic,
  "unsigned-data": UnsignedData,
  "security-headers": SecurityHeaders,
  "cache-control": CacheControl,
  "web-storage-abuse": WebStorageAbuse,
  // Step08
  "jwt-vulnerabilities": JwtVulnerabilities,
  "ssti": Ssti,
  "race-condition": RaceCondition,
  "deserialization": Deserialization,
  "prototype-pollution": PrototypePollution,
  "redos": Redos,
  "postmessage": Postmessage,
  // Step09
  "error-messages": ErrorMessages,
  "stack-trace": StackTrace,
  "logging": Logging,
  "log-injection": LogInjection,
  "fail-open": FailOpen,
  "csp": Csp,
  "input-validation": InputValidation,
};
