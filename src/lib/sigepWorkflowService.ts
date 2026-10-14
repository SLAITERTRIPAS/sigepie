/**
 * Serviço de Workflow Institucional e Especificação Funcional do SIGEP
 * Define os estados do processo, regras de autonomia por departamento,
 * supervisão por direção, consolidação pela planificação, PEF pelo DPEP
 * e filtragem rigorosa para a UGEA (excluindo ajudas de custo e subsídios).
 */

export const SIGEP_WORKFLOW_STATES = {
  EM_ELABORACAO: "Em elaboração",
  SUBMETIDO_DIRECAO: "Submetido à direção",
  DEVOLVIDO_CORRECAO: "Devolvido para correção",
  VALIDADO_DIRECAO: "Validado pela direção",
  EM_CONSOLIDACAO: "Em consolidação institucional",
  PLANO_INSTITUCIONAL: "Plano Institucional consolidado",
  ANALISE_DPEP: "Em análise pelo Chefe do DPEP",
  PEF_ELABORADO: "PEF elaborado",
  SUBMETIDO_APROVACAO: "Submetido para aprovação",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

/**
 * Verifica se um departamento ou atividade é elegível para a UGEA.
 * A UGEA recebe apenas o Plano de Aquisições e Contratações consolidado e aprovado,
 * excluindo despesas de funcionamento, ajudas de custo, subsídios ou despesas semelhantes.
 */
export const isEligibleForUGEA = (activityOrItem: any): boolean => {
  if (!activityOrItem) return false;

  const textBlob = JSON.stringify(activityOrItem).toLowerCase();

  // Excluir estritamente ajudas de custo, subsídios e despesas que não sejam aquisições/contratações
  if (
    textBlob.includes("ajuda de custo") ||
    textBlob.includes("ajudas de custo") ||
    textBlob.includes("subsídio") ||
    textBlob.includes("subsidio") ||
    textBlob.includes("diárias") ||
    textBlob.includes("diarias") ||
    textBlob.includes("capítulo 11") ||
    textBlob.includes("capitulo 11")
  ) {
    return false;
  }

  // Verificar se possui rubricas de aquisição de bens ou serviços (Capítulos 22, 23, 24, etc.)
  if (Array.isArray(activityOrItem.rubricas)) {
    const hasValidAcquisition = activityOrItem.rubricas.some((r: any) => {
      const rName = String(r.rubrica || r.nomeRubrica || r.code || "").toLowerCase();
      const rVal = Number(r.valorTotal || r.precoUnitario || r.valor || 0);
      if (rVal <= 0) return false;
      if (rName.includes("ajuda") || rName.includes("subsidio") || rName.startsWith("11")) {
        return false;
      }
      return true;
    });
    if (!hasValidAcquisition) return false;
  }

  return true;
};

/**
 * Valida se um utilizador tem permissão para aceder à unidade orgânica (Autonomia rigorosa).
 */
export const canAccessUnitArea = (user: any, targetDepartment: string, targetDirection: string): boolean => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  if (role.includes("admin") || role.includes("proprietario") || user.isOwner || user.isSuperBoss) {
    return true;
  }

  const uDept = String(user.departamento || "").toLowerCase().trim();
  const uDir = String(user.direcao || "").toLowerCase().trim();
  const tDept = String(targetDepartment || "").toLowerCase().trim();
  const tDir = String(targetDirection || "").toLowerCase().trim();

  // Direção pode aceder aos departamentos da sua alçada
  if (role.includes("diretor") || role.includes("director")) {
    if (uDir && tDir && (uDir === tDir || tDir.includes(uDir) || uDir.includes(tDir))) {
      return true;
    }
  }

  // Departamento só acede ao seu próprio departamento
  if (uDept && tDept) {
    return uDept === tDept || tDept.includes(uDept) || uDept.includes(tDept);
  }

  return false;
};
