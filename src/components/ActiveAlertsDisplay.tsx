import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Info, 
  Calendar, 
  X,
  AlertCircle,
  Bell
} from "lucide-react";
import { db } from "../lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  where 
} from "firebase/firestore";
import { SystemAlert } from "../types";
import { motion, AnimatePresence } from "motion/react";

export const ActiveAlertsDisplay: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<SystemAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const q = query(
      collection(db, "system_alerts"),
      where("isActive", "==", true),
      where("startDate", "<=", today)
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SystemAlert));
      // Filtro adicional para endDate no lado do cliente (Firestore where complexo)
      const valid = list.filter(a => !a.endDate || a.endDate >= today);
      setActiveAlerts(valid);
    });
  }, []);

  const handleDismiss = (id: string) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const visibleAlerts = activeAlerts.filter(a => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-md pointer-events-none">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative p-5 rounded-[2rem] shadow-2xl border flex gap-4 overflow-hidden ${
              alert.type === 'crítico' ? 'bg-red-600 border-red-400 text-white' :
              alert.type === 'aviso' ? 'bg-amber-500 border-amber-300 text-slate-950' :
              alert.type === 'feriado' ? 'bg-emerald-600 border-emerald-400 text-white' :
              'bg-blue-700 border-blue-400 text-white'
            }`}
          >
            {/* Background Icon Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
               {alert.type === 'crítico' ? <AlertTriangle size={120} /> :
                alert.type === 'aviso' ? <AlertCircle size={120} /> :
                alert.type === 'feriado' ? <Calendar size={120} /> :
                <Bell size={120} />}
            </div>

            <div className={`p-3 rounded-2xl shrink-0 ${
              alert.type === 'aviso' ? 'bg-white/20' : 'bg-black/10'
            }`}>
              {alert.type === 'crítico' ? <AlertTriangle size={24} /> :
               alert.type === 'aviso' ? <AlertCircle size={24} /> :
               alert.type === 'feriado' ? <Calendar size={24} /> :
               <Info size={24} />}
            </div>

            <div className="space-y-1 relative z-10">
              <h4 className="text-sm font-black uppercase tracking-widest">{alert.title}</h4>
              <p className="text-xs font-bold leading-relaxed opacity-90">{alert.message}</p>
              {alert.type === 'feriado' && (
                <div className="pt-1">
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">Comunicado Institucional</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleDismiss(alert.id)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
