import { MatrixActivity, PeriodoPlanificacao } from "../../../types";

export type { MatrixActivity, PeriodoPlanificacao };

export interface PlanningFilterOptions {
  searchTerm?: string;
  departamento?: string;
  setor?: string;
  ano?: number;
  status?: string;
}

export interface PlanningServiceState {
  activities: MatrixActivity[];
  periodo: PeriodoPlanificacao | null;
  loading: boolean;
  error: string | null;
}
