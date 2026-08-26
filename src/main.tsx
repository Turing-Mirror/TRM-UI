import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, ErrorBoundary, hostLocaleStore, logToHost } from "./trm";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* ErrorBoundary 在 Provider 外面：连语言都没起来的时候它也得能画。
        onError 把崩溃栈送进壳的日志，用户报障时带得走原因；没有壳时
        logToHost 是空操作，栈只进控制台。 */}
    <ErrorBoundary onError={logToHost}>
      {/* store 不传就是 localStorage。跑在壳里时换成 app_config.json，
          这样语言和别的设置存在同一个地方。 */}
      <I18nProvider store={hostLocaleStore}>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
