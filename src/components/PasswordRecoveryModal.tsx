/**
 * Modal de Recuperação de Senha por Validação de Identidade Dinâmica do SIGEP
 * 
 * Fluxo Obrigatório:
 * 1. Informar Utilizador (E-mail ou NUIT)
 * 2. SIGEP localiza o registo institucional
 * 3. Gerar 3 perguntas aleatórias baseadas nos dados reais do perfil (NUIT, Telefone, Data de Nascimento, BI, Nome, Nome da Mãe, etc.)
 * 4. Validar respostas introduzidas pelo utilizador
 * 5. Permitir redefinir a senha da conta com segurança máxima, OTP e auditoria
 */

import React, { useState } from "react";
import { Shield, Key, Mail, CheckCircle2, AlertCircle, X, Lock, User, HelpCircle } from "lucide-react";
import { authRecoveryService } from "../lib/authRecoveryService";
import { EFETIVO_GERAL_DATA } from "../constants/colaboradoresList";
import { normalize as n, safeJSONParse } from "../lib/utils";
import { logAuditEvent } from "../lib/auditService";

interface PasswordRecoveryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"lookup" | "dynamic_questions" | "otp_verification" | "new_password">("lookup");
  
  const [userInput, setUserInput] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  
  // Perguntas dinâmicas geradas
  const [questions, setQuestions] = useState<Array<{ key: string; question: string; correctAnswer: string }>>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [otpInput, setOtpInput] = useState("");
  const [otpHint, setOtpHint] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Passo 1: Localizar utilizador
  const handleLookupUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!userInput.trim()) {
      setErrorMsg("Por favor, introduza o seu e-mail, NUIT ou ID de utilizador.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const normInput = n(userInput);
      let userRecord: any = null;

      // 1. Verificar Super Admin Slaiter
      if (normInput.includes("slaitertripas") || normInput === "st849547771" || normInput === "slaiter") {
        userRecord = {
          email: "slaitertripas@gmail.com",
          nome: "SLAITER TRIPAS",
          nuit: "123456789",
          telefone: "+258 84 954 7771",
          dataNascimento: "1990-01-01",
          documento: "110100123456A",
          mae: "Maria Tripas",
          id: "ST849547771",
          password: "231383ft"
        };
      } else {
        // 2. Procurar no cache local
        try {
          const cache = safeJSONParse<any[]>(localStorage.getItem("sigep_users_cache"), []);
          userRecord = cache.find((u: any) => 
            (u.email && n(u.email) === normInput) ||
            (u.nuit && n(u.nuit) === normInput) ||
            (u.id && n(String(u.id)) === normInput)
          );
        } catch (e) {}

        // 3. Procurar na lista estática EFETIVO_GERAL_DATA
        if (!userRecord) {
          const foundCol = EFETIVO_GERAL_DATA.find((c: any) =>
            (c.email && n(c.email) === normInput) ||
            (c.nuit && n(c.nuit) === normInput)
          );
          if (foundCol) {
            userRecord = {
              ...foundCol,
              email: foundCol.email || `${n(foundCol.nome || "user")}@songo.ac.mz`,
              telefone: foundCol.telefone || "+258820000000",
              dataNascimento: foundCol.dataNascimento || "1985-05-15",
              documento: (foundCol as any).numeroBI || "110200000000B",
              mae: (foundCol as any).filiacaoMae || "Mãe Institucional",
              password: (foundCol as any).password || "sigep2026"
            };
          }
        }
      }

      if (!userRecord) {
        setErrorMsg("Registo institucional não encontrado com os dados fornecidos.");
        return;
      }

      setFoundUser(userRecord);

      // Gerar perguntas dinâmicas baseadas nos dados do utilizador
      const possibleQuestions = [];
      if (userRecord.nuit) {
        possibleQuestions.push({ key: "nuit", question: "Qual é o seu NUIT (Número Único de Identificação Tributária)?", correctAnswer: String(userRecord.nuit).trim() });
      }
      if (userRecord.telefone || userRecord.phone) {
        possibleQuestions.push({ key: "telefone", question: "Qual é o seu número de telefone institucional/pessoal?", correctAnswer: String(userRecord.telefone || userRecord.phone).trim() });
      }
      if (userRecord.dataNascimento) {
        possibleQuestions.push({ key: "dataNascimento", question: "Qual é a sua data de nascimento (AAAA-MM-DD)?", correctAnswer: String(userRecord.dataNascimento).trim() });
      }
      if (userRecord.documento || userRecord.bi) {
        possibleQuestions.push({ key: "documento", question: "Qual é o seu número de documento de identificação (BI/Passaporte)?", correctAnswer: String(userRecord.documento || userRecord.bi).trim() });
      }
      if (userRecord.nome || userRecord.name) {
        possibleQuestions.push({ key: "nome", question: "Qual é o seu nome completo registado?", correctAnswer: String(userRecord.nome || userRecord.name).trim() });
      }
      if (userRecord.mae) {
        possibleQuestions.push({ key: "mae", question: "Qual é o nome completo da sua mãe?", correctAnswer: String(userRecord.mae).trim() });
      }

      // Selecionar aleatoriamente até 3 perguntas
      const shuffled = [...possibleQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      if (selected.length === 0) {
        // Fallback seguro se faltarem dados
        selected.push({ key: "nome", question: "Qual é o seu nome completo?", correctAnswer: String(userRecord.nome || userRecord.name || "Utilizador").trim() });
      }

      setQuestions(selected);
      setSuccessMsg("Registo institucional localizado com sucesso. Responda às questões de validação de identidade.");
      setStep("dynamic_questions");
    }, 600);
  };

  // Passo 2: Validar respostas às perguntas dinâmicas
  const handleValidateQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Verificar cada resposta
    for (const q of questions) {
      const userAns = (answers[q.key] || "").trim();
      const expectedAns = String(q.correctAnswer).trim();
      if (!userAns || n(userAns) !== n(expectedAns)) {
        setErrorMsg(`A resposta à questão "${q.question}" está incorreta. Verifique os dados introduzidos.`);
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Iniciar OTP de confirmação final
      const emailTarget = foundUser?.email || "utilizador@songo.ac.mz";
      const otpRes = authRecoveryService.initiateRecovery(emailTarget, "account_password");
      if (otpRes.success) {
        setOtpHint(otpRes.otpCode);
        setSuccessMsg("Identidade validada com sucesso! Código OTP de confirmação enviado para o seu e-mail.");
        setStep("otp_verification");
      } else {
        setErrorMsg("Erro ao gerar código OTP de confirmação.");
      }
    }, 600);
  };

  // Passo 3: Validar OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const emailTarget = foundUser?.email || "";
    const isValid = authRecoveryService.verifyOtp(emailTarget, otpInput, "account_password");
    if (!isValid) {
      setErrorMsg("Código OTP inválido ou expirado. Tente novamente.");
      return;
    }

    setSuccessMsg("Código OTP validado com sucesso! Introduza a sua nova senha de acesso.");
    setStep("new_password");
  };

  // Passo 4: Definir Nova Senha
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas introduzidas não coincidem.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Atualizar no cache local e localStorage
      try {
        const cache = safeJSONParse<any[]>(localStorage.getItem("sigep_users_cache"), []);
        const emailNorm = (foundUser.email || "").toLowerCase().trim();
        const updatedCache = cache.map((u: any) => {
          if ((u.email || "").toLowerCase().trim() === emailNorm || u.id === foundUser.id) {
            return { ...u, password: newPassword, mustChangePassword: false, senhaPadraoBloqueada: true };
          }
          return u;
        });

        if (!updatedCache.some((u: any) => (u.email || "").toLowerCase().trim() === emailNorm)) {
          updatedCache.push({ ...foundUser, password: newPassword, mustChangePassword: false, senhaPadraoBloqueada: true });
        }
        localStorage.setItem("sigep_users_cache", JSON.stringify(updatedCache));

        // Se for o Super Admin
        if (foundUser.id === "ST849547771" || foundUser.email === "slaitertripas@gmail.com") {
          localStorage.setItem("sigep_admin_password", newPassword);
        }

        logAuditEvent({
          entityId: foundUser.id || foundUser.email,
          entityType: "auth_recovery",
          action: "modify",
          timestamp: new Date().toISOString(),
          userId: foundUser.email,
          userName: foundUser.nome || foundUser.name,
          details: `Senha de acesso redefinida com sucesso através do sistema de validação dinâmica de identidade.`,
        });

        setSuccessMsg("Senha de acesso redefinida com sucesso! Pode efetuar login com a nova senha.");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } catch (err) {
        setErrorMsg("Erro ao salvar a nova senha.");
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 backdrop-blur-sm">
            <HelpCircle className="text-amber-400" size={26} />
          </div>
          <h2 className="text-xl font-black">Recuperação de Senha por Validação de Identidade</h2>
          <p className="text-xs text-blue-100 mt-1">
            Sistema seguro do SIGEP baseado em dados institucionais e perguntas dinâmicas
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

          {/* Passo 1: Informar Utilizador */}
          {step === "lookup" && (
            <form onSubmit={handleLookupUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  E-mail, NUIT ou ID de Utilizador
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ex: seu.email@songo.ac.mz ou NUIT"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Introduza os dados associados ao seu perfil institucional no SIGEP para iniciar a validação dinâmica de identidade.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-900/20 cursor-pointer flex items-center gap-2"
                >
                  {loading ? "A localizar..." : "Continuar"}
                </button>
              </div>
            </form>
          )}

          {/* Passo 2: Perguntas Dinâmicas */}
          {step === "dynamic_questions" && (
            <form onSubmit={handleValidateQuestions} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-900 mb-2">
                <p className="font-bold mb-1">Validação de Identidade por Dados do Perfil:</p>
                <p className="text-[11px] text-blue-800">Para garantir a segurança, responda corretamente às seguintes questões aleatórias geradas a partir do seu registo institucional:</p>
              </div>

              {questions.map((q, idx) => (
                <div key={q.key} className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    {idx + 1}. {q.question}
                  </label>
                  <input
                    type="text"
                    required
                    value={answers[q.key] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                    placeholder="Introduza a resposta exata..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep("lookup")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-900/20 cursor-pointer flex items-center gap-2"
                >
                  {loading ? "A validar..." : "Validar Respostas"}
                </button>
              </div>
            </form>
          )}

          {/* Passo 3: Verificação OTP */}
          {step === "otp_verification" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-amber-900 mb-1">Confirmação por Código OTP:</p>
                <p className="text-xs text-amber-800">
                  Enviamos um código de verificação de 6 dígitos para o e-mail: <span className="font-bold">{foundUser?.email}</span>.
                </p>
                {otpHint && (
                  <div className="mt-2 p-2 bg-amber-100 rounded text-[11px] font-mono text-amber-900">
                    [Modo de Teste Assistido] Código OTP gerado: <span className="font-bold">{otpHint}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Código OTP (6 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-900/20 cursor-pointer"
                >
                  Confirmar Código OTP
                </button>
              </div>
            </form>
          )}

          {/* Passo 4: Nova Senha */}
          {step === "new_password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Nova Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-700/20 cursor-pointer"
                >
                  {loading ? "A guardar..." : "Redefinir Senha Definitivamente"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
