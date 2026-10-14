import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { firestoreService } from "../../lib/firestoreService";
import { Event } from "../../types";

interface SystemAlert {
  id?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "holiday";
  startDate?: string;
  endDate?: string;
  active: boolean;
  createdAt?: any;
}

export default function HolidaysAlertsManagementView({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"holidays" | "alerts">("holidays");
  const [holidays, setHolidays] = useState<Event[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    title: "",
    date: "",
    type: "Feriado Nacional",
    message: "",
    alertType: "info",
    active: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const unsubEvents = firestoreService.events.subscribe((data: Event[]) => {
      // Filtrar apenas feriados globais/nacionais
      const globalHolidays = data.filter(
        (e) =>
          e.scope === "global" ||
          e.type === "Feriado Nacional" ||
          e.type === "Data Comemorativa"
      );
      setHolidays(globalHolidays);
    });

    const unsubAlerts = firestoreService.systemAlerts.subscribe((data: SystemAlert[]) => {
      setAlerts(data);
    });

    return () => {
      unsubEvents();
      unsubAlerts();
    };
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      if (activeTab === "holidays") {
        setFormData({
          title: item.title,
          date: item.date,
          type: item.type,
          scope: "global",
        });
      } else {
        setFormData({
          title: item.title,
          message: item.message,
          alertType: item.type,
          active: item.active,
          startDate: item.startDate || "",
          endDate: item.endDate || "",
        });
      }
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: activeTab === "holidays" ? "Feriado Nacional" : "info",
        message: "",
        alertType: "info",
        active: true,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === "holidays") {
        const holidayData = {
          title: formData.title,
          date: formData.date,
          type: formData.type,
          scope: "global",
          status: "active",
          startTime: "00:00",
          endTime: "23:59",
        };
        if (editingItem) {
          await firestoreService.events.update(editingItem.id, holidayData);
        } else {
          await firestoreService.events.add(holidayData);
        }
      } else {
        const alertData = {
          title: formData.title,
          message: formData.message,
          type: formData.alertType,
          active: formData.active,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        if (editingItem) {
          await firestoreService.systemAlerts.update(editingItem.id, alertData);
        } else {
          await firestoreService.systemAlerts.add(alertData);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este item?")) return;
    try {
      if (activeTab === "holidays") {
        await firestoreService.events.delete(id);
      } else {
        await firestoreService.systemAlerts.delete(id);
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Feriados e Alertas</h1>
          <p className="text-gray-500 mt-1">Configure feriados nacionais e alertas institucionais para todo o sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={20} />
          Novo {activeTab === "holidays" ? "Feriado" : "Alerta"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("holidays")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
            activeTab === "holidays" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar size={18} />
          Feriados Nacionais
          {activeTab === "holidays" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
            activeTab === "alerts" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell size={18} />
          Alertas Institucionais
          {activeTab === "alerts" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === "holidays" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Título</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                      Nenhum feriado configurado.
                    </td>
                  </tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {new Date(h.date).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">{h.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">
                          {h.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(h)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Alerta</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Período</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      Nenhum alerta configurado.
                    </td>
                  </tr>
                ) : (
                  alerts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${a.active ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className={`text-xs font-bold ${a.active ? "text-green-600" : "text-gray-400"}`}>
                            {a.active ? "ATIVO" : "INATIVO"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-gray-800 font-bold truncate">{a.title}</p>
                          <p className="text-gray-500 text-xs truncate">{a.message}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 uppercase text-[10px] font-black">
                        <span className={`px-2 py-0.5 rounded-sm border ${
                          a.type === "critical" ? "bg-red-50 text-red-700 border-red-200" :
                          a.type === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          a.type === "holiday" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                        {a.startDate ? new Date(a.startDate).toLocaleDateString("pt-PT") : "-"}
                        {a.endDate ? ` → ${new Date(a.endDate).toLocaleDateString("pt-PT")}` : ""}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(a)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id!)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingItem ? "Editar" : "Novo"} {activeTab === "holidays" ? "Feriado" : "Alerta"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">Título</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder={activeTab === "holidays" ? "Ex: Dia da Independência" : "Ex: Manutenção do Sistema"}
                  />
                </div>

                {activeTab === "holidays" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Data</label>
                        <input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Tipo</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Feriado Nacional">Feriado Nacional</option>
                          <option value="Data Comemorativa">Data Comemorativa</option>
                          <option value="Tolerância de Ponto">Tolerância de Ponto</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Mensagem do Alerta</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        placeholder="Descreva o alerta que todos os usuários verão..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Tipo de Alerta</label>
                        <select
                          value={formData.alertType}
                          onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="info">Informação</option>
                          <option value="warning">Aviso</option>
                          <option value="critical">Crítico</option>
                          <option value="holiday">Especial / Festivo</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Ativo?</label>
                        <div className="flex items-center gap-4 h-10 px-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.active}
                              onChange={() => setFormData({ ...formData, active: true })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm">Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={!formData.active}
                              onChange={() => setFormData({ ...formData, active: false })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm">Não</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Início</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Fim (Opcional)</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Clock className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}
                    {editingItem ? "Atualizar" : "Salvar"}
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
