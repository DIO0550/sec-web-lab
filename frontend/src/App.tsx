import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import {
  Step01Index,
  HeaderLeakage,
  SensitiveFileExposure,
  ErrorMessageLeakage,
  DirectoryListing,
  HeaderExposure,
} from "./labs/step01-recon";
import {
  Step02Index,
  SqlInjection,
  Xss,
  CommandInjection,
  OpenRedirect,
} from "./labs/step02-injection";
import {
  Step03Index,
  PlaintextPassword,
  WeakHash,
  BruteForce,
  DefaultCredentials,
  WeakPasswordPolicy,
} from "./labs/step03-auth";
import {
  Step04Index,
  CookieManipulation,
  SessionFixation,
  SessionHijacking,
  Csrf,
} from "./labs/step04-session";
import {
  Step05Index,
  Idor,
  PathTraversal,
  PrivilegeEscalation,
  MassAssignment,
} from "./labs/step05-access-control";
import {
  Step06Index,
  Ssrf,
  Xxe,
  FileUpload,
  CrlfInjection,
  CorsMisconfiguration,
  EvalInjection,
} from "./labs/step06-server-side";
import {
  Step07Index,
  RateLimiting,
  Clickjacking,
  SensitiveDataHttp,
  HttpMethods,
  PasswordReset,
  BusinessLogic,
  UnsignedData,
  SecurityHeaders,
  CacheControl,
  WebStorageAbuse,
} from "./labs/step07-design";
import {
  Step08Index,
  JwtVulnerabilities,
  Ssti,
  RaceCondition,
  Deserialization,
  PrototypePollution,
  Redos,
  Postmessage,
} from "./labs/step08-advanced";
import {
  Step09Index,
  ErrorMessages,
  StackTrace,
  Logging,
  LogInjection,
  FailOpen,
  Csp,
  InputValidation,
} from "./labs/step09-defense";

export function App() {
  return (
    <BrowserRouter>
      <div className="font-sans max-w-[960px] mx-auto p-5">
        <header>
          <h1>
            <Link to="/" className="no-underline text-inherit">
              sec-web-lab
            </Link>
          </h1>
          <p>Web Security Hands-on Laboratory</p>
          <nav className="flex gap-4 flex-wrap">
            <Link to="/">Home</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step01">Step01</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step02">Step02</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step03">Step03</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step04">Step04</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step05">Step05</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step06">Step06</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step07">Step07</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step08">Step08</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step09">Step09</Link>
          </nav>
          <hr />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Step01: Recon（偵察フェーズ） */}
            <Route path="/step01" element={<Step01Index />} />
            <Route path="/step01/header-leakage" element={<HeaderLeakage />} />
            <Route path="/step01/sensitive-file-exposure" element={<SensitiveFileExposure />} />
            <Route path="/step01/error-message-leakage" element={<ErrorMessageLeakage />} />
            <Route path="/step01/directory-listing" element={<DirectoryListing />} />
            <Route path="/step01/header-exposure" element={<HeaderExposure />} />

            {/* Step02: Injection（インジェクション） */}
            <Route path="/step02" element={<Step02Index />} />
            <Route path="/step02/sql-injection" element={<SqlInjection />} />
            <Route path="/step02/xss" element={<Xss />} />
            <Route path="/step02/command-injection" element={<CommandInjection />} />
            <Route path="/step02/open-redirect" element={<OpenRedirect />} />

            {/* Step03: Auth（認証） */}
            <Route path="/step03" element={<Step03Index />} />
            <Route path="/step03/plaintext-password" element={<PlaintextPassword />} />
            <Route path="/step03/weak-hash" element={<WeakHash />} />
            <Route path="/step03/brute-force" element={<BruteForce />} />
            <Route path="/step03/default-credentials" element={<DefaultCredentials />} />
            <Route path="/step03/weak-password-policy" element={<WeakPasswordPolicy />} />

            {/* Step04: Session（セッション管理） */}
            <Route path="/step04" element={<Step04Index />} />
            <Route path="/step04/cookie-manipulation" element={<CookieManipulation />} />
            <Route path="/step04/session-fixation" element={<SessionFixation />} />
            <Route path="/step04/session-hijacking" element={<SessionHijacking />} />
            <Route path="/step04/csrf" element={<Csrf />} />

            {/* Step05: Access Control（アクセス制御） */}
            <Route path="/step05" element={<Step05Index />} />
            <Route path="/step05/idor" element={<Idor />} />
            <Route path="/step05/path-traversal" element={<PathTraversal />} />
            <Route path="/step05/privilege-escalation" element={<PrivilegeEscalation />} />
            <Route path="/step05/mass-assignment" element={<MassAssignment />} />

            {/* Step06: Server-Side Attacks（サーバーサイド攻撃） */}
            <Route path="/step06" element={<Step06Index />} />
            <Route path="/step06/ssrf" element={<Ssrf />} />
            <Route path="/step06/xxe" element={<Xxe />} />
            <Route path="/step06/file-upload" element={<FileUpload />} />
            <Route path="/step06/crlf-injection" element={<CrlfInjection />} />
            <Route path="/step06/cors-misconfiguration" element={<CorsMisconfiguration />} />
            <Route path="/step06/eval-injection" element={<EvalInjection />} />

            {/* Step07: Design & Logic（設計とロジックの問題） */}
            <Route path="/step07" element={<Step07Index />} />
            <Route path="/step07/rate-limiting" element={<RateLimiting />} />
            <Route path="/step07/clickjacking" element={<Clickjacking />} />
            <Route path="/step07/sensitive-data-http" element={<SensitiveDataHttp />} />
            <Route path="/step07/http-methods" element={<HttpMethods />} />
            <Route path="/step07/password-reset" element={<PasswordReset />} />
            <Route path="/step07/business-logic" element={<BusinessLogic />} />
            <Route path="/step07/unsigned-data" element={<UnsignedData />} />
            <Route path="/step07/security-headers" element={<SecurityHeaders />} />
            <Route path="/step07/cache-control" element={<CacheControl />} />
            <Route path="/step07/web-storage-abuse" element={<WebStorageAbuse />} />

            {/* Step08: Advanced Techniques（高度な攻撃テクニック） */}
            <Route path="/step08" element={<Step08Index />} />
            <Route path="/step08/jwt-vulnerabilities" element={<JwtVulnerabilities />} />
            <Route path="/step08/ssti" element={<Ssti />} />
            <Route path="/step08/race-condition" element={<RaceCondition />} />
            <Route path="/step08/deserialization" element={<Deserialization />} />
            <Route path="/step08/prototype-pollution" element={<PrototypePollution />} />
            <Route path="/step08/redos" element={<Redos />} />
            <Route path="/step08/postmessage" element={<Postmessage />} />

            {/* Step09: Defense（守りを固める） */}
            <Route path="/step09" element={<Step09Index />} />
            <Route path="/step09/error-messages" element={<ErrorMessages />} />
            <Route path="/step09/stack-trace" element={<StackTrace />} />
            <Route path="/step09/logging" element={<Logging />} />
            <Route path="/step09/log-injection" element={<LogInjection />} />
            <Route path="/step09/fail-open" element={<FailOpen />} />
            <Route path="/step09/csp" element={<Csp />} />
            <Route path="/step09/input-validation" element={<InputValidation />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
