import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'Universidade' | 'Instituto Superior' | 'Escola' | 'Empresa' | 'Instituição Pública';
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export const institutionService = {
  async getInstitutions(): Promise<Institution[]> {
    try {
      const snap = await getDocs(collection(db, "instituicoes"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Institution[];
    } catch (e) {
      console.error("Erro ao carregar instituições:", e);
      return [];
    }
  },
  async getInstitutionById(id: string): Promise<Institution | null> {
    try {
      const docSnap = await getDoc(doc(db, "instituicoes", id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Institution;
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  async saveInstitution(institution: Partial<Institution>): Promise<void> {
    const id = institution.id || `inst_${Date.now()}`;
    await setDoc(doc(db, "instituicoes", id), { ...institution, id, updatedAt: new Date().toISOString() }, { merge: true });
  },
  async deleteInstitution(id: string): Promise<void> {
    await deleteDoc(doc(db, "instituicoes", id));
  }
};
