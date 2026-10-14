/**
 * Componente DigitalSignatureManager em /src/modules/security/DigitalSignatureManager.tsx
 * Permite a gestão, upload, remoção automática de fundo de imagens de assinatura,
 * armazenamento e definição de senha de assinatura digital obrigatória no SIGEP.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Upload,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  FileSignature,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { signatureService } from "../../lib/signatureService";

interface DigitalSignatureManagerProps {
  currentUser: any;
  onSaved?: () => void;
}

export default function DigitalSignatureManager({
  currentUser,
  onSaved,
}: DigitalSignatureManagerProps) {
  const [signatureData, setSignatureData] = useState<any>(null);
  const [signatureImage, setSignatureImage] = useState<string>("");
  const [signaturePassword, setSignaturePassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = currentUser?.id || currentUser?.uid || currentUser?.email || "user_default";
  const userName = currentUser?.name || currentUser?.nome || "Utilizador SIGEP";
  const cargo = currentUser?.cargo || currentUser?.cargoChefia || "Gestor";

  useEffect(() => {
    loadExistingSignature();
  }, [userId]);

  const loadExistingSignature = () => {
    const existing = signatureService.getUserSignature(userId);
    if (existing) {
      setSignatureData(existing);
      setSignatureImage(existing.signatureImg || "");
    }
  };

  // Função para remoção automática de fundo branco / claro de imagens de assinatura carregadas
  const removeWhiteBackground = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Não foi possível processar o contexto gráfico."));
            return;
          }
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Algoritmo para tornar brancos/claros transparentes
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Se o pixel for muito claro (quase branco), torna-o transparente
            if (r > 200 && g > 200 && b > 200) {
              data[i + 3] = 0; // Alpha 0 (transparente)
            }
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");
    setIsProcessingBg(true);

    try {
      const processedDataUrl = await removeWhiteBackground(file);
      setSignatureImage(processedDataUrl);
      setSuccessMsg("Fundo removido automaticamente com sucesso!");
    } catch (err: any) {
      setErrorMsg("Erro ao processar imagem da assinatura: " + err.message);
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleSaveSignature = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!signatureImage) {
      setErrorMsg("Por favor, carregue ou desenhe a imagem da sua assinatura.");
      return;
    }

    if (!signaturePassword || signaturePassword.length < 4) {
      setErrorMsg("A senha de assinatura deve ter pelo menos 4 caracteres.");
      return;
    }

    if (signaturePassword !== confirmPassword) {
      setErrorMsg("As senhas de assinatura não coincidem.");
      return;
    }

    const saved = signatureService.saveUserSignature({
      userId,
      userName,
      cargo,
      instituicaoId: currentUser?.instituicaoId || "",
      signatureImg: signatureImage,
      signaturePassword,
    });

    if (saved) {
      setSuccessMsg("Assinatura digital e senha configuradas com sucesso!");
      loadExistingSignature();
      if (onSaved) onSaved();
    } else {
      setErrorMsg("Erro ao gravar assinatura digital.");
    }
  };

  const handleDeleteSignature = () => {
    if (window.confirm("Tem a certeza que deseja remover a sua assinatura digital registada?")) {
      signatureService.revokeSignature(userId);
      setSignatureImage("");
      setSignaturePassword("");
      setConfirmPassword("");
      setSignatureData(null);
      setSuccessMsg("Assinatura digital removida com sucesso.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 md:p-8 max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <FileSignature size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Gestão de Assinatura Digital
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Segurança, autenticidade e validade documental institucional obrigatória (SIGEP)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSignature} className="space-y-6">
        {/* Visualização e Upload da Assinatura */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
            1. Imagem da Assinatura (Remoção Automática de Fundo)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-56 h-32 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden shadow-inner">
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt="Assinatura Digital"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <FileSignature size={32} className="mx-auto mb-1 opacity-40" />
                  <span className="text-[10px] font-bold">Sem Assinatura</span>
                </div>
              )}
              {isProcessingBg && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center">
                  <RefreshCw className="animate-spin text-blue-600 mb-1" size={24} />
                  <span className="text-[10px] font-bold text-blue-900">A remover fundo...</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-3 w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition shadow-md shadow-blue-900/10 cursor-pointer"
              >
                <Upload size={16} />
                <span>Carregar Imagem da Assinatura</span>
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <span>O SIGEP remove automaticamente o fundo branco para transparência perfeita.</span>
              </div>
              {signatureImage && (
                <button
                  type="button"
                  onClick={handleDeleteSignature}
                  className="flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 font-bold text-xs py-2 px-4 rounded-xl border border-red-200 hover:bg-red-50 transition w-fit cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Remover Assinatura</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Senha da Assinatura Digital */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
            2. Senha Exclusiva de Assinatura Digital
          </label>
          <p className="text-xs text-slate-500">
            Esta senha é estritamente exigida e separada da senha de login sempre que assinar documentos oficiais.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nova Senha de Assinatura
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signaturePassword}
                  onChange={(e) => setSignaturePassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-bold pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Confirmar Senha de Assinatura
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha de assinatura"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Botão Guardar */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-xs py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-900/20 transition cursor-pointer"
          >
            <ShieldCheck size={18} className="text-amber-400" />
            <span>Guardar Assinatura Digital e Senha</span>
          </button>
        </div>
      </form>
    </div>
  );
}
