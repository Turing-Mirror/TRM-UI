import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, ErrorBoundary } from "./trm";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* ErrorBoundary 在 Provider 外面：连语言都没起来的时候它也得能画。 */}
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
