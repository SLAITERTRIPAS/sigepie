import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface Indicator {
  id: string;
  name: string;
  category: 'Academico' | 'Financeiro' | 'Operacional' | 'Governacao';
  targetValue: number;
  currentValue: number;
  institutionId: string;
}

export const monitoringService = {
  async getIndicators(institutionId?: string): Promise<Indicator[]> {
    try {
      const snap = await getDocs(collection(db, "indicadores"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Indicator[];
      if (institutionId) {
        return items.filter(i => i.institutionId === institutionId || (i as any).instituicaoId === institutionId);
      }
      return items;
    } catch (e) {
      console.error("Erro ao carregar indicadores:", e);
      return [];
    }
  },
  async saveIndicator(indicator: Partial<Indicator>): Promise<void> {
    const id = indicator.id || `ind_${Date.now()}`;
    await setDoc(doc(db, "indicadores", id), { ...indicator, id, updatedAt: new Date().toISOString() }, { merge: true });
  },
  async deleteIndicator(id: string): Promise<void> {
    await deleteDoc(doc(db, "indicadores", id));
  }
};
