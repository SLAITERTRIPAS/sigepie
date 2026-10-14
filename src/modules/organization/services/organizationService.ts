import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface OrgUnit {
  id: string;
  name: string;
  type: 'Orgao' | 'Direcao' | 'Departamento' | 'Reparticao' | 'Setor' | 'Faculdade' | 'Centro';
  institutionId: string;
  parentId?: string;
  chefeId?: string;
}

export const organizationService = {
  async getOrgUnits(institutionId?: string): Promise<OrgUnit[]> {
    try {
      const snap = await getDocs(collection(db, "estruturas"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as OrgUnit[];
      if (institutionId) {
        return items.filter(u => u.institutionId === institutionId || (u as any).instituicaoId === institutionId);
      }
      return items;
    } catch (e) {
      console.error("Erro ao carregar estruturas:", e);
      return [];
    }
  },
  async saveOrgUnit(unit: Partial<OrgUnit>): Promise<void> {
    const id = unit.id || `org_${Date.now()}`;
    await setDoc(doc(db, "estruturas", id), { ...unit, id, updatedAt: new Date().toISOString() }, { merge: true });
  },
  async deleteOrgUnit(id: string): Promise<void> {
    await deleteDoc(doc(db, "estruturas", id));
  }
};
