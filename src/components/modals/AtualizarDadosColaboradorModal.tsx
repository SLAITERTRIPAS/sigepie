import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Camera,
  Upload,
  User,
  Building,
  Mail,
  Phone,
  Briefcase,
  Award,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Layers,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { firestoreService } from "../../lib/firestoreService";
import { optimizeImageForFirestore } from "../../lib/imageUtils";
import { hasChefiaPosition, generateCollaboratorId, safeJSONParse } from "../../lib/utils";
import { DEPARTAMENTOS, NIVEIS_ACADEMICOS } from "../../constants/formOptions";

interface AtualizarDadosColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  colaboradores?: any[];
  processos?: any[];
  onSuccess?: (updatedUser: any) => void;
}

export const AtualizarDadosColaboradorModal: React.FC<AtualizarDadosColaboradorModalProps> = ({
  isOpen,
  onClose,
  user,
  colaboradores = [],
  processos = [],
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Localizar registo do colaborador correspondente
  const matchedColaborador = useMemo(() => {
    if (!user) return null;
    return colaboradores.find(
      (c) =>
        (user?.nuit && c.nuit && String(c.nuit).trim() === String(user.nuit).trim()) ||
        (user?.email && c.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
        (user?.id && c.id && String(c.id).trim() === String(user.id).trim()) ||
        (user?.name && c.nome && c.nome.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
        (user?.nome && c.nome && c.nome.toLowerCase().trim() === user.nome.toLowerCase().trim())
    ) || null;
  }, [user, colaboradores]);

  // Localizar processo individual correspondente
  const matchedProcesso = useMemo(() => {
    if (!user && !matchedColaborador) return null;
    const targetNuit = user?.nuit || matchedColaborador?.nuit;
    const targetEmail = user?.email || matchedColaborador?.email;
    const targetId = user?.id || matchedColaborador?.id;
    const targetName = user?.nomeReal || user?.nome || matchedColaborador?.nome;

    return processos.find(
      (p) =>
        (targetId && (p.colaboradorId === targetId || p.id === targetId)) ||
        (targetNuit && (p.nuit === targetNuit || p.dadosPessoais?.nuit === targetNuit)) ||
        (targetEmail && (p.email === targetEmail || p.dadosPessoais?.email === targetEmail)) ||
        (targetName && (p.nome?.toLowerCase().trim() === targetName.toLowerCase().trim()))
    ) || null;
  }, [user, matchedColaborador, processos]);

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    nuit: "",
    numeroBI: "",
    biEmitidoA: "",
    biEm: "",
    genero: "M" as "M" | "F",
    dataNascimento: "",
    filiacaoPai: "",
    filiacaoMae: "",
    telefone: "",
    email: "",
    cargo: "",
    cargoChefia: "Nenhum",
    direcao: "",
    departamento: "",
    reparticao: "",
    sector: "",
    nivelAcademico: "",
    areaFormacao: "",
    tipoContrato: "Tempo Inteiro",
    vinculoContractual: "Quadro",
    fotoUrl: "",
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inicializar dados do formulário a partir do Colaborador, Processo ou Utilizador
  useEffect(() => {
    if (!isOpen) return;

    const baseColab = matchedColaborador || {};
    const baseProc = matchedProcesso || {};
    const procData = (baseProc as any)?.individualData || (baseProc as any)?.dadosPessoais || {};

    const initialPhoto =
      baseColab.fotoUrl ||
      baseColab.foto ||
      (baseProc as any)?.fotoUrl ||
      (baseProc as any)?.foto ||
      procData.fotoUrl ||
      procData.foto ||
      user?.photoURL ||
      user?.fotoUrl ||
      user?.foto ||
      user?.photo ||
      "";

    const initialName =
      baseColab.nome ||
      procData.nome ||
      baseProc.nome ||
      user?.nomeReal ||
      user?.nomeCompleto ||
      user?.nome ||
      user?.name ||
      "";

    setFormData({
      nome: initialName,
      nuit: baseColab.nuit || procData.nuit || baseProc.nuit || user?.nuit || "",
      numeroBI: baseColab.numeroBI || baseColab.biNo || procData.biNo || procData.numeroBI || user?.numeroBI || "",
      biEmitidoA: baseColab.biEmitidoA || procData.biEmitidoData || "",
      biEm: baseColab.biEm || procData.biEmitidoLocal || "",
      genero: (baseColab.genero || procData.genero || "M") as "M" | "F",
      dataNascimento: baseColab.dataNascimento || procData.dataNascimento || "",
      filiacaoPai: baseColab.filiacaoPai || procData.filiacaoPai || "",
      filiacaoMae: baseColab.filiacaoMae || procData.filiacaoMae || "",
      telefone: baseColab.telefone || procData.telefone || user?.telefone || "",
      email: baseColab.email || procData.email || user?.email || "",
      cargo: baseColab.cargo || procData.cargo || user?.cargo || "",
      cargoChefia: baseColab.cargoChefia || procData.cargoChefia || user?.cargoChefia || "Nenhum",
      direcao: baseColab.direcao || procData.direcao || user?.direcao || "",
      departamento: baseColab.departamento || procData.departamento || user?.departamento || "",
      reparticao: baseColab.reparticao || procData.reparticao || user?.reparticao || "",
      sector: baseColab.sector || procData.sector || user?.sector || "",
      nivelAcademico: baseColab.nivelAcademico || procData.habilitacoesLiterarias || "",
      areaFormacao: baseColab.areaFormacao || procData.habilitacoesProfissionais || "",
      tipoContrato: baseColab.tipoContrato || procData.tipoContrato || "Tempo Inteiro",
      vinculoContractual: baseColab.vinculoContractual || baseColab.tipoRelacaoContractual || procData.vinculoContractual || "Quadro",
      fotoUrl: initialPhoto,
    });

    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isOpen, matchedColaborador, matchedProcesso, user]);

  // Carregamento de Fotografia com Otimização para Firestore
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setErrorMessage(null);

    try {
      // Otimização rigorosa para não ultrapassar 150KB no Firestore
      const optimizedBase64 = await optimizeImageForFirestore(file, 400, 400, 180 * 1024);
      setFormData((prev) => ({ ...prev, fotoUrl: optimizedBase64 }));
    } catch (err) {
      console.error("Erro ao processar fotografia:", err);
      setErrorMessage("Erro ao processar imagem. Escolha outra foto com tamanho inferior a 5MB.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, fotoUrl: "" }));
  };

  // Submissão e Propagação Geral
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setErrorMessage("O Nome do colaborador é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Determinar ID do colaborador
      const colabId =
        matchedColaborador?.id ||
        user?.id ||
        user?.uid ||
        generateCollaboratorId(formData.nome, formData.nuit) ||
        `COLAB-${Date.now()}`;

      const processId =
        matchedProcesso?.id ||
        matchedColaborador?.processoNo ||
        matchedColaborador?.numeroProcesso ||
        colabId;

      const nowIso = new Date().toISOString();

      // Objeto consolidado do Colaborador
      const updatedColaboradorData: any = {
        ...(matchedColaborador || {}),
        id: colabId,
        nome: formData.nome.trim(),
        nuit: formData.nuit.trim(),
        numeroBI: formData.numeroBI.trim(),
        biEmitidoA: formData.biEmitidoA,
        biEm: formData.biEm,
        genero: formData.genero,
        dataNascimento: formData.dataNascimento,
        filiacaoPai: formData.filiacaoPai.trim(),
        filiacaoMae: formData.filiacaoMae.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email.trim(),
        cargo: formData.cargo.trim(),
        cargoChefia: formData.cargoChefia,
        direcao: formData.direcao,
        departamento: formData.departamento,
        reparticao: formData.reparticao,
        sector: formData.sector,
        areaDeAfetacao: formData.departamento || formData.direcao || formData.reparticao || "",
        nivelAcademico: formData.nivelAcademico,
        areaFormacao: formData.areaFormacao,
        tipoContrato: formData.tipoContrato,
        vinculoContractual: formData.vinculoContractual,
        fotoUrl: formData.fotoUrl,
        foto: formData.fotoUrl,
        updatedAt: nowIso,
      };

      // 2. Gravar no Firestore na coleção de 'colaboradores'
      await firestoreService.colaboradores.replace(colabId, updatedColaboradorData);

      // 3. Atualizar no Processo Individual ('processos_individuais')
      // Se existir, atualiza mantendo a estrutura; se não existir, cria o registo completo
      const existingProcData = (matchedProcesso as any)?.individualData || {};
      const updatedProcessoData: any = {
        ...(matchedProcesso || {}),
        id: processId,
        colaboradorId: colabId,
        numeroProcesso: updatedColaboradorData.numeroProcesso || processId,
        nome: formData.nome.trim(),
        nuit: formData.nuit.trim(),
        fotoUrl: formData.fotoUrl,
        foto: formData.fotoUrl,
        updatedAt: nowIso,
        dadosPessoais: {
          ...((matchedProcesso as any)?.dadosPessoais || {}),
          ...updatedColaboradorData,
          fotoUrl: formData.fotoUrl,
          foto: formData.fotoUrl,
        },
        individualData: {
          ...existingProcData,
          nome: formData.nome.trim(),
          nuit: formData.nuit.trim(),
          biNo: formData.numeroBI.trim(),
          biEmitidoData: formData.biEmitidoA,
          biEmitidoLocal: formData.biEm,
          genero: formData.genero,
          dataNascimento: formData.dataNascimento,
          filiacaoPai: formData.filiacaoPai.trim(),
          filiacaoMae: formData.filiacaoMae.trim(),
          telefone: formData.telefone.trim(),
          email: formData.email.trim(),
          fotoUrl: formData.fotoUrl,
          cargo: formData.cargo.trim(),
          cargoChefia: formData.cargoChefia,
          direcao: formData.direcao,
          departamento: formData.departamento,
          reparticao: formData.reparticao,
          sector: formData.sector,
          habilitacoesLiterarias: formData.nivelAcademico,
          habilitacoesProfissionais: formData.areaFormacao,
          tipoContrato: formData.tipoContrato,
          vinculoContractual: formData.vinculoContractual,
        },
      };

      await firestoreService.processos.replace(processId, updatedProcessoData);

      // 4. Se tiver cargo de chefia, sincronizar em 'colaboradores_chefia'
      if (hasChefiaPosition(updatedColaboradorData)) {
        await firestoreService.colaboradoresChefia.replace(colabId, {
          ...updatedColaboradorData,
          collabId: colabId,
          updatedAt: nowIso,
          fonte: "Perfil Colaborador Sync",
        });
      } else {
        try {
          await firestoreService.colaboradoresChefia.delete(colabId);
        } catch (_) {}
      }

      // 5. Atualizar perfil de utilizador e sessão local
      const userKey = user?.uid || user?.id;
      if (userKey) {
        try {
          await firestoreService.users.update(userKey, {
            nome: formData.nome.trim(),
            nomeReal: formData.nome.trim(),
            name: formData.nome.trim(),
            fotoUrl: formData.fotoUrl,
            photoURL: formData.fotoUrl,
            foto: formData.fotoUrl,
            photo: formData.fotoUrl,
            cargo: formData.cargo.trim(),
            cargoChefia: formData.cargoChefia,
            departamento: formData.departamento,
            direcao: formData.direcao,
            telefone: formData.telefone.trim(),
            nuit: formData.nuit.trim(),
            numeroBI: formData.numeroBI.trim(),
            updatedAt: nowIso,
          });
        } catch (_) {}
      }

      // Atualizar objeto na sessão ativa do localStorage
      const currentStored = safeJSONParse(localStorage.getItem("sigep_logged_in_user"), {}) || {};
      const updatedUserSession = {
        ...currentStored,
        ...user,
        nome: formData.nome.trim(),
        nomeReal: formData.nome.trim(),
        nomeCompleto: formData.nome.trim(),
        name: formData.nome.trim(),
        displayName: formData.nome.trim(),
        fotoUrl: formData.fotoUrl,
        photoURL: formData.fotoUrl,
        foto: formData.fotoUrl,
        photo: formData.fotoUrl,
        cargo: formData.cargo.trim(),
        cargoChefia: formData.cargoChefia,
        departamento: formData.departamento,
        direcao: formData.direcao,
        telefone: formData.telefone.trim(),
        nuit: formData.nuit.trim(),
        numeroBI: formData.numeroBI.trim(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("sigep_logged_in_user", JSON.stringify(updatedUserSession));
        window.dispatchEvent(new CustomEvent("colaborador_updated", { detail: updatedColaboradorData }));
        window.dispatchEvent(new CustomEvent("processo_updated", { detail: updatedProcessoData }));
        window.dispatchEvent(new CustomEvent("user_profile_updated", { detail: updatedUserSession }));
      }

      if (onSuccess) {
        onSuccess(updatedUserSession);
      }

      setSuccessMessage("Dados e fotografia do colaborador e do processo individual atualizados com sucesso!");

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Erro ao atualizar dados do colaborador:", err);
      setErrorMessage("Erro ao gravar dados no Firestore: " + (err?.message || "Tente novamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-[#121c60] to-indigo-950 text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <User size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Processo Individual & Identificação
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                Atualizar Dados do Colaborador
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Altere a sua fotografia e informações pessoais; serão aplicadas automaticamente no seu processo individual.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensagens de Alerta */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* SECÇÃO 1: FOTO DO COLABORADOR */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-3xl border border-indigo-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md bg-white flex items-center justify-center">
                {formData.fotoUrl ? (
                  <img
                    src={formData.fotoUrl}
                    alt="Fotografia do Colaborador"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                    <User size={36} />
                    <span className="text-[10px] font-bold mt-1">Sem Foto</span>
                  </div>
                )}

                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                )}
              </div>

              {formData.fotoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition"
                  title="Remover fotografia"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                <Camera size={14} className="text-indigo-600" />
                Fotografia Oficial do Colaborador
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Esta foto será aplicada no seu cabeçalho, cartão institucional e no campo oficial de fotografia do seu <strong>Processo Individual</strong>.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-[#121c60] hover:bg-[#0e164d] text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition active:scale-95"
                >
                  <Upload size={14} />
                  <span>{formData.fotoUrl ? "Alterar Fotografia" : "Carregar Fotografia"}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {formData.fotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-bold text-red-600 hover:text-red-800 px-3 py-2 rounded-xl hover:bg-red-50 transition"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: DADOS PESSOAIS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText size={15} className="text-indigo-600" />
              1. Identificação Pessoal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo do colaborador"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">NUIT</label>
                <input
                  type="text"
                  value={formData.nuit}
                  onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                  placeholder="Número Único de Identificação Tributária"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Número do B.I. / Passaporte</label>
                <input
                  type="text"
                  value={formData.numeroBI}
                  onChange={(e) => setFormData({ ...formData, numeroBI: e.target.value })}
                  placeholder="Ex: 110100234567M"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value as "M" | "F" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="M">Masculino (M)</option>
                  <option value="F">Feminino (F)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Filiação (Pai)</label>
                <input
                  type="text"
                  value={formData.filiacaoPai}
                  onChange={(e) => setFormData({ ...formData, filiacaoPai: e.target.value })}
                  placeholder="Nome do Pai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Filiação (Mãe)</label>
                <input
                  type="text"
                  value={formData.filiacaoMae}
                  onChange={(e) => setFormData({ ...formData, filiacaoMae: e.target.value })}
                  placeholder="Nome da Mãe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECÇÃO 3: CONTACTOS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Phone size={15} className="text-indigo-600" />
              2. Contactos e Comunicação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Telefone / Telemóvel</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+258 84/86/82..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Correio Eletrónico (E-mail)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="colaborador@instituicao.gov.mz"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECÇÃO 4: DADOS INSTITUCIONAIS & AFETAÇÃO */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building size={15} className="text-indigo-600" />
              3. Dados Institucionais & Afetação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Cargo / Função Principal</label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Docente Universitário / Técnico Superior de TI"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Cargo de Chefia</label>
                <input
                  type="text"
                  value={formData.cargoChefia}
                  onChange={(e) => setFormData({ ...formData, cargoChefia: e.target.value })}
                  placeholder="Ex: Diretor de Serviços / Chefe de Departamento / Nenhum"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Direção / Unidade Orgânica</label>
                <select
                  value={formData.direcao}
                  onChange={(e) => setFormData({ ...formData, direcao: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione a Direção...</option>
                  {Object.keys(DEPARTAMENTOS).map((dir) => (
                    <option key={dir} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Departamento / Setor de Afetação</label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  placeholder="Ex: Departamento de Recursos Humanos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Habilitações Literárias (Nível Académico)</label>
                <input
                  type="text"
                  value={formData.nivelAcademico}
                  onChange={(e) => setFormData({ ...formData, nivelAcademico: e.target.value })}
                  placeholder="Ex: Licenciatura / Mestrado / Doutoramento"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Área de Formação</label>
                <input
                  type="text"
                  value={formData.areaFormacao}
                  onChange={(e) => setFormData({ ...formData, areaFormacao: e.target.value })}
                  placeholder="Ex: Engenharia Informática / Gestão / Direito"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingPhoto}
              className="flex items-center gap-2 bg-[#121c60] hover:bg-[#0e164d] text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>A Guardar no Processo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Gravar & Atualizar Dados</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AtualizarDadosColaboradorModal;
