import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Info, 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Clock,
  AlertCircle
} from "lucide-react";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc 
} from "firebase/firestore";
import { SystemAlert } from "../types";

export const SystemAlertsAdmin: React.FC<{ user: any }> = ({ user }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "informativo" as SystemAlert["type"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    const q = query(collection(db, "system_alerts"));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SystemAlert));
      setAlerts(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "system_alerts"), {
        ...formData,
        isActive: true,
        createdBy: user?.nome || user?.name || "Admin",
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setFormData({
        title: "",
        message: "",
        type: "informativo",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    } catch (err) {
      console.error("Erro ao criar alerta:", err);
      alert("Erro ao criar alerta.");
    }
  };

  const toggleStatus = async (alert: SystemAlert) => {
    try {
      await updateDoc(doc(db, "system_alerts", alert.id), {
        isActive: !alert.isActive,
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este alerta?")) return;
    try {
      await deleteDoc(doc(db, "system_alerts", id));
    } catch (err) {
      console.error("Erro ao eliminar alerta:", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Alertas do Sistema</h2>
          <p className="text-xs font-bold text-slate-400 tracking-widest mt-1 uppercase">Configure avisos e feriados institucionais</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#121c60] hover:bg-[#0e164d] text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-widest transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} />
          <span>Novo Alerta</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Criar Novo Alerta</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 transition">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Título do Alerta</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Ex: Feriado Nacional - 25 de Junho"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tipo de Alerta</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="informativo">Informativo (Azul)</option>
                <option value="aviso">Aviso (Amarelo)</option>
                <option value="crítico">Crítico (Vermelho)</option>
                <option value="feriado">Feriado (Verde)</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mensagem Detalhada</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Descreva os detalhes do alerta..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Início da Exibição</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fim da Exibição (Vencimento)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#121c60] text-white rounded-xl font-black text-xs tracking-widest shadow-lg hover:brightness-110 transition active:scale-95"
              >
                Publicar Alerta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
            <AlertCircle size={40} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">Nenhum alerta configurado no momento.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`bg-white border-l-8 p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                alert.type === 'crítico' ? 'border-l-red-600' :
                alert.type === 'aviso' ? 'border-l-amber-500' :
                alert.type === 'feriado' ? 'border-l-emerald-500' :
                'border-l-blue-600'
              }`}
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  alert.type === 'crítico' ? 'bg-red-50 text-red-600' :
                  alert.type === 'aviso' ? 'bg-amber-50 text-amber-600' :
                  alert.type === 'feriado' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {alert.type === 'crítico' ? <AlertTriangle size={24} /> :
                   alert.type === 'aviso' ? <AlertCircle size={24} /> :
                   alert.type === 'feriado' ? <Calendar size={24} /> :
                   <Info size={24} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 tracking-tight">{alert.title}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      alert.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {alert.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{alert.message}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {alert.startDate} até {alert.endDate}</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Criado por: {alert.createdBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <button
                  onClick={() => toggleStatus(alert)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    alert.isActive 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {alert.isActive ? <X size={14} /> : <Check size={14} />}
                  <span>{alert.isActive ? 'Desativar' : 'Ativar'}</span>
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all"
                >
                  <Trash2 size={14} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
