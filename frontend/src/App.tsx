import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";

export function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto", padding: 20 }}>
        <header>
          <h1>sec-web-lab</h1>
          <p>Web Security Hands-on Laboratory</p>
          <nav>
            <Link to="/">Home</Link>
          </nav>
          <hr />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
