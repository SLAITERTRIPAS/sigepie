import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { MatrixActivity, PeriodoPlanificacao } from "../types";
import { DEFAULT_PLANNING_PERIOD } from "../../../lib/planningPeriodService";

export const planningService = {
  async getActivities(institutionId?: string): Promise<MatrixActivity[]> {
    try {
      const snap = await getDocs(collection(db, "plano_actividades"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MatrixActivity[];
      if (institutionId) {
        return items.filter(item => !item.institutionId || item.institutionId === institutionId);
      }
      return items;
    } catch (e) {
      console.error("Erro ao carregar atividades:", e);
      return [];
    }
  },

  async saveActivity(activity: Partial<MatrixActivity>, institutionId?: string): Promise<string> {
    const id = activity.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const payload = {
      ...activity,
      id,
      institutionId: institutionId || activity.institutionId || "ISPS",
      createdAt: (activity as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "plano_actividades", id), payload, { merge: true });
    return id;
  },

  async deleteActivity(id: string): Promise<void> {
    await deleteDoc(doc(db, "plano_actividades", id));
  },

  async getPlanningPeriod(departamentoId?: string): Promise<PeriodoPlanificacao> {
    try {
      const docId = departamentoId
        ? `periodo_planificacao_${departamentoId.toLowerCase().replace(/\s+/g, "_")}`
        : "periodo_planificacao";
      const docSnap = await getDoc(doc(db, "configuracoes", docId));
      if (docSnap.exists()) {
        return { ...DEFAULT_PLANNING_PERIOD, ...(docSnap.data() as PeriodoPlanificacao) };
      }
      return DEFAULT_PLANNING_PERIOD;
    } catch (e) {
      console.error("Erro ao obter período de planificação:", e);
      return DEFAULT_PLANNING_PERIOD;
    }
  },

  async savePlanningPeriod(periodo: PeriodoPlanificacao, departamentoId?: string): Promise<void> {
    const docId = departamentoId
      ? `periodo_planificacao_${departamentoId.toLowerCase().replace(/\s+/g, "_")}`
      : "periodo_planificacao";
    await setDoc(doc(db, "configuracoes", docId), {
      ...periodo,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
};
