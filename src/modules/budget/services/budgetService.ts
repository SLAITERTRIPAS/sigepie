import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface BudgetItem {
  id: string;
  rubrica: string;
  amount: number;
  spent: number;
  institutionId: string;
  departamentoId?: string;
  ano: number;
}

export const budgetService = {
  async getBudgetItems(institutionId?: string): Promise<BudgetItem[]> {
    try {
      const snap = await getDocs(collection(db, "orcamento"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as BudgetItem[];
      if (institutionId) {
        return items.filter(b => b.institutionId === institutionId || (b as any).instituicaoId === institutionId);
      }
      return items;
    } catch (e) {
      console.error("Erro ao carregar orçamento:", e);
      return [];
    }
  },
  async saveBudgetItem(item: Partial<BudgetItem>): Promise<void> {
    const id = item.id || `bud_${Date.now()}`;
    await setDoc(doc(db, "orcamento", id), { ...item, id, updatedAt: new Date().toISOString() }, { merge: true });
  },
  async deleteBudgetItem(id: string): Promise<void> {
    await deleteDoc(doc(db, "orcamento", id));
  }
};
