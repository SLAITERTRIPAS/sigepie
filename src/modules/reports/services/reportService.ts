import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface InstitutionalReport {
  id: string;
  title: string;
  type: 'Trimestral' | 'Anual' | 'Orcamental' | 'Auditoria';
  institutionId: string;
  status: 'Rascunho' | 'Submetido' | 'Aprovado';
  content?: string;
}

export const reportService = {
  async getReports(institutionId?: string): Promise<InstitutionalReport[]> {
    try {
      const snap = await getDocs(collection(db, "relatorios"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as InstitutionalReport[];
      if (institutionId) {
        return items.filter(r => r.institutionId === institutionId || (r as any).instituicaoId === institutionId);
      }
      return items;
    } catch (e) {
      console.error("Erro ao carregar relatórios:", e);
      return [];
    }
  },
  async saveReport(report: Partial<InstitutionalReport>): Promise<void> {
    const id = report.id || `rep_${Date.now()}`;
    await setDoc(doc(db, "relatorios", id), { ...report, id, updatedAt: new Date().toISOString() }, { merge: true });
  },
  async deleteReport(id: string): Promise<void> {
    await deleteDoc(doc(db, "relatorios", id));
  }
};
