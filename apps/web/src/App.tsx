import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { CursorSpotlight } from "@/components/layout/CursorSpotlight";
import { PageTransition } from "@/components/layout/PageTransition";
import { Landing } from "@/pages/Landing";
import { LoginPage } from "@/pages/LoginPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { useSession } from "@/lib/auth-client";

/** Session шалгаад нэвтрээгүй бол /login руу шилжүүлнэ. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

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
          path="/login"
          element={
            <PageTransition variant="landing">
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/workspace"
          element={
            <PageTransition variant="workspace">
              <RequireAuth>
                <WorkspacePage />
              </RequireAuth>
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
