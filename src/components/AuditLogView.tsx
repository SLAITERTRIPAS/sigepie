import React, { useState, useEffect } from "react";
import { firestoreService } from "../lib/firestoreService";
import { isChefeUser, isInstitutionalAdminUser } from "../lib/auth";

export const AuditLogView: React.FC<{ user: any }> = ({ user }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apenas chefes hierárquicos e planificadores podem ver
  const canViewAudit = isChefeUser(user) || isInstitutionalAdminUser(user);

  useEffect(() => {
    if (!canViewAudit) return;

    const unsubscribe = firestoreService.audit_logs.subscribe((data) => {
      setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [canViewAudit]);

  if (!canViewAudit) {
    return <div className="p-4 text-red-500">Acesso negado. Apenas chefes hierárquicos ou planificadores podem aceder aos logs de auditoria.</div>;
  }

  if (loading) return <div>Carregando logs...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Registo de Auditoria</h2>
      <table className="min-w-full bg-white border border-slate-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Data</th>
            <th className="py-2 px-4 border-b">Utilizador</th>
            <th className="py-2 px-4 border-b">Ação</th>
            <th className="py-2 px-4 border-b">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.uid}>
              <td className="py-2 px-4 border-b">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{log.userName}</td>
              <td className="py-2 px-4 border-b">{log.action}</td>
              <td className="py-2 px-4 border-b">{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
