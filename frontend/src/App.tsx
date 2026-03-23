import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import { StepIndexPage } from "@/components/StepIndexPage";
import { Home } from "@/pages/Home";
import { NAVIGATION } from "@/data/navigation";
import { ROUTE_REGISTRY } from "@/routes/routeRegistry";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* 全ステップ共通のインデックスページ */}
            <Route path="/:stepId" element={<StepIndexPage />} />

            {/* 各ラボのルートをデータから動的生成 */}
            {NAVIGATION.flatMap((step) =>
              step.labs.map((lab) => {
                const Component = ROUTE_REGISTRY[lab.id];
                if (!Component) return null;
                return (
                  <Route
                    key={lab.id}
                    path={lab.path}
                    element={<Component />}
                  />
                );
              })
            )}

            {/* 不正なルートはホームにリダイレクト */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
}
