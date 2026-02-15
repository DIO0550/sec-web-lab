import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { HeaderLeakage } from "./pages/HeaderLeakage";
import { SensitiveFileExposure } from "./pages/SensitiveFileExposure";
import { ErrorMessageLeakage } from "./pages/ErrorMessageLeakage";
import { DirectoryListing } from "./pages/DirectoryListing";
import { HeaderExposure } from "./pages/HeaderExposure";

export function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto", padding: 20 }}>
        <header>
          <h1>sec-web-lab</h1>
          <p>Web Security Hands-on Laboratory</p>
          <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to="/">Home</Link>
            <span style={{ color: "#ccc" }}>|</span>
            <Link to="/labs/header-leakage">Header Leakage</Link>
            <Link to="/labs/sensitive-file-exposure">Sensitive File</Link>
            <Link to="/labs/error-message-leakage">Error Message</Link>
            <Link to="/labs/directory-listing">Dir Listing</Link>
            <Link to="/labs/header-exposure">Header Exposure</Link>
          </nav>
          <hr />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/labs/header-leakage" element={<HeaderLeakage />} />
            <Route path="/labs/sensitive-file-exposure" element={<SensitiveFileExposure />} />
            <Route path="/labs/error-message-leakage" element={<ErrorMessageLeakage />} />
            <Route path="/labs/directory-listing" element={<DirectoryListing />} />
            <Route path="/labs/header-exposure" element={<HeaderExposure />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
