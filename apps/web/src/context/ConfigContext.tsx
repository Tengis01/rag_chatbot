import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Shape of the config returned by GET /config
export interface AppConfig {
  appName: string;
  maxUploadSizeMb: number;
  supportedFileTypes: string[];
  maxPasteLength: number;
}

interface ConfigState {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigState>({
  config: null,
  loading: true,
  error: null,
});

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfigState>({
    config: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then((res) => {
        if (!res.ok) throw new Error(`/config returned ${res.status}`);
        return res.json() as Promise<AppConfig>;
      })
      .then((config) => setState({ config, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Тодорхойгүй алдаа";
        console.error("Failed to load app config:", message);
        setState({ config: null, loading: false, error: message });
      });
  }, []);

  if (state.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#888" }}>
        Ачаалж байна…
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#c00" }}>
        Backend сервертэй холбогдож чадсангүй: {state.error}
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={state}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook — use anywhere inside ConfigProvider
export function useConfig(): AppConfig {
  const { config } = useContext(ConfigContext);
  if (!config) throw new Error("useConfig must be used inside <ConfigProvider>");
  return config;
}
