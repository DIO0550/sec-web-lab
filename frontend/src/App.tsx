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

export function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto", padding: 20 }}>
        <header>
          <h1>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              sec-web-lab
            </Link>
          </h1>
          <p>Web Security Hands-on Laboratory</p>
          <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to="/">Home</Link>
            <span style={{ color: "#ccc" }}>|</span>
            <Link to="/step01">Step01: Recon</Link>
            <span style={{ color: "#ccc" }}>|</span>
            <Link to="/step02">Step02: Injection</Link>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
