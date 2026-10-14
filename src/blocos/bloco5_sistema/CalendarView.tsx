import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Calendar as CalendarIcon,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Save,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Event, Nota, PeriodoPlanificacao } from "../../types";
import { holidays2026 } from "../../constants/holidays";
import { safeJSONParse } from "../../lib/utils";
import {
  DEFAULT_PLANNING_PERIOD,
  canManagePeriodoPlanificacao,
  subscribePeriodoPlanificacao,
  savePeriodoPlanificacao,
  isPlanificacaoAberta,
  isRelatorioSemestralAberto,
  ativarContagem30DiasPlanificacao,
  ativarPeriodoRelatorio,
  estenderPrazoPlanificacao,
  zerarTodosOsPrazos,
  executarSubmissaoAutomaticaSePrazoExpirado,
  getCicloPlanoEstrutura,
  getCicloRelatorioEstrutura,
} from "../../lib/planningPeriodService";

export default function CalendarView({
  events,
  onAddEvent,
  user,
}: {
  events: Event[];
  onAddEvent?: (event: Omit<Event, "id">) => Promise<any>;
  onUpdateEvent?: (id: string, event: Partial<Event>) => Promise<any>;
  onDeleteEvent?: (id: string) => Promise<any>;
  onAgendar?: () => void;
  onNota?: () => void;
  title?: string;
  notes?: Nota[];
  user?: any;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Período de Planificação state
  const [periodoPlanificacao, setPeriodoPlanificacao] = useState<PeriodoPlanificacao>(DEFAULT_PLANNING_PERIOD);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  const [periodoForm, setPeriodoForm] = useState<Partial<PeriodoPlanificacao>>({ ...DEFAULT_PLANNING_PERIOD });
  const [isSavingPeriodo, setIsSavingPeriodo] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const currentUser = user || (typeof window !== "undefined" ? safeJSONParse(localStorage.getItem("sigep_logged_in_user"), null) : null);
  const canManagePeriod = canManagePeriodoPlanificacao(currentUser);

  useEffect(() => {
    const unsub = subscribePeriodoPlanificacao((periodo) => {
      setPeriodoPlanificacao(periodo);
      setPeriodoForm(periodo);
      if (periodo && !isPlanificacaoAberta(periodo).aberta) {
        executarSubmissaoAutomaticaSePrazoExpirado(periodo);
      }
    });
    return () => unsub();
  }, []);

  const handleSavePeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPeriodo(true);
    try {
      await savePeriodoPlanificacao(periodoForm, currentUser);
      setSaveSuccessMsg("Período de planificação e relatórios atualizado com sucesso!");
      setTimeout(() => {
        setSaveSuccessMsg("");
        setShowPeriodoModal(false);
      }, 1500);
    } catch (err) {
      console.error("Erro ao salvar período de planificação:", err);
      alert("Erro ao salvar período de planificação. Tente novamente.");
    } finally {
      setIsSavingPeriodo(false);
    }
  };

  const planStatus = isPlanificacaoAberta(periodoPlanificacao);
  const relatorioStatus = isRelatorioSemestralAberto(periodoPlanificacao);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "" as string,
    agenda: "",
    date: "", // Data de Início
    endDate: "", // Data Final
    startTime: "08:00",
    endTime: "16:00",
    location: "",
    organizador: "",
    participants: [] as string[],
  });

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planStatus.aberta) {
      setSubmissionError(
        "O período de planificação encerrado, aguarde a atualização do calendário, assim como o relatório semestral."
      );
      return;
    }
    const eventDate =
      newEvent.date ||
      (selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]);

    const eventEndDate = newEvent.endDate || eventDate;

    const event: Omit<Event, "id"> = {
      title: newEvent.title,
      date: eventDate,
      endDate: eventEndDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      participants: newEvent.participants.join(", "),
      type: newEvent.type,
      agenda: newEvent.agenda,
      organizador: newEvent.organizador,
    };

    if (onAddEvent) await onAddEvent(event);
    setShowModal(false);
    setNewEvent({
      title: "",
      type: "",
      agenda: "",
      date: "",
      endDate: "",
      startTime: "08:00",
      endTime: "16:00",
      location: "",
      organizador: "",
      participants: [],
    });
  };

  const allEvents = [...events, ...holidays2026];

  return (
    <div className="w-full flex flex-col justify-center items-center py-6 px-4 relative overflow-hidden">
      {/* Logótipo em marca d'água / fundo da área de eventos com 80% de transparência (20% de opacidade) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          src="/image.png"
          alt="Logótipo de Fundo Eventos"
          className="w-[500px] h-[500px] object-contain opacity-20 filter drop-shadow-sm select-none"
        />
      </div>

      <div className="w-full max-w-7xl flex flex-col gap-6 relative z-10 mx-auto">
        {/* Banner de Estado do Período de Planificação e Relatórios */}
        <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              planStatus.aberta ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {planStatus.aberta ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Período de Planificação Institucional
                </h3>
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                  planStatus.aberta
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-red-600 text-white border-red-700"
                }`}>
                  {planStatus.aberta ? "Período Aberto" : "Período Fechado"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {planStatus.aberta
                  ? `Ciclo de submissão oficial ativo até ${periodoPlanificacao?.dataFimPlanificacao || "ao encerramento do prazo"}`
                  : (planStatus.motivo || "Fora do período oficial de elaboração e submissão de planos setoriais.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl">
              <span className="text-xs font-bold text-slate-600">Relatórios Semestrais:</span>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                relatorioStatus.aberto ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
              }`}>
                {relatorioStatus.aberto ? "Aberto" : "Fechado"}
              </span>
            </div>

            {canManagePeriod && (
              <button
                onClick={() => setShowPeriodoModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md shadow-purple-100 shrink-0"
              >
                <ShieldCheck size={16} /> Gerir Prazos
              </button>
            )}
          </div>
        </div>

        <div className="w-full flex justify-center relative">
          {/* Calendar Grid ajustado para mostrar todas as datas e semanas completas */}
          <div 
            className="relative bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 w-full max-w-6xl min-h-fit"
          >
            {/* Background Logo covering entire calendar area */}
            <div
              className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/d/1Xasp7NB08GDtIE2VEwf-O5iycCdDJKg1")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 0.12,
              }}
            />

            <div className="relative z-10 flex flex-col h-full bg-transparent">
              {/* Top Header */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                    <button
                      onClick={prevMonth}
                      className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 tracking-tight">
                  Moçambique Estatística {currentDate.getFullYear()}
                </div>
              </div>

              {/* Days of week header: Dom, Seg, Ter, Qua, Qui, Sex, Sáb */}
              <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-500 gap-1.5 sm:gap-2 md:gap-3">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => {
                  const isTodayColumn =
                    new Date().getDay() === index &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      className={`py-1 text-[11px] sm:text-xs font-black tracking-wider ${
                        isTodayColumn ? "text-blue-700 font-extrabold" : "text-slate-500"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Calendar Grid Boxes */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const days = daysInMonth(year, month);
                  const firstDay = firstDayOfMonth(year, month);
                  const calendarCells = [];

                  // Empty slots for previous month
                  for (let i = 0; i < firstDay; i++) {
                    calendarCells.push(
                      <div
                        key={`empty-${i}`}
                        className="min-h-[75px] sm:min-h-[90px] md:min-h-[105px] rounded-2xl border border-dashed border-slate-100 bg-slate-50/20"
                      ></div>
                    );
                  }

                  // Days of current month (all 1 to 28/29/30/31 days completely visible)
                  for (let day = 1; day <= days; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isJune30 = month === 5 && day === 30 && year === 2026;
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                    const dayEvents = allEvents.filter((e) => e.date === dateStr);

                    calendarCells.push(
                      <div
                        key={day}
                        onClick={() => {
                          if (!planStatus.aberta) {
                            setSubmissionError(
                              "O período de planificação encerrado, aguarde a atualização do calendário, assim como o relatório semestral."
                            );
                            return;
                          }
                          const d = new Date(year, month, day);
                          setSelectedDate(d);
                          setNewEvent((prev) => ({
                            ...prev,
                            date: d.toISOString().split("T")[0],
                          }));
                          setShowModal(true);
                        }}
                        className={`min-h-[75px] sm:min-h-[90px] md:min-h-[105px] rounded-2xl border p-2 sm:p-2.5 md:p-3 flex flex-col justify-between transition-all cursor-pointer shadow-xs relative group ${
                          isJune30
                            ? "bg-red-50/70 border-red-400 shadow-sm ring-1 ring-red-300"
                            : isToday
                            ? "bg-blue-50/60 border-blue-500 border-2 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-center items-center w-full relative">
                          <span
                            className={`text-xs sm:text-sm md:text-base font-bold ${
                              isJune30 ? "text-red-600 font-black" : "text-slate-800"
                            }`}
                          >
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="absolute top-0 right-0 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-600 shrink-0" title={`${dayEvents.length} evento(s)`} />
                          )}
                        </div>

                        {/* Event preview inside cell */}
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-[42px] sm:max-h-[50px] text-[10px] sm:text-[11px] my-1">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div key={ev.id} className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded font-semibold truncate text-[9px] sm:text-[10px]">
                              {ev.title}
                            </div>
                          ))}
                        </div>

                        {/* Special badge for June 30 */}
                        {isJune30 && (
                          <div className="mt-auto w-full bg-white/90 border border-red-200 rounded-md py-0.5 text-center shadow-xs">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-red-600 tracking-wider">
                              Fim prazo
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return calendarCells;
                })()}
              </div>
            </div>
          </div>
        </div>
    </div>

      {/* Modal de Agendamento */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-blue-700 flex justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider">Agendar Nova Atividade</h3>
                  <p className="text-xs text-blue-100 font-medium">Formulário completo de agendamento por período e tipo</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {!planStatus.aberta && (
                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 text-red-900 shadow-sm">
                    <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-red-800">
                        Erro na Submissão
                      </h4>
                      <p className="text-xs font-bold leading-relaxed">
                        O período de planificação encerrado, aguarde a atualização do calendário, assim como o relatório semestral.
                      </p>
                    </div>
                  </div>
                )}
                {/* Período da Atividade: Data Início e Data Fim */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    1. Período Definido da Atividade
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Data de Início <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Data Final <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        min={newEvent.date || undefined}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
                        value={newEvent.endDate || newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Horários Início e Fim */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hora de Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="time"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hora de Término <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="time"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Tipo de Atividade e Local */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Atividade <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold"
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>-- Selecione o tipo de atividade --</option>
                      <option value="Reunião">Reunião</option>
                      <option value="Formação / Capacitação">Formação / Capacitação</option>
                      <option value="Monitoria / Acompanhamento">Monitoria / Acompanhamento</option>
                      <option value="Inspeção / Auditoria">Inspeção / Auditoria</option>
                      <option value="Seminário / Workshop">Seminário / Workshop / Conferência</option>
                      <option value="Trabalho de Campo">Trabalho de Campo / Missão</option>
                      <option value="Evento Académico">Evento Académico / Cerimónia</option>
                      <option value="Início e Fechamento de Atividade">Início e Fechamento de Atividade</option>
                      <option value="Data Comemorativa">Data Comemorativa</option>
                      <option value="Feriado Nacional">Feriado Nacional</option>
                      <option value="Feriado Institucional">Feriado Institucional</option>
                      <option value="Outra Atividade">Outra Atividade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Local da Realização
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                      placeholder="Ex: Sala de Reuniões, Auditório..."
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Título da Atividade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título / Designação da Atividade <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                    placeholder="Ex: Reunião de Planificação do 1º Semestre"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                </div>

                {/* Organizador / Setor Responsável */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organizador / Setor Responsável
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    placeholder="Ex: Direção Académica / DPEP / Repartição de RH"
                    value={newEvent.organizador}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, organizador: e.target.value })
                    }
                  />
                </div>

                {/* Agenda / Descrição do Trabalho a Realizar no Período */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descrição & Agenda de Trabalhos do Período
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    placeholder="Descreva detalhadamente a agenda, objetivos e metas a serem alcançadas neste período..."
                    value={newEvent.agenda}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, agenda: e.target.value })
                    }
                  />
                </div>

                {/* Público Alvo & Participantes */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Público-Alvo & Participantes Convocados
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      "Membros do Conselho de Direção (CD)",
                      "Membros de CR",
                      "Membros de CAS",
                      "Corpo Docente",
                      "Corpo Técnico Administrativo (CTA)",
                      "Pessoal fora do Quadro",
                      "Todos estudantes",
                      "Estudantes Femininos",
                      "Estudantes Masculinos",
                    ].map((participant) => (
                      <label
                        key={participant}
                        className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={newEvent.participants.includes(participant)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEvent({
                                ...newEvent,
                                participants: [
                                  ...newEvent.participants,
                                  participant,
                                ],
                              });
                            } else {
                              setNewEvent({
                                ...newEvent,
                                participants: newEvent.participants.filter(
                                  (p) => p !== participant,
                                ),
                              });
                            }
                          }}
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          {participant}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={!planStatus.aberta}
                    className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                      !planStatus.aberta
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                        : "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-200 active:scale-95"
                    }`}
                  >
                    <Save size={16} /> {!planStatus.aberta ? "Submissão Bloqueada (Período Encerrado)" : "Confirmar & Registar Agendamento"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal de Erro na Submissão */}
        {submissionError && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200"
            >
              <div className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">Erro na Submissão</h3>
                    <p className="text-[10px] text-red-100 font-medium">Restrição de conformidade institucional</p>
                  </div>
                </div>
                <button
                  onClick={() => setSubmissionError(null)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs font-bold text-slate-800 leading-relaxed bg-red-50 p-3.5 rounded-2xl border border-red-200">
                  {submissionError}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSubmissionError(null)}
                    className="bg-[#121c60] hover:bg-[#0e164d] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition active:scale-95"
                  >
                    Compreendi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Gestão do Período de Planificação e Relatórios */}
        {showPeriodoModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Gestão do Período de Planificação e Relatórios
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Controlo do calendário institucional (DPEP & Repartição de Planificação)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPeriodoModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  {saveSuccessMsg}
                </div>
              )}

              {/* Seção 1: Período de Planificação dos Setores */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-purple-100/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-purple-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Período de Planificação dos Setores
                    </h4>
                  </div>
                  {(() => {
                    const statusInfo = isPlanificacaoAberta(periodoPlanificacao);
                    return (
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm border ${
                          statusInfo.aberta
                            ? "bg-emerald-600 text-white border-emerald-700"
                            : "bg-red-600 text-white border-red-700"
                        }`}
                      >
                        {statusInfo.aberta ? "Período Aberto" : "Período Expirado"}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Ao ativar, o sistema abre o ciclo oficial de planificação por <strong>30 dias</strong> contados a partir da data de ativação (ou de 1 a 30 de Abril).
                </p>

                {/* Ciclo de 3 Meses do Plano de Atividades */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 block">
                    Trajetória do Ciclo do Plano de Atividades (3 Meses):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {getCicloPlanoEstrutura().map((estagio) => (
                      <div
                        key={estagio.mesNumero}
                        className="p-2.5 rounded-xl bg-white border border-purple-100 shadow-sm space-y-1 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            Mês {estagio.mesNumero} - {estagio.mesNome}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">
                          {estagio.fase}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {estagio.descricao}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingPeriodo(true);
                      await ativarContagem30DiasPlanificacao(currentUser);
                      setSaveSuccessMsg("Período de planificação aberto com sucesso por 30 dias a partir de hoje!");
                      setTimeout(() => setSaveSuccessMsg(""), 3000);
                      setIsSavingPeriodo(false);
                    }}
                    disabled={isSavingPeriodo}
                    className="flex-1 min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Unlock size={16} /> Abrir Período de Planificação (30 Dias)
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingPeriodo(true);
                      await savePeriodoPlanificacao({ status: "fechado" }, currentUser);
                      const resAuto = await executarSubmissaoAutomaticaSePrazoExpirado(periodoPlanificacao);
                      setSaveSuccessMsg(
                        `Período encerrado. ${resAuto.submetidas > 0 ? `${resAuto.submetidas} atividades submetidas automaticamente.` : ""}`
                      );
                      setTimeout(() => setSaveSuccessMsg(""), 3500);
                      setIsSavingPeriodo(false);
                    }}
                    disabled={isSavingPeriodo}
                    className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock size={16} /> Encerrar & Submeter Rascunhos
                  </button>
                </div>

                {/* Extensão de Prazo em 2 Fases (1ª Fase: +7 Dias | 2ª Fase: +5 Dias) */}
                <div className="pt-3 border-t border-purple-100/80 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-purple-700" />
                      Extensão de Prazo pelos Setores (DPEP / Planificação)
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100/80 px-2.5 py-0.5 rounded-md border border-purple-200">
                      {periodoPlanificacao?.extensaoFase2Usada
                        ? "Esgotado: 2ª Fase Usada (+12d total)"
                        : periodoPlanificacao?.extensaoFase1Usada
                        ? "1ª Fase Usada (+7d)"
                        : "Extensão Disponível"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    A extensão é permitida estritamente em duas fases: <strong>1ª Fase (+7 Dias)</strong> e <strong>2ª Fase (+5 Dias)</strong>. Após a segunda fase, não é possível estender mais o prazo.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!periodoPlanificacao) return;
                        setIsSavingPeriodo(true);
                        const res = await estenderPrazoPlanificacao(1, periodoPlanificacao, currentUser);
                        setSaveSuccessMsg(res.message);
                        setTimeout(() => setSaveSuccessMsg(""), 4000);
                        setIsSavingPeriodo(false);
                      }}
                      disabled={isSavingPeriodo || Boolean(periodoPlanificacao?.extensaoFase1Usada)}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm border ${
                        periodoPlanificacao?.extensaoFase1Usada
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-purple-700 hover:bg-purple-800 text-white border-purple-800"
                      }`}
                    >
                      <Clock size={14} /> 1ª Fase (+7 Dias)
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!periodoPlanificacao) return;
                        setIsSavingPeriodo(true);
                        const res = await estenderPrazoPlanificacao(2, periodoPlanificacao, currentUser);
                        setSaveSuccessMsg(res.message);
                        setTimeout(() => setSaveSuccessMsg(""), 4000);
                        setIsSavingPeriodo(false);
                      }}
                      disabled={
                        isSavingPeriodo ||
                        !periodoPlanificacao?.extensaoFase1Usada ||
                        Boolean(periodoPlanificacao?.extensaoFase2Usada)
                      }
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm border ${
                        periodoPlanificacao?.extensaoFase2Usada || !periodoPlanificacao?.extensaoFase1Usada
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
                      }`}
                    >
                      <Clock size={14} /> 2ª Fase (+5 Dias Final)
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!periodoPlanificacao) return;
                        if (!window.confirm("Tem certeza que deseja zerar todos os prazos e contadores de extensão (0 dias de extensão)?")) return;
                        setIsSavingPeriodo(true);
                        const res = await zerarTodosOsPrazos(currentUser);
                        setSaveSuccessMsg(res.message);
                        setTimeout(() => setSaveSuccessMsg(""), 4000);
                        setIsSavingPeriodo(false);
                      }}
                      disabled={isSavingPeriodo}
                      className="py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm border bg-slate-800 hover:bg-slate-900 text-white border-slate-900 col-span-1 sm:col-span-2"
                    >
                      <RotateCcw size={14} /> Zerar Todos os Prazos (0 Dias Extensão)
                    </button>
                  </div>

                  {periodoPlanificacao?.extensaoFase2Usada && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[10px] font-bold flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-600 shrink-0" />
                      O prazo atingiu o limite máximo de extensões (7 + 5 dias). Não é possível estender mais. Quando o prazo expirar, a submissão será automática.
                    </div>
                  )}
                </div>
              </div>

              {/* Seção 2: Período de Relatórios Semestrais */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Período de Relatórios Semestrais
                    </h4>
                  </div>
                  {(() => {
                    const statusRel = isRelatorioSemestralAberto(periodoPlanificacao);
                    return (
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm border ${
                          statusRel.aberto
                            ? "bg-emerald-600 text-white border-emerald-700"
                            : "bg-red-600 text-white border-red-700"
                        }`}
                      >
                        {statusRel.aberto ? "Período Aberto" : "Período Expirado"}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Regulamentarmente inicia no dia <strong>1 de Janeiro</strong> com a duração de{" "}
                  <strong>3 meses (até 31 de Março)</strong> para produção, compilação e aprovação do relatório.
                </p>

                {/* Ciclo de 3 Meses do Relatório */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                    Trajetória do Ciclo do Relatório (3 Meses):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {getCicloRelatorioEstrutura().map((estagio) => (
                      <div
                        key={estagio.mesNumero}
                        className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-sm space-y-1 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            Mês {estagio.mesNumero} - {estagio.mesNome}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">
                          {estagio.fase}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {estagio.descricao}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingPeriodo(true);
                      await ativarPeriodoRelatorio(currentUser);
                      setSaveSuccessMsg("Período de relatórios ativado para a janela regular (1 Jan a 31 Mar - 3 meses).");
                      setTimeout(() => setSaveSuccessMsg(""), 3000);
                      setIsSavingPeriodo(false);
                    }}
                    disabled={isSavingPeriodo}
                    className="flex-1 min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Unlock size={16} /> Abrir Período de Relatórios (3 Meses)
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingPeriodo(true);
                      await savePeriodoPlanificacao({ statusRelatorio: "fechado" }, currentUser);
                      setSaveSuccessMsg("Período de relatórios encerrado manualmente.");
                      setTimeout(() => setSaveSuccessMsg(""), 3000);
                      setIsSavingPeriodo(false);
                    }}
                    disabled={isSavingPeriodo}
                    className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock size={16} /> Encerrar Relatórios
                  </button>
                </div>
              </div>

              {/* Formulário Personalizado de Intervalo */}
              <form onSubmit={handleSavePeriodo} className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Ajuste Personalizado de Datas do Período
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Início da Planificação
                    </label>
                    <input
                      type="date"
                      value={periodoForm.dataInicioPlanificacao || ""}
                      onChange={(e) =>
                        setPeriodoForm({ ...periodoForm, dataInicioPlanificacao: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Fim da Planificação
                    </label>
                    <input
                      type="date"
                      value={periodoForm.dataFimPlanificacao || ""}
                      onChange={(e) =>
                        setPeriodoForm({ ...periodoForm, dataFimPlanificacao: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Início dos Relatórios
                    </label>
                    <input
                      type="date"
                      value={periodoForm.dataInicioRelatorioSemestral || ""}
                      onChange={(e) =>
                        setPeriodoForm({ ...periodoForm, dataInicioRelatorioSemestral: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Fim dos Relatórios
                    </label>
                    <input
                      type="date"
                      value={periodoForm.dataFimRelatorioSemestral || ""}
                      onChange={(e) =>
                        setPeriodoForm({ ...periodoForm, dataFimRelatorioSemestral: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Observações / Nota Institucional
                  </label>
                  <textarea
                    rows={2}
                    value={periodoForm.observacoes || ""}
                    onChange={(e) =>
                      setPeriodoForm({ ...periodoForm, observacoes: e.target.value })
                    }
                    placeholder="E.g., Período extraordinário aberto pela Direção Geral..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPeriodoModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPeriodo}
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save size={14} /> Guardar Configurações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
