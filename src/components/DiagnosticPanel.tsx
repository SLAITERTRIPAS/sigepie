import React, { useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { X, Search, Database, Shield, Clock } from "lucide-react";
import { safeJSONStringify } from "../lib/utils";

export default function DiagnosticPanel({ onClose }: { onClose: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runDiagnostic = async () => {
    if (!identifier) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const usersRef = collection(db, "users");
      const colRef = collection(db, "colaboradores");
      
      const searchTerms = [identifier.toLowerCase().trim()];
      
      const queries = [
        query(usersRef, where("email", "==", searchTerms[0])),
        query(usersRef, where("nuit", "==", searchTerms[0])),
        query(colRef, where("email", "==", searchTerms[0])),
        query(colRef, where("nuit", "==", searchTerms[0])),
      ];

      const numeric = Number(identifier);
      if (!isNaN(numeric)) {
        queries.push(query(usersRef, where("nuit", "==", numeric)));
        queries.push(query(colRef, where("nuit", "==", numeric)));
      }

      const snapshots = await Promise.all(queries.map(q => getDocs(q)));
      
      const allDocs: any[] = [];
      snapshots.forEach((snap, idx) => {
        const source = idx < (queries.length / 2) ? "users" : "colaboradores";
        snap.forEach(d => {
          allDocs.push({
            id: d.id,
            source,
            ...d.data(),
            _ref: d.ref.path
          });
        });
      });

      // Filter duplicates by path
      const uniqueResults = allDocs.filter((v, i, a) => a.findIndex(t => t._ref === v._ref) === i);
      setResults(uniqueResults);
      
      if (uniqueResults.length === 0) {
        setError("Nenhum documento encontrado para este identificador.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao executar diagnóstico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTimestamp = (val: any) => {
    if (!val) return "N/A";
    if (val.seconds) return new Date(val.seconds * 1000).toLocaleString();
    return String(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[10000] flex flex-col p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Shield className="text-amber-500" size={32} />
          <div>
            <h1 className="text-white text-2xl font-bold">Painel de Diagnóstico de Autenticação</h1>
            <p className="text-slate-400 text-sm">Auditoria de documentos de utilizador e persistência de senhas</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex gap-2 mb-8 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runDiagnostic()}
            placeholder="Introduza Email ou NUIT para analisar..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="px-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? "A Analisar..." : "Analisar"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6">
        {results.map((res) => (
          <div key={res._ref} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-white/10 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Database className="text-blue-400" size={20} />
                <span className="text-white font-mono text-sm">{res._ref}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${res.source === "users" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {res.source}
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Estado da Senha</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Precisa Mudar?</span>
                      <span className={`text-xs font-bold ${res.mustChangePassword ? "text-red-400" : "text-emerald-400"}`}>
                        {res.mustChangePassword ? "SIM (mustChangePassword: true)" : "NÃO (mustChangePassword: false)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Padrão Bloqueada?</span>
                      <span className={`text-xs font-bold ${res.senhaPadraoBloqueada ? "text-emerald-400" : "text-amber-400"}`}>
                        {res.senhaPadraoBloqueada ? "SIM" : "NÃO"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Senha Atual (Texto):</span>
                      <span className="text-white font-mono text-xs">{res.password || "---"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Metadados de Sincronização</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs flex items-center gap-1"><Clock size={12} /> Atualizado em:</span>
                      <span className="text-white text-xs">{getTimestamp(res.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Auth UID:</span>
                      <span className="text-white font-mono text-[10px]">{res.authUid || "Nenhum vínculo"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Dados do Perfil</span>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm">{res.name || res.nome}</p>
                    <p className="text-slate-400 text-xs">{res.email}</p>
                    <p className="text-slate-500 text-[10px]">NUIT: {res.nuit}</p>
                  </div>
                </div>
              </div>
            </div>

            <details className="border-t border-white/5">
              <summary className="px-6 py-3 text-slate-500 text-xs cursor-pointer hover:bg-white/5 transition-colors font-bold uppercase tracking-widest">
                Ver JSON Completo
              </summary>
              <div className="p-6 bg-black/40">
                <pre className="text-amber-200/70 font-mono text-[11px] overflow-x-auto">
                  {safeJSONStringify(res, 2)}
                </pre>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
