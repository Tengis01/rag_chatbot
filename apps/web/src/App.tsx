import { useConfig } from "./context/ConfigContext.tsx";
import "./App.css";

function App() {
  const config = useConfig();

  return (
    <div className="app-shell">
      <h1>{config.appName}</h1>
      <p>
        Upload up to <strong>{config.maxUploadSizeMb} MB</strong> ·{" "}
        Supported: <strong>{config.supportedExtensions.join(", ")}</strong>
      </p>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        UI coming soon — backend is connected ✅
      </p>
    </div>
  );
}

export default App;
