import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";
import { ConfigProvider } from "./context/ConfigContext.tsx";
import { ToastProvider } from "./components/layout/ToastProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ConfigProvider>
  </StrictMode>,
);
