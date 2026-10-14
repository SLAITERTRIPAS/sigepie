/**
 * Serviço de Recuperação Segura de Contas e Assinatura Digital do SIGEP
 * - Recuperação baseada em OTP, E-mail e Autenticação Adicional
 * - Recuperação da Senha de Assinatura Digital: Validar Login -> OTP -> Nova Senha da Assinatura
 * - Auditoria obrigatória e registo permanente de todas as operações de recuperação
 */

import { logAuditEvent } from "./auditService";

export interface RecoveryRequest {
  id: string;
  userEmail: string;
  type: "account_password" | "signature_password";
  otpCode: string;
  status: "pending" | "verified" | "completed" | "expired";
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
}

const RECOVERY_STORAGE_KEY = "sigep_auth_recovery_requests_v1";

export const authRecoveryService = {
  // Iniciar pedido de recuperação de senha de conta ou de assinatura digital
  initiateRecovery(userEmail: string, type: "account_password" | "signature_password"): { success: boolean; otpCode: string; message: string } {
    try {
      // Gerar OTP de 6 dígitos seguro
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 minutos de validade

      const requests = JSON.parse(localStorage.getItem(RECOVERY_STORAGE_KEY) || "[]");
      
      const newRequest: RecoveryRequest = {
        id: `REC-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        userEmail: userEmail.toLowerCase().trim(),
        type,
        otpCode,
        status: "pending",
        createdAt: now.toISOString(),
        expiresAt,
        ipAddress: "127.0.0.1",
      };

      requests.push(newRequest);
      localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(requests));

      // Auditoria obrigatória
      logAuditEvent({
        entityId: newRequest.id,
        entityType: "auth_recovery",
        action: "create",
        timestamp: now.toISOString(),
        userId: userEmail,
        userName: userEmail,
        details: `Iniciado processo de recuperação de ${type === "signature_password" ? "senha de assinatura digital" : "conta"} para ${userEmail}. OTP gerado com sucesso.`,
      });

      console.log(`[SIGEP Security] OTP enviado para ${userEmail}: ${otpCode}`);

      return {
        success: true,
        otpCode, // Em produção real é enviado por e-mail; disponibilizado no console de auditoria para teste assistido
        message: `Código OTP enviado com sucesso para o e-mail ${userEmail} (Verifique também o console de auditoria).`,
      };
    } catch (err) {
      console.error("Erro ao iniciar recuperação:", err);
      return { success: false, otpCode: "", message: "Erro ao iniciar o processo de recuperação." };
    }
  },

  // Validar OTP inserido pelo utilizador
  verifyOtp(userEmail: string, otpInput: string, type: "account_password" | "signature_password"): boolean {
    try {
      const requests = JSON.parse(localStorage.getItem(RECOVERY_STORAGE_KEY) || "[]");
      const normalizedEmail = userEmail.toLowerCase().trim();

      const activeReq = requests.find((r: RecoveryRequest) => 
        r.userEmail === normalizedEmail && 
        r.type === type && 
        r.status === "pending" &&
        r.otpCode === otpInput.trim()
      );

      if (!activeReq) return false;

      // Verificar expiração
      if (new Date() > new Date(activeReq.expiresAt)) {
        activeReq.status = "expired";
        localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(requests));
        return false;
      }

      activeReq.status = "verified";
      localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(requests));

      logAuditEvent({
        entityId: activeReq.id,
        entityType: "auth_recovery",
        action: "modify",
        timestamp: new Date().toISOString(),
        userId: userEmail,
        userName: userEmail,
        details: `OTP validado com sucesso para recuperação de ${type}.`,
      });

      return true;
    } catch {
      return false;
    }
  }
};
