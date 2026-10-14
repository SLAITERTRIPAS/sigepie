import { firestoreService } from "./firestoreService";

export interface AuditLogEntry {
  entityId: string;
  entityType: string;
  action: "submit" | "approve" | "modify" | "create";
  timestamp: string;
  userId: string;
  userName: string;
  details: string;
}

export const logAuditEvent = async (entry: AuditLogEntry) => {
  try {
    await firestoreService.audit_logs.add({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao registar log de auditoria:", error);
  }
};
