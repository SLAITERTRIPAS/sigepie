/**
 * Modal de Recuperação da Senha de Assinatura Digital do SIGEP
 * Fluxo Obrigatório:
 * 1. Validar Login (E-mail e Senha principal da conta)
 * 2. Envio e Validação de OTP por E-mail
 * 3. Definição de Nova Senha de Assinatura Digital
 */

import React, { useState } from "react";
import { Shield, Key, Mail, CheckCircle2, AlertCircle, X, Lock } from "lucide-react";
import { authRecoveryService } from "../lib/authRecoveryService";
import { signatureService } from "../lib/signatureService";

interface SignatureRecoveryModalProps {
  currentUser: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const SignatureRecoveryModal: React.FC<SignatureRecoveryModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"login_validation" | "otp_validation" | "new_password">(
    "login_validation"
  );

  const [email, setEmail] = useState(currentUser?.email || "");
  const [accountPassword, setAccountPassword] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtpHint, setGeneratedOtpHint] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Passo 1: Validar Login e Enviar OTP
  const handleValidateLoginAndSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (!email.trim()) {
        setErrorMsg("Por favor, introduza o seu e-mail.");
        return;
      }
      // Iniciar recuperação
      const result = authRecoveryService.initiateRecovery(email, "signature_password");
      if (result.success) {
        setGeneratedOtpHint(result.otpCode);
        setSuccessMsg(result.message);
        setStep("otp_validation");
      } else {
        setErrorMsg("Erro ao iniciar processo de recuperação.");
      }
    }, 600);
  };

  // Passo 2: Validar OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const isValid = authRecoveryService.verifyOtp(email, otpInput, "signature_password");
      if (isValid) {
        setSuccessMsg("Código OTP validado com sucesso! Introduza a nova senha de assinatura.");
        setStep("new_password");
      } else {
        setErrorMsg("Código OTP inválido ou expirado. Tente novamente.");
      }
    }, 600);
  };

  // Passo 3: Definir Nova Senha de Assinatura
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg("A nova senha de assinatura deve ter pelo menos 4 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas de assinatura não coincidem.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const userId = currentUser?.id || currentUser?.uid || email;
      const userName = currentUser?.name || currentUser?.nome || email;
      const cargo = currentUser?.cargo || currentUser?.cargoChefia || "Gestor";

      // Obter assinatura existente ou criar registo com nova senha
      const existingSig = signatureService.getUserSignature(userId);
      const signatureImg = existingSig?.signatureImg || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

      const saved = signatureService.saveUserSignature({
        userId,
        userName,
        cargo,
        instituicaoId: currentUser?.instituicaoId || "",
        signatureImg,
        signaturePassword: newPassword,
      });

      if (saved) {
        setSuccessMsg("Senha de Assinatura Digital redefinida com sucesso!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setErrorMsg("Erro ao guardar nova senha de assinatura.");
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 backdrop-blur-sm">
            <Shield className="text-amber-400" size={26} />
          </div>
          <h2 className="text-xl font-black">Recuperação de Assinatura Digital</h2>
          <p className="text-xs text-blue-100 mt-1">
            Política de Segurança e Auditoria Obrigatória do SIGEP
          </p>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Passo 1: Validar Login */}
          {step === "login_validation" && (
            <form onSubmit={handleValidateLoginAndSendOtp} className="space-y-4">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                Para recuperar a sua senha de assinatura digital, introduza o seu e-mail de acesso ao SIGEP para validação e envio do código OTP.
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">E-mail do Utilizador</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@songo.ac.mz"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Senha da Conta (Autenticação Adicional)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? "A processar..." : "Enviar Código OTP de Recuperação"}
              </button>
            </form>
          )}

          {/* Passo 2: Validar OTP */}
          {step === "otp_validation" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900 mb-1">Código OTP Enviado</p>
                Insira o código de 6 dígitos enviado para o seu e-mail.
                {generatedOtpHint && (
                  <div className="mt-2 text-[11px] font-mono font-bold text-blue-700 bg-white p-2 rounded border border-blue-200">
                    [Simulação de E-mail / Auditoria OTP]: <span className="text-red-600">{generatedOtpHint}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Código OTP (6 Dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "A validar..." : "Validar OTP e Continuar"}
              </button>
            </form>
          )}

          {/* Passo 3: Nova Senha */}
          {step === "new_password" && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                Autenticação bem-sucedida. Defina agora a sua nova senha de assinatura digital (independente da senha da conta).
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Nova Senha de Assinatura</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? "A guardar..." : "Guardar Nova Senha de Assinatura"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
