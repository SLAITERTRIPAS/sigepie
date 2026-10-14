import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Radio,
  Send,
  Calendar,
  Layers,
  Sparkles,
  Building,
  Users,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Smartphone,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { firestoreService } from "../lib/firestoreService";
import { SystemReminder } from "../types";
import { DEPARTAMENTOS } from "../constants/formOptions";

interface SistemaLembretesAdminProps {
  user: any;
  colaboradores?: any[];
  onShowAlert?: (msg: string, type?: "success" | "error" | "info") => void;
}

export const SistemaLembretesAdmin: React.FC<SistemaLembretesAdminProps> = ({
  user,
  colaboradores = [],
  onShowAlert,
}) => {
  const [reminders, setReminders] = useState<SystemReminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState<string>("todas");
  const [filterType, setFilterType] = useState<string>("todos");
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  // Formulário de Novo Lembrete
  const [formData, setFormData] = useState({
    titulo: "",
    mensagem: "",
    tipo: "ambos" as "modal" | "push" | "ambos",
    prioridade: "aviso" as "informativo" | "aviso" | "urgente",
    areaDestino: "todas",
    areaCustomizada: "",
    dataExpiracao: "",
  });

  // Lista consolidada de Áreas de Trabalho
  const workAreasList = useMemo(() => {
    const areas = new Set<string>();
    
    // Áreas de DEPARTAMENTOS padrão
    Object.entries(DEPARTAMENTOS).forEach(([direcao, depts]) => {
      areas.add(direcao);
      if (Array.isArray(depts)) {
        depts.forEach((d) => areas.add(d));
      }
    });

    // Áreas presentes nos colaboradores
    colaboradores.forEach((c) => {
      if (c.departamento) areas.add(c.departamento);
      if (c.direcao) areas.add(c.direcao);
      if (c.sector) areas.add(c.sector);
      if (c.reparticao) areas.add(c.reparticao);
      if (c.unidade) areas.add(c.unidade);
    });

    return Array.from(areas).filter(Boolean).sort();
  }, [colaboradores]);

  // Subscrição em tempo real aos lembretes do Firestore
  useEffect(() => {
    const unsubscribe = firestoreService.subscribeReminders((list) => {
      setReminders(list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }));
    });
    return () => unsubscribe();
  }, []);

  const handleRequestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission === "granted") {
          new Notification("Notificações Push Ativadas!", {
            body: "O SIGEP agora pode enviar alertas e lembretes diretamente ao seu navegador.",
            icon: "/image.png",
          });
          if (onShowAlert) onShowAlert("Permissão de Notificação Push concedida com sucesso!", "success");
        } else {
          if (onShowAlert) onShowAlert("Permissão de Notificação Push não foi concedida pelo navegador.", "info");
        }
      } catch (err) {
        console.error("Erro ao solicitar permissão Push:", err);
      }
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      if (onShowAlert) onShowAlert("Por favor preencha o título e a mensagem do lembrete.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetArea = formData.areaDestino === "custom" 
        ? formData.areaCustomizada.trim() || "Geral" 
        : formData.areaDestino;

      const newReminderData: Omit<SystemReminder, "id"> = {
        titulo: formData.titulo.trim(),
        mensagem: formData.mensagem.trim(),
        tipo: formData.tipo,
        prioridade: formData.prioridade,
        areaDestino: targetArea,
        areaDestinoNome: targetArea === "todas" ? "Todas as Áreas de Trabalho" : targetArea,
        ativo: true,
        dataExpiracao: formData.dataExpiracao || undefined,
        criadoPor: user?.nomeReal || user?.nome || user?.name || user?.email || "Administrador",
        criadoPorEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        lidoPor: [],
      };

      await firestoreService.createReminder(newReminderData);

      // Disparar notificação local se for push e tiver permissão
      if ((formData.tipo === "push" || formData.tipo === "ambos") && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(`[LEMBRETE SIGEP] ${formData.titulo}`, {
          body: `${formData.mensagem} (Destinado a: ${newReminderData.areaDestinoNome})`,
          icon: "/image.png",
        });
      }

      // Disparar evento para componentes ouvintes no cliente
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sigep_reminder_created", { detail: newReminderData }));
      }

      setIsAdding(false);
      setFormData({
        titulo: "",
        mensagem: "",
        tipo: "ambos",
        prioridade: "aviso",
        areaDestino: "todas",
        areaCustomizada: "",
        dataExpiracao: "",
      });

      if (onShowAlert) onShowAlert("Lembrete e notificação enviados com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar lembrete:", err);
      if (onShowAlert) onShowAlert("Erro ao guardar o lembrete. Tente novamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (reminder: SystemReminder) => {
    try {
      await firestoreService.lembretes_sistema.update(reminder.id, {
        ativo: !reminder.ativo,
      });
      if (onShowAlert) {
        onShowAlert(
          reminder.ativo ? "Lembrete pausado com sucesso." : "Lembrete reativado com sucesso.",
          "info"
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!window.confirm("Deseja eliminar este lembrete do sistema?")) return;
    try {
      await firestoreService.lembretes_sistema.delete(id);
      if (onShowAlert) onShowAlert("Lembrete eliminado com sucesso.", "success");
    } catch (err) {
      console.error("Erro ao eliminar lembrete:", err);
    }
  };

  const filteredReminders = useMemo(() => {
    return reminders.filter((rem) => {
      const matchSearch =
        rem.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rem.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rem.areaDestinoNome || rem.areaDestino).toLowerCase().includes(searchTerm.toLowerCase());

      const matchArea = filterArea === "todas" ? true : rem.areaDestino === filterArea;
      const matchType = filterType === "todos" ? true : rem.tipo === filterType;

      return matchSearch && matchArea && matchType;
    });
  }, [reminders, searchTerm, filterArea, filterType]);

  const stats = useMemo(() => {
    const total = reminders.length;
    const ativos = reminders.filter((r) => r.ativo).length;
    const modais = reminders.filter((r) => r.tipo === "modal" || r.tipo === "ambos").length;
    const push = reminders.filter((r) => r.tipo === "push" || r.tipo === "ambos").length;
    return { total, ativos, modais, push };
  }, [reminders]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabeçalho Superior */}
      <div className="bg-gradient-to-r from-slate-900 via-[#121c60] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
          <BellRing size={240} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase text-indigo-200">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              Central de Lembretes & Notificações
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Lembretes por Área de Trabalho
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Emita avisos institucionais e notificações instantâneas (via Modal no ecrã e Push no navegador) segmentadas por setor, direção ou departamento do SIGEP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {pushPermission !== "granted" && (
              <button
                onClick={handleRequestPushPermission}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
                title="Ativar permissão de notificações no navegador"
              >
                <Smartphone size={16} />
                <span>Ativar Notificações Push</span>
              </button>
            )}

            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Novo Lembrete</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-black uppercase text-indigo-200 block">Total Criados</span>
            <span className="text-2xl font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-black uppercase text-emerald-300 block">Ativos em Emissão</span>
            <span className="text-2xl font-black text-emerald-400">{stats.ativos}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-black uppercase text-blue-300 block">Modais no Ecrã</span>
            <span className="text-2xl font-black text-blue-300">{stats.modais}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-black uppercase text-amber-300 block">Notificações Push</span>
            <span className="text-2xl font-black text-amber-300">{stats.push}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, mensagem ou área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Área:</span>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todas">Todas as Áreas</option>
              {workAreasList.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Canal:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos os Canais</option>
              <option value="modal">Modal (Popup)</option>
              <option value="push">Notificação Push</option>
              <option value="ambos">Ambos (Modal + Push)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Lembretes */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Bell size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum lembrete encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || filterArea !== "todas" || filterType !== "todos"
              ? "Nenhum lembrete corresponde aos critérios de pesquisa selecionados."
              : "Clique em 'Novo Lembrete' para enviar um comunicado ou notificação para os colaboradores de uma área de trabalho específica."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReminders.map((rem) => {
            const isUrgente = rem.prioridade === "urgente";
            const isAviso = rem.prioridade === "aviso";

            const badgeBg = isUrgente
              ? "bg-red-50 text-red-700 border-red-200"
              : isAviso
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <motion.div
                key={rem.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl p-5 border shadow-sm transition-all relative flex flex-col justify-between gap-4 ${
                  rem.ativo ? "border-slate-200 hover:border-slate-300 hover:shadow-md" : "border-slate-100 opacity-60 bg-slate-50/50"
                }`}
              >
                <div className="space-y-3">
                  {/* Badges superiores */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeBg}`}>
                        {rem.prioridade}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {rem.tipo === "modal" && <Monitor size={12} className="text-indigo-600" />}
                        {rem.tipo === "push" && <Smartphone size={12} className="text-emerald-600" />}
                        {rem.tipo === "ambos" && <Sparkles size={12} className="text-amber-500" />}
                        <span>
                          {rem.tipo === "modal"
                            ? "Modal em Ecrã"
                            : rem.tipo === "push"
                            ? "Notificação Push"
                            : "Modal + Push"}
                        </span>
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      rem.ativo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}>
                      {rem.ativo ? "Em Emissão" : "Pausado"}
                    </span>
                  </div>

                  {/* Informação do Título e Mensagem */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      {rem.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed whitespace-pre-line line-clamp-3">
                      {rem.mensagem}
                    </p>
                  </div>

                  {/* Destinatário (Área de Trabalho) */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <Building size={14} className="text-indigo-600 shrink-0" />
                      <span>Área Destinatária:</span>
                      <span className="font-black text-indigo-950">
                        {rem.areaDestinoNome || (rem.areaDestino === "todas" ? "Todas as Áreas de Trabalho (Global)" : rem.areaDestino)}
                      </span>
                    </div>
                    {rem.dataExpiracao && (
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>Válido até: {rem.dataExpiracao}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé com Ações */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400 font-semibold">
                    <span>Enviado por: {rem.criadoPor}</span>
                    {rem.lidoPor && rem.lidoPor.length > 0 && (
                      <span className="ml-2 font-bold text-slate-600">
                        ({rem.lidoPor.length} confirmações)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(rem)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        rem.ativo
                          ? "bg-amber-100 hover:bg-amber-200 text-amber-800"
                          : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                      }`}
                      title={rem.ativo ? "Pausar envio" : "Retomar envio"}
                    >
                      {rem.ativo ? "Pausar" : "Reativar"}
                    </button>

                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Eliminar lembrete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação de Novo Lembrete */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col"
            >
              {/* Header do Modal */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-[#121c60] text-white flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Criar Lembrete / Notificação</h2>
                    <p className="text-xs text-slate-300 font-medium">Segmentação direta para a área de trabalho dos colaboradores</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateReminder} className="p-6 space-y-5">
                {/* Título */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Título do Lembrete *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Submissão de Planos Setoriais / Reunião Geral de Coordenação"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Mensagem / Conteúdo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Mensagem / Conteúdo do Lembrete *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Descreva detalhadamente as instruções, prazos ou o aviso a ser exibido para os colaboradores da área..."
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Canal de Entrega / Tipo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Canal de Envio / Tipo de Notificação *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: "modal" })}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                        formData.tipo === "modal"
                          ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300 text-indigo-950"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Monitor size={18} className="text-indigo-600" />
                        {formData.tipo === "modal" && <Check size={16} className="text-indigo-600" />}
                      </div>
                      <div className="mt-2">
                        <span className="font-bold text-xs block">Modal em Ecrã</span>
                        <span className="text-[10px] text-slate-500 font-medium">Popup imediato ao utilizar o sistema</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: "push" })}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                        formData.tipo === "push"
                          ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Smartphone size={18} className="text-emerald-600" />
                        {formData.tipo === "push" && <Check size={16} className="text-emerald-600" />}
                      </div>
                      <div className="mt-2">
                        <span className="font-bold text-xs block">Notificação Push</span>
                        <span className="text-[10px] text-slate-500 font-medium">Alerta no navegador/computador</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: "ambos" })}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                        formData.tipo === "ambos"
                          ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-300 text-amber-950"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Sparkles size={18} className="text-amber-600" />
                        {formData.tipo === "ambos" && <Check size={16} className="text-amber-600" />}
                      </div>
                      <div className="mt-2">
                        <span className="font-bold text-xs block">Ambos (Modal + Push)</span>
                        <span className="text-[10px] text-slate-500 font-medium">Impacto e alcance máximo</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Seleção da Área de Trabalho Alvo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Área de Trabalho Destinatária *
                  </label>
                  <select
                    value={formData.areaDestino}
                    onChange={(e) => setFormData({ ...formData, areaDestino: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todas">Todas as Áreas de Trabalho (Todos os Colaboradores)</option>
                    <optgroup label="Áreas e Departamentos Institucionais">
                      {workAreasList.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </optgroup>
                    <option value="custom">Outra Área Específica (Digitar manualmente)...</option>
                  </select>

                  {formData.areaDestino === "custom" && (
                    <input
                      type="text"
                      placeholder="Introduza o nome exato da Área de Trabalho..."
                      value={formData.areaCustomizada}
                      onChange={(e) => setFormData({ ...formData, areaCustomizada: e.target.value })}
                      className="w-full mt-2 px-4 py-2 bg-slate-50 border border-indigo-300 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  <p className="text-[10px] text-slate-500 font-medium">
                    Apenas os utilizadores cujo perfil pertença à área selecionada receberão o modal ou a notificação.
                  </p>
                </div>

                {/* Prioridade e Data de Expiração */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      Prioridade / Gravidade
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, prioridade: "informativo" })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.prioridade === "informativo"
                            ? "bg-blue-600 text-white border-blue-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Informativo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, prioridade: "aviso" })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.prioridade === "aviso"
                            ? "bg-amber-500 text-slate-950 border-amber-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Aviso
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, prioridade: "urgente" })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.prioridade === "urgente"
                            ? "bg-red-600 text-white border-red-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Urgente
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      Data de Expiração (Opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.dataExpiracao}
                      onChange={(e) => setFormData({ ...formData, dataExpiracao: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Botões do Rodapé */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-[#121c60] hover:bg-[#0e164d] text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? "A Enviar Lembrete..." : "Emitir & Enviar Lembrete"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SistemaLembretesAdmin;
