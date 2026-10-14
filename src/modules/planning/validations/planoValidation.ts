import { MatrixActivity } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateActivity = (activity: Partial<MatrixActivity>): ValidationResult => {
  const errors: string[] = [];

  const title = activity.titulo || activity.nomeActividade || activity.nome;
  if (!title || String(title).trim() === "") {
    errors.push("O título ou nome da atividade é obrigatório.");
  }

  const objetivo = activity.objetivoActividade || activity.objetivo;
  if (!objetivo || String(objetivo).trim() === "") {
    errors.push("O objetivo da atividade é obrigatório.");
  }

  const meses = activity.mesesRealizacao || activity.mesRealizacao || activity.mes;
  if (!meses || (Array.isArray(meses) && meses.length === 0)) {
    errors.push("Indique pelo menos um mês ou período de realização.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
