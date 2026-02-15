import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";

// Step01: Recon（偵察フェーズ）
import { Step01Index } from "./pages/step01/index";
import { HeaderLeakage } from "./pages/step01/HeaderLeakage";
import { SensitiveFileExposure } from "./pages/step01/SensitiveFileExposure";
import { ErrorMessageLeakage } from "./pages/step01/ErrorMessageLeakage";
import { DirectoryListing } from "./pages/step01/DirectoryListing";
import { HeaderExposure } from "./pages/step01/HeaderExposure";

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
