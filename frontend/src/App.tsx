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
            <Link to="/step01">Step01: Recon</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step02">Step02: Injection</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step03">Step03: Auth</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step04">Step04: Session</Link>
            <span className="text-[#ccc]">|</span>
            <Link to="/step05">Step05: Access Control</Link>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
