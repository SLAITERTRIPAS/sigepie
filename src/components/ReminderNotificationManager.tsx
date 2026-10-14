import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell,
  BellRing,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Building,
  Calendar,
  Sparkles,
  Smartphone,
  Monitor,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { firestoreService } from "../lib/firestoreService";
import { SystemReminder } from "../types";

interface ReminderNotificationManagerProps {
  currentUser: any;
}

export const ReminderNotificationManager: React.FC<ReminderNotificationManagerProps> = ({
  currentUser,
}) => {
  const [reminders, setReminders] = useState<SystemReminder[]>([]);
  const [activeModalReminder, setActiveModalReminder] = useState<SystemReminder | null>(null);
  const [dismissedTemporarily, setDismissedTemporarily] = useState<string[]>([]);
  const [showTray, setShowTray] = useState(false);

  // Chave identificadora única do utilizador (Email ou ID)
  const userKey = useMemo(() => {
    return (
      currentUser?.email?.toLowerCase().trim() ||
      currentUser?.id ||
      currentUser?.nuit ||
      "anon_user"
    );
  }, [currentUser]);

  // Subscrição aos lembretes do Firestore
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = firestoreService.subscribeReminders((list) => {
      setReminders(list || []);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Função para verificar se o utilizador pertence à área de destino
  const userMatchesArea = useCallback(
    (rem: SystemReminder): boolean => {
      if (!rem.ativo) return false;

      // Validação de data de expiração
      if (rem.dataExpiracao) {
        const today = new Date().toISOString().split("T")[0];
        if (today > rem.dataExpiracao) return false;
      }

      if (rem.areaDestino === "todas") return true;

      const target = rem.areaDestino.toLowerCase().trim();
      const userAreas: string[] = [
        currentUser?.departamento,
        currentUser?.direcao,
        currentUser?.sector,
        currentUser?.reparticao,
        currentUser?.unidade,
        currentUser?.unidadeOrganica,
        currentUser?.cargoChefia,
        currentUser?.area,
        currentUser?.areaTrabalho,
        currentUser?.funcao,
      ]
        .filter(Boolean)
        .map((s: string) => String(s).toLowerCase().trim());

      return userAreas.some(
        (area) => area === target || area.includes(target) || target.includes(area)
      );
    },
    [currentUser]
  );

  // Lembretes relevantes para a área do utilizador
  const userRelevantReminders = useMemo(() => {
    return reminders.filter((rem) => userMatchesArea(rem));
  }, [reminders, userMatchesArea]);

  // Lembretes que o utilizador ainda não leu/confirmou
  const unreadReminders = useMemo(() => {
    return userRelevantReminders.filter((rem) => {
      const isReadInDb = Array.isArray(rem.lidoPor) && rem.lidoPor.includes(userKey);
      const isReadLocally =
        typeof window !== "undefined" &&
        localStorage.getItem(`sigep_reminder_read_${rem.id}_${userKey}`) === "true";
      return !isReadInDb && !isReadLocally;
    });
  }, [userRelevantReminders, userKey]);

  // Disparo de Notificações Push no Navegador
  useEffect(() => {
    if (!currentUser || typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      userRelevantReminders.forEach((rem) => {
        if (rem.tipo === "push" || rem.tipo === "ambos") {
          const sessionNotified = sessionStorage.getItem(`sigep_push_sent_${rem.id}`);
          if (!sessionNotified) {
            try {
              new Notification(`[SIGEP] ${rem.titulo}`, {
                body: `${rem.mensagem}\n(Área: ${rem.areaDestinoNome || rem.areaDestino})`,
                icon: "/image.png",
                badge: "/image.png",
              });
              sessionStorage.setItem(`sigep_push_sent_${rem.id}`, "true");
            } catch (err) {
              console.warn("Erro ao disparar Notificação Push:", err);
            }
          }
        }
      });
    }
  }, [currentUser, userRelevantReminders]);

  // Gestão de Exibição do Modal Automático
  useEffect(() => {
    // Escolhe o primeiro lembrete não lido que seja do tipo "modal" ou "ambos" e que não foi dispensado temporariamente
    const pendingModal = unreadReminders.find(
      (rem) =>
        (rem.tipo === "modal" || rem.tipo === "ambos") &&
        !dismissedTemporarily.includes(rem.id)
    );

    setActiveModalReminder(pendingModal || null);
  }, [unreadReminders, dismissedTemporarily]);

  // Ação de confirmar leitura
  const handleConfirmRead = async (reminder: SystemReminder) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`sigep_reminder_read_${reminder.id}_${userKey}`, "true");
      }
      await firestoreService.markReminderAsRead(reminder.id, userKey);
      setActiveModalReminder(null);
    } catch (err) {
      console.error("Erro ao marcar lembrete como lido:", err);
      setActiveModalReminder(null);
    }
  };

  const handleDismissLater = (reminderId: string) => {
    setDismissedTemporarily((prev) => [...prev, reminderId]);
    setActiveModalReminder(null);
  };

  if (!currentUser) return null;

  return (
    <>
      {/* 1. Modal Automático em Ecrã Inteiro com Foco no Lembrete */}
      <AnimatePresence>
        {activeModalReminder && (
          <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border ${
                activeModalReminder.prioridade === "urgente"
                  ? "border-red-500 shadow-red-500/20"
                  : activeModalReminder.prioridade === "aviso"
                  ? "border-amber-500 shadow-amber-500/20"
                  : "border-indigo-500 shadow-indigo-500/20"
              }`}
            >
              {/* Header do Modal com Cor de Prioridade */}
              <div
                className={`p-6 text-white flex items-center justify-between ${
                  activeModalReminder.prioridade === "urgente"
                    ? "bg-gradient-to-r from-red-700 to-rose-900"
                    : activeModalReminder.prioridade === "aviso"
                    ? "bg-gradient-to-r from-amber-600 to-orange-800"
                    : "bg-gradient-to-r from-indigo-700 to-[#121c60]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    {activeModalReminder.prioridade === "urgente" ? (
                      <AlertTriangle size={24} className="text-white animate-bounce" />
                    ) : activeModalReminder.prioridade === "aviso" ? (
                      <AlertCircle size={24} className="text-white" />
                    ) : (
                      <BellRing size={24} className="text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20">
                        Lembrete Institucional ({activeModalReminder.prioridade})
                      </span>
                    </div>
                    <h2 className="text-lg font-black tracking-tight mt-0.5">
                      {activeModalReminder.titulo}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => handleDismissLater(activeModalReminder.id)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                  title="Fechar temporariamente"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Corpo do Lembrete */}
              <div className="p-6 space-y-4">
                {/* Banner da Área Destinatária */}
                <div className="flex items-center gap-2.5 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-indigo-950">
                  <Building size={18} className="text-indigo-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-500">Direcionado para a sua Área de Trabalho: </span>
                    <strong className="font-black text-indigo-900">
                      {activeModalReminder.areaDestinoNome || activeModalReminder.areaDestino}
                    </strong>
                  </div>
                </div>

                {/* Conteúdo da Mensagem */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-medium max-h-60 overflow-y-auto">
                  {activeModalReminder.mensagem}
                </div>

                {/* Informações Complementares */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">Emitido por:</span>
                    <span>{activeModalReminder.criadoPor}</span>
                  </div>
                  {activeModalReminder.dataExpiracao && (
                    <div className="flex items-center gap-1 font-semibold text-slate-400">
                      <Calendar size={13} />
                      <span>Validade até: {activeModalReminder.dataExpiracao}</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    onClick={() => handleDismissLater(activeModalReminder.id)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition text-center"
                  >
                    Lembrar Mais Tarde
                  </button>

                  <button
                    onClick={() => handleConfirmRead(activeModalReminder)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#121c60] hover:bg-[#0e164d] text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider transition-all shadow-lg active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    <span>Compreendi & Confirmar Leitura</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Botão Flutuante / Central de Lembretes da Área */}
      {userRelevantReminders.length > 0 && (
        <div className="fixed bottom-6 left-6 z-[999]">
          <div className="relative">
            <button
              onClick={() => setShowTray(!showTray)}
              className={`p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 border ${
                unreadReminders.length > 0
                  ? "bg-gradient-to-r from-indigo-700 to-[#121c60] text-white border-indigo-400 ring-4 ring-indigo-300/30 animate-pulse"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
              title="Lembretes e Comunicados da sua Área de Trabalho"
            >
              <BellRing size={20} />
              {unreadReminders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {unreadReminders.length}
                </span>
              )}
            </button>

            {/* Gaveta / Dropdown de Lembretes */}
            <AnimatePresence>
              {showTray && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute bottom-14 left-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-3 overflow-hidden max-h-[70vh] flex flex-col"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-indigo-600" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                        Lembretes da sua Área
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowTray(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                    {userRelevantReminders.map((rem) => {
                      const isUnread = unreadReminders.some((u) => u.id === rem.id);
                      return (
                        <div
                          key={rem.id}
                          className={`p-3 rounded-2xl border text-xs space-y-1.5 transition ${
                            isUnread
                              ? "bg-indigo-50/60 border-indigo-200"
                              : "bg-slate-50 border-slate-100 opacity-75"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                rem.prioridade === "urgente"
                                  ? "bg-red-100 text-red-700"
                                  : rem.prioridade === "aviso"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {rem.prioridade}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {rem.areaDestinoNome || rem.areaDestino}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900">{rem.titulo}</h5>
                          <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                            {rem.mensagem}
                          </p>

                          {isUnread && (
                            <button
                              onClick={() => {
                                setActiveModalReminder(rem);
                                setShowTray(false);
                              }}
                              className="mt-1 text-[11px] font-black text-indigo-700 hover:text-indigo-900 underline block"
                            >
                              Ver Lembrete Completo
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
};
export default ReminderNotificationManager;
