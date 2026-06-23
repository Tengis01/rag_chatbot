import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";

import { CursorSpotlight } from "@/components/layout/CursorSpotlight";
import { PageTransition } from "@/components/layout/PageTransition";
import { Landing } from "@/pages/Landing";
import { WorkspacePage } from "@/pages/WorkspacePage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition variant="landing">
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/workspace"
          element={
            <PageTransition variant="workspace">
              <WorkspacePage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <CursorSpotlight />
      <AnimatedRoutes />
    </>
  );
}

export default App;
