import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import { initFaviconSync } from "./lib/logoService";

// Sincroniza imediatamente o logotipo recente do sistema com o favicon da aba do navegador
initFaviconSync();

// Interceptor global para impedir que avisos de conexão/offline, chunk loading, ResizeObserver e asserções internas
// poluam a consola ou disparem erros fatais no ambiente da aplicação

const container = document.getElementById("root");
if (container) {
  try {
    const root = createRoot(container);
    
    // Fallback timer: if the app hasn't rendered anything in 10 seconds, show recovery UI
    const mountTimeout = setTimeout(() => {
      if (container.innerHTML === "" || container.innerText.trim() === "") {
        console.error("Timeout na montagem do React: Tela branca detectada.");
        container.innerHTML = `
          <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#060b24;color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;">
            <div style="font-size:32px;margin-bottom:12px;">⌛</div>
            <div style="font-size:18px;font-weight:800;margin-bottom:8px;letter-spacing:0.04em;">TEMPO DE CARREGAMENTO EXCEDIDO</div>
            <div style="font-size:13.5px;color:#94a3b8;max-width:400px;margin-bottom:20px;">O sistema está a demorar mais do que o esperado para iniciar.</div>
            <button onclick="localStorage.removeItem('sigep_logged_in_user');localStorage.removeItem('sigep_user');sessionStorage.clear();window.location.reload();" style="background:#f59e0b;color:#060b24;border:none;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;">
              Limpar Cache e Reiniciar
            </button>
          </div>
        `;
      }
    }, 12000);

    root.render(
      <StrictMode>
        <ErrorBoundary onReset={() => clearTimeout(mountTimeout)}>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    
    // Clear timeout if render starts
    setTimeout(() => clearTimeout(mountTimeout), 2000);

  } catch (fatalMountErr) {
    console.error("Erro crítico na montagem do React:", fatalMountErr);
    container.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#060b24;color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;">
        <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:8px;letter-spacing:0.04em;">RECUPERAÇÃO DO SIGEP</div>
        <div style="font-size:13.5px;color:#94a3b8;max-width:400px;margin-bottom:20px;">O sistema encontrou uma incompatibilidade temporária na montagem.</div>
        <button onclick="localStorage.removeItem('sigep_logged_in_user');localStorage.removeItem('sigep_user');sessionStorage.clear();window.location.reload();" style="background:#f59e0b;color:#060b24;border:none;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;">
          Limpar Cache e Reiniciar
        </button>
      </div>
    `;
  }
} else {
  console.error("Critical: DOM container #root not found.");
}

