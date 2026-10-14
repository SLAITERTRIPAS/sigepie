import { normalize as n, isMatch } from "./utils";
import { DEPARTAMENTOS, REPARTICOES, SETORES } from "../constants/formOptions";

// Departments that do not have strict internal sector structure
const UNSTRUCTURED_DEPTS = [
  "Gabinete do Diretor-Geral",
  "Secretaria Executiva",
  "Unidade Gestora e Executora de Aquisições",
  "Departamento de Cooperação e Relações Exteriores",
  "Departamento de Controlo Técnico e de Qualidade",
  "Departamento Jurídico",
];

export const isStructuredDept = (deptName: string) => {
  return !UNSTRUCTURED_DEPTS.includes(deptName);
};

export const canAccessArea = (
  user: any,
  targetDir: string,
  targetDept: string,
  targetSector: string,
  activity?: any,
) => {
  if (!user) return false;
  
  // Se a actividade possui partilha manual explícita com o utilizador ou com a sua área de alçada,
  // permitimos o acesso de forma soberana e manual!
  if (activity && Array.isArray(activity.sharedWith)) {
    const uEmail = String(user.email || "").toLowerCase().trim();
    const uId = user.uid || user.id;
    if (activity.sharedWith.includes(uEmail) || (uId && activity.sharedWith.includes(uId))) {
      return true;
    }
    const uArea = String(user.setor || user.reparticao || user.departamento || user.direcao || "").toLowerCase().trim();
    if (uArea && activity.sharedWith.some((area: any) => String(area).toLowerCase().trim() === uArea)) {
      return true;
    }
  }

  // Super Boss, Admin Geral e Administrador da Instituição podem ver tudo na sua alçada
  if (isSuperBossUser(user) || isInstitutionalAdminUser(user)) {
    return true;
  }

  const role = String(user.role || "").toLowerCase();
  const isSysAdmin =
    role === "admin" ||
    role === "administrador" ||
    role === "administrador do sistema" ||
    role === "proprietario" ||
    role === "proprietário" ||
    user.isOwner === true ||
    String(user.categoria || "").toLowerCase().includes("programador");

  if (isSysAdmin) return true;

  const norm = (s: string) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\b(departamento|depto|dep|reparticao|rep|setor|sector|direcao|direccao|de|do|da|dos|das)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // Isolamento soberano da UGEA em relação ao Diretor-Geral e DICOSAFA:
  const isActUgea = activity ? (
    norm(activity.departamento || "").includes("ugea") ||
    norm(activity.solicitante || "").includes("ugea") ||
    norm(activity.unidade || "").includes("ugea") ||
    norm(activity.orgao || "").includes("ugea") ||
    norm(activity.origem || "").includes("ugea") ||
    norm(activity.setor || "").includes("ugea") ||
    norm(activity.reparticao || "").includes("ugea") ||
    String(activity.codigo || activity.codigoActividade || activity.numProcesso || "").toLowerCase().includes("ugea")
  ) : false;

  const uDeptRaw = norm(user.departamento || user.setor || user.reparticao || user.direcao || "");
  const isUserUgea = uDeptRaw.includes("ugea") || uDeptRaw.includes("gestora executora") || uDeptRaw.includes("aquisicoes");
  const isUserDG = uDeptRaw.includes("diretor-geral") || uDeptRaw.includes("diretor geral") || uDeptRaw.includes("gdg");
  const isUserDicosafa = uDeptRaw.includes("dicosafa") || uDeptRaw.includes("dicossafa");

  if (isActUgea && !isUserUgea && (isUserDG || isUserDicosafa)) {
    return false;
  }

  const userRoleStr = String(user.title || user.cargo || user.cargoChefia || "").toLowerCase();
  const userRoles = getRoles(userRoleStr);

  let uDir = norm(user.direcao || "");
  const uDept = norm(user.departamento || "");
  const uSector = norm(user.setor || user.reparticao || "");

  let tDir = norm(targetDir || "");
  let tDept = norm(targetDept || "");
  let tSector = norm(targetSector || "");

  // Se a actividade for fornecida, extraímos os campos de destino de forma exaustiva para não deixar passar dados vazios!
  if (activity) {
    if (!tDir) {
      tDir = norm(activity.direcao || activity.direccao || activity.unidadeOrganica || activity.unidadeCentral || "");
    }
    if (!tDept) {
      tDept = norm(activity.departamento || activity.solicitante || activity.unidade || activity.orgao || activity.origem || "");
    }
    if (!tSector) {
      tSector = norm(activity.setor || activity.sector || activity.reparticao || "");
    }
  }

  // Resolve a direção do utilizador (uDir) com base no departamento do utilizador (uDept) se uDir for vazio
  if (!uDir && uDept) {
    for (const [dirKey, deps] of Object.entries(DEPARTAMENTOS)) {
      if (deps.some(dep => {
        const normDep = norm(dep);
        return normDep === uDept || normDep.includes(uDept) || uDept.includes(normDep) || (uDept === "ugea" && (normDep.includes("gestora") || normDep.includes("aquisicoes") || normDep.includes("aquisiçoes")));
      })) {
        uDir = norm(dirKey);
        break;
      }
    }
  }

  // Resolve a direção de destino (tDir) com base no departamento de destino (tDept) se tDir for vazio
  if (!tDir && tDept) {
    for (const [dirKey, deps] of Object.entries(DEPARTAMENTOS)) {
      if (deps.some(dep => {
        const normDep = norm(dep);
        return normDep === tDept || normDep.includes(tDept) || tDept.includes(normDep) || (tDept === "ugea" && (normDep.includes("gestora") || normDep.includes("aquisicoes") || normDep.includes("aquisiçoes")));
      })) {
        tDir = norm(dirKey);
        break;
      }
    }
  }

  // Família Independente por Direção (Filho)
  if (uDir && tDir) {
    const dirMatch = tDir.includes(uDir) || uDir.includes(tDir) || tDir === uDir;
    if (!dirMatch) return false; // Direção diferente -> Família independente, bloqueio total
  }

  // Se é Diretor de Direção ou Chefe do GDG (supervisiona todos os departamentos da sua Direção / Gabinete do Diretor-Geral)
  if (userRoles.isDC || userRoles.isGDG) {
    if (activity && (!activity.submetido || activity.status === "rascunho" || activity.status === "draft" || activity.status === "setorial")) {
      return isActivityFromUserSector(activity, user);
    }
    return true;
  }

  // Família Independente por Departamento (Neto)
  if (uDept && tDept) {
    const deptMatch = tDept.includes(uDept) || uDept.includes(tDept) || tDept === uDept;
    if (!deptMatch) return false; // Departamento diferente -> Isolado
  }

  // Se é Chefe de Departamento
  if (userRoles.isCD) {
    if (uDept && tDept) {
      return tDept.includes(uDept) || uDept.includes(tDept) || tDept === uDept;
    }
    return true;
  }

  // Família Independente por Setor / Repartição (Bisneto)
  if (uSector && tSector) {
    const sectorMatch = tSector.includes(uSector) || uSector.includes(tSector) || tSector === uSector;
    if (!sectorMatch) return false;
  }

  return true;
};

/**
 * Normaliza e limpa designações de áreas orgânicas para comparação fiável.
 */
export const cleanAreaText = (s: any): string =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(departamento|depto|dep|reparticao|rep|setor|sector|direcao|direccao|gabinete|unidade|de|do|da|dos|das|servico|servicos)\b/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .trim();

/**
 * Obtém a lista de todas as designações de setor/repartição associadas ao utilizador.
 */
export const getUserSectors = (user: any): string[] => {
  if (!user) return [];
  const list: string[] = [];
  if (user.setor) list.push(String(user.setor));
  if (user.sector) list.push(String(user.sector));
  if (user.reparticao) list.push(String(user.reparticao));
  if (user.seccao) list.push(String(user.seccao));
  if (user.areaDeAfetacao && user.areaDeAfetacao !== "Nenhum" && user.areaDeAfetacao !== "-") {
    list.push(String(user.areaDeAfetacao));
  }
  if (Array.isArray(user.setoresAtribuidos)) {
    user.setoresAtribuidos.forEach((s: any) => {
      if (s) list.push(String(s));
    });
  }
  return Array.from(new Set(list));
};

/**
 * Obtém a lista de todas as designações de setor/área presentes numa atividade.
 */
export const getActivitySectors = (activity: any): string[] => {
  if (!activity) return [];
  const list: string[] = [];
  if (activity.setor) list.push(String(activity.setor));
  if (activity.sector) list.push(String(activity.sector));
  if (activity.reparticao) list.push(String(activity.reparticao));
  if (activity.seccao) list.push(String(activity.seccao));
  if (activity.origem) list.push(String(activity.origem));
  if (activity.setorOrigin) list.push(String(activity.setorOrigin));
  if (activity.setorCriador) list.push(String(activity.setorCriador));
  if (activity.submetidoPorSetor) list.push(String(activity.submetidoPorSetor));
  if (activity.solicitante) list.push(String(activity.solicitante));
  if (activity.area) list.push(String(activity.area));
  return Array.from(new Set(list));
};

/**
 * Compara dois nomes de setor ou repartição com rigor estrito (correspondência exata ou singular/plural exato).
 */
export const compareSectorsMatch = (secA: string, secB: string): boolean => {
  if (!secA || !secB) return false;
  const rawA = String(secA).toLowerCase().trim();
  const rawB = String(secB).toLowerCase().trim();
  if (rawA === rawB) return true;

  const cleanA = cleanAreaText(secA).replace(/\s+/g, "");
  const cleanB = cleanAreaText(secB).replace(/\s+/g, "");
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;

  // Tolerância apenas singular / plural exato (ex.: transporte / transportes)
  const stemA = cleanA.endsWith("s") ? cleanA.slice(0, -1) : cleanA;
  const stemB = cleanB.endsWith("s") ? cleanB.slice(0, -1) : cleanB;
  if (stemA === stemB && stemA.length >= 3) return true;

  return false;
};

/**
 * Verifica com rigor estrito se uma actividade pertence ao setor ou departamento do utilizador logado.
 * Impede estritamente a mistura de dados entre setores diferentes.
 */
export const isActivityFromUserSector = (activity: any, user: any): boolean => {
  if (!activity || !user) return false;

  // 1. Criador ou autor direto tem acesso soberano à sua própria atividade
  const creatorEmail = String(activity.createdBy || activity.emailCriador || activity.autorEmail || activity.responsavelEmail || "").toLowerCase().trim();
  const uEmail = String(user.email || "").toLowerCase().trim();
  if (creatorEmail && uEmail && creatorEmail === uEmail) return true;

  const creatorName = String(activity.createdByName || activity.autor || activity.autorNome || activity.planificadoPor || activity.criadoPor || "").toLowerCase().trim();
  const uName = String(user.nome || user.name || user.displayName || "").toLowerCase().trim();
  if (creatorName && uName && (creatorName === uName || creatorName.includes(uName) || uName.includes(creatorName))) return true;

  const uId = String(user.uid || user.id || "").trim();
  const actUserId = String(activity.userId || activity.userUid || activity.uid || "").trim();
  if (uId && actUserId && uId === actUserId) return true;

  const uNuit = String(user.nuit || "").trim();
  const actNuit = String(activity.nuit || activity.nuitCriador || "").trim();
  if (uNuit && actNuit && uNuit === actNuit) return true;

  // 2. Administradores Globais, Super Boss e Administrador da Instituição têm acesso institucional global
  if (isSuperBossUser(user) || isInstitutionalAdminUser(user)) return true;
  const role = String(user.role || "").toLowerCase();
  const isSysAdmin = role === "admin" || role === "administrador" || role === "proprietario" || user.isOwner === true;
  if (isSysAdmin) return true;

  // 3. Isolamento de competências da UGEA
  const aDept = cleanAreaText(activity.departamento || activity.solicitante || activity.unidade || activity.orgao || "");
  const aSec = cleanAreaText(activity.setor || activity.sector || activity.reparticao || "");
  const aOrig = cleanAreaText(activity.origem || activity.setorOrigin || activity.setorCriador || activity.unidadeOrganica || "");

  const uDept = cleanAreaText(user.departamento || "");
  const uSec = cleanAreaText(user.setor || user.sector || user.reparticao || "");
  const uArea = cleanAreaText(user.areaDeAfetacao || "");

  const isActUgea = aDept.includes("ugea") || aSec.includes("ugea") || aOrig.includes("ugea") || aDept.includes("aquisicoes") || aSec.includes("aquisicoes");
  const isUserUgea = uDept.includes("ugea") || uSec.includes("ugea") || uArea.includes("ugea") || uDept.includes("aquisicoes") || uSec.includes("aquisicoes");
  if (isActUgea || isUserUgea) {
    return isActUgea === isUserUgea;
  }

  // 4. Chefes de Direção / GDG / Departamento têm acesso à sua respetiva alçada organica
  const userRoles = getRoles(user.title || user.cargo || user.cargoChefia || "");
  if (userRoles.isDC || userRoles.isGDG) {
    const uDir = cleanAreaText(user.direcao || "");
    const aDir = cleanAreaText(activity.direcao || activity.direccao || "");
    if (uDir && aDir && (uDir === aDir || aDir.includes(uDir) || uDir.includes(aDir))) return true;
  }
  if (userRoles.isCD) {
    const uDeptVal = cleanAreaText(user.departamento || "");
    const aDeptVal = cleanAreaText(activity.departamento || "");
    if (uDeptVal && aDeptVal && (uDeptVal === aDeptVal || aDeptVal.includes(uDeptVal) || uDeptVal.includes(aDeptVal))) return true;
  }

  // 5. REGRA ESTRITA POR SETOR LOGADO: O colaborador comum / chefe de setor só vê as atividades do seu setor exato
  const userSectorList = getUserSectors(user);
  const actSectorList = getActivitySectors(activity);

  if (userSectorList.length > 0 && actSectorList.length > 0) {
    for (const uS of userSectorList) {
      for (const aS of actSectorList) {
        if (compareSectorsMatch(uS, aS)) {
          return true;
        }
      }
    }
  }

  // 6. Compartilhamento manual explícito
  if (Array.isArray(activity.sharedWith)) {
    if (uEmail && activity.sharedWith.includes(uEmail)) return true;
    for (const uS of userSectorList) {
      if (activity.sharedWith.some((sw: any) => compareSectorsMatch(String(sw), uS))) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Valida se o utilizador tem permissão para eliminar uma actividade.
 */
export const canUserDeleteActivity = (user: any, activity: any): boolean => {
  if (!user || !activity) return false;

  // Super Boss / Admin pode gerir tudo
  if (isSuperBossUser(user)) return true;

  const role = String(user.role || "").toLowerCase();
  const isSysAdmin =
    role === "admin" ||
    role === "administrador" ||
    role === "administrador do sistema" ||
    role === "administrador de sistema" ||
    role === "proprietario" ||
    role === "proprietário" ||
    user.isOwner === true;

  if (isSysAdmin) return true;

  const uEmail = String(user.email || "").toLowerCase().trim();
  const uId = String(user.uid || user.id || "").trim();
  const uNuit = String(user.nuit || "").trim();
  const uName = String(user.nome || user.name || user.displayName || "").toLowerCase().trim();

  const creatorEmail = String(activity.createdBy || activity.emailCriador || activity.autorEmail || "").toLowerCase().trim();
  const actUserId = String(activity.userId || activity.userUid || activity.uid || "").trim();
  const creatorNuit = String(activity.nuit || activity.nuitCriador || "").trim();
  const creatorName = String(activity.createdByName || activity.autor || activity.autorNome || activity.planificadoPor || activity.criadoPor || "").toLowerCase().trim();

  const isCreator =
    (creatorEmail && uEmail && (creatorEmail === uEmail || creatorEmail.includes(uEmail) || uEmail.includes(creatorEmail))) ||
    (actUserId && uId && actUserId === uId) ||
    (creatorNuit && uNuit && creatorNuit === uNuit) ||
    (creatorName && uName && creatorName === uName);

  if (isCreator) {
    // Criador pode eliminar a sua actividade individual enquanto não estiver aprovada/institucional
    if (activity.statusAprovacao === "aprovada" || (activity.status as any) === "institucional") {
      return false;
    }
    return true;
  }

  return false;
};

/**
 * Valida se o utilizador tem permissão para editar uma actividade.
 */
export const canUserEditActivity = (user: any, activity: any): boolean => {
  if (!user || !activity) return false;

  // Atividade já institucional / homologada só pode ser editada por Admin/SuperBoss
  if (
    activity.statusAprovacao === "aprovada" ||
    (activity.status as any) === "institucional"
  ) {
    return isSuperBossUser(user);
  }

  if (isSuperBossUser(user)) return true;

  const role = String(user.role || "").toLowerCase();
  const isSysAdmin =
    role === "admin" ||
    role === "administrador" ||
    role === "administrador do sistema" ||
    role === "administrador de sistema" ||
    role === "proprietario" ||
    role === "proprietário" ||
    user.isOwner === true;

  if (isSysAdmin) return true;

  const uEmail = String(user.email || "").toLowerCase().trim();
  const uId = String(user.uid || user.id || "").trim();
  const uNuit = String(user.nuit || "").trim();
  const uName = String(user.nome || user.name || user.displayName || "").toLowerCase().trim();

  const creatorEmail = String(activity.createdBy || activity.emailCriador || activity.autorEmail || "").toLowerCase().trim();
  const actUserId = String(activity.userId || activity.userUid || activity.uid || "").trim();
  const creatorNuit = String(activity.nuit || activity.nuitCriador || "").trim();
  const creatorName = String(activity.createdByName || activity.autor || activity.autorNome || activity.planificadoPor || activity.criadoPor || "").toLowerCase().trim();

  const isCreator =
    (creatorEmail && uEmail && (creatorEmail === uEmail || creatorEmail.includes(uEmail) || uEmail.includes(creatorEmail))) ||
    (actUserId && uId && actUserId === uId) ||
    (creatorNuit && uNuit && creatorNuit === uNuit) ||
    (creatorName && uName && creatorName === uName);

  if (isCreator) return true;

  // Se a atividade já foi submetida pelo criador ao superior para análise / consolidação:
  if (activity.submetido) {
    const roles = getRoles(user.title || user.cargo || user.cargoChefia || "");
    if (roles.isBoss || roles.isDG || roles.isDC || roles.isCD || roles.isCR) {
      if (canAccessArea(user, activity.direcao || "", activity.departamento || "", activity.setor || activity.reparticao || "", activity)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Helper to get the numeric level of an activity status.
 */
export const getActivityStatusLevel = (status: string): number => {
  const s = String(status || "").toLowerCase().trim();
  if (s === "reparticao") return 2;
  if (s === "departamento") return 3;
  if (s === "direcao") return 4;
  if (s === "planificacao" || s === "dpep_chefe" || s === "meritos") return 5;
  if (s === "institucional") return 6;
  return 1; // setorial, planeada, draft, etc.
};

/**
 * Helper to get the required status level for a user to see activities.
 */
export const getUserRequiredStatusLevel = (user: any): number => {
  if (!user) return 1;
  const title = String(user.title || user.cargo || user.cargoChefia || "").toLowerCase();
  const dept = String(user.departamento || "").toLowerCase();
  const role = String(user.role || "").toLowerCase();

  const isDPEP =
    title.includes("dpep") ||
    dept.includes("dpep") ||
    role.includes("dpep") ||
    title.includes("planificação") ||
    dept.includes("planificação") ||
    role.includes("planificação") ||
    title.includes("planeamento") ||
    dept.includes("planeamento") ||
    role.includes("planeamento");

  const roles = getRoles(user.title || user.cargo || user.cargoChefia || "");

  if (roles.isDG || isDPEP) {
    return 5; // Top superiors: only see activities that have reached the "planificacao" status
  }
  if (roles.isDC) {
    return 4; // Diretores: only see activities that have reached the "direcao" status
  }
  if (roles.isCD) {
    return 3; // Chefes de Departamento: only see activities that have reached the "departamento" status
  }
  if (roles.isCR) {
    return 2; // Chefes de Repartição: only see activities that have reached the "reparticao" status
  }
  return 1; // Normal users can see activities at any level (including setorial)
};

/**
 * Filters activities based on user permissions.
 */
export const getAuthorizedActivities = (activities: any[], user: any) => {
  if (!activities) return [];

  // Filtrar actividades inválidas (amostras em branco, placeholders sem nome/objectivo/rubricas)
  const validActivities = activities.filter((a) => {
    if (!a) return false;
    const name = String(
      a.nomeActividade ||
        a.designacao ||
        a.designacaoActividade ||
        a.title ||
        a.descricao ||
        a.actividade ||
        "",
    ).trim();

    if (
      !name ||
      name === "-" ||
      name === "--" ||
      name === "---" ||
      name.toLowerCase() === "sem nome" ||
      name.toLowerCase() === "sem título" ||
      name.toLowerCase() === "sem designação"
    ) {
      const obj = String(a.objetivo || a.objetivoActividade || "").trim();
      const hasValidObj = obj && obj !== "-" && obj !== "--" && obj !== "---";
      const hasRubricas =
        Array.isArray(a.rubricas) &&
        a.rubricas.some((r: any) => {
          const rName = String(r.rubrica || "").trim().toLowerCase();
          const rNec = String(r.necessidade || "").trim().toLowerCase();
          const rVal = Number(r.valorTotal || r.precoUnitario || 0);
          return (
            rName &&
            rName !== "sem rubrica" &&
            rName !== "sem rubricas" &&
            rName !== "-" &&
            (rNec !== "sem necessidade" || rVal > 0)
          );
        });

      if (!hasValidObj && !hasRubricas) {
        return false;
      }
    }

    const dept = String(a.departamento || a.setor || "").trim().toLowerCase();
    const dir = String(a.direcao || "").trim().toLowerCase();
    if (
      (dept === "departamento geral" || dept === "geral" || dir === "departamento geral" || !dept) &&
      (!name || name === "-" || name === "Nova Actividade" || name === "ACT")
    ) {
      const hasValidRubricas =
        Array.isArray(a.rubricas) &&
        a.rubricas.some(
          (r: any) =>
            Number(r.valorTotal || r.precoUnitario || 0) > 0 &&
            r.rubrica &&
            r.rubrica !== "Sem rubrica" &&
            r.rubrica !== "Sem rubricas",
        );
      if (!hasValidRubricas) {
        return false;
      }
    }

    return true;
  });

  if (!user) return validActivities;

  // Se o usuário não tem email ou é uma sessão anônima/pública sem restrição definida,
  // exibe as actividades institucionais/gerais para não deixar a tela em branco em novos computadores
  const uEmail = String(user.email || "").toLowerCase().trim();
  const uDept = String(user.departamento || "").toLowerCase().trim();
  const uSector = String(user.setor || user.reparticao || "").toLowerCase().trim();
  const uDir = String(user.direcao || "").toLowerCase().trim();
  const uRole = String(user.role || "").toLowerCase().trim();
  const uId = user.uid || user.id;

  if (!uEmail && !uDept && !uSector && !uDir && (uRole === "utilizador" || uRole === "" || !user.role)) {
    return validActivities;
  }

  if (isSuperBossUser(user)) return validActivities;

  const role = String(user.role || "").toLowerCase();
  const isSysAdmin =
    role === "admin" ||
    role === "administrador" ||
    role === "administrador do sistema" ||
    role === "administrador de sistema" ||
    role === "proprietario" ||
    role === "proprietário" ||
    user.isOwner === true ||
    String(user.categoria || "").toLowerCase().includes("programador");

  return validActivities.filter((a) => {
    if (!a) return false;

    // 1. Criadores e Administradores têm acesso total
    const creatorEmail = String(a.createdBy || a.emailCriador || a.autorEmail || a.responsavelEmail || a.publicadoPorEmail || "").toLowerCase().trim();
    const creatorName = String(a.createdByName || a.autor || a.autorNome || a.planificadoPor || a.criadoPor || a.publicadoPorNome || "").toLowerCase().trim();
    const uName = String(user.nome || user.name || user.displayName || "").toLowerCase().trim();
    const uEmail = String(user.email || "").toLowerCase().trim();
    const uSector = String(user.setor || user.reparticao || "").toLowerCase().trim();
    
    if (
      (creatorEmail && uEmail && creatorEmail === uEmail) ||
      (creatorName && uName && creatorName === uName) ||
      isSysAdmin
    ) return true;

    // 2. Isolamento estrito para UGEA
    const isActUgea = 
      (a.departamento && a.departamento.toLowerCase().includes("ugea")) ||
      (a.setor && a.setor.toLowerCase().includes("ugea")) ||
      (a.reparticao && a.reparticao.toLowerCase().includes("ugea"));
    const uSectorRaw = String(user.setor || user.reparticao || user.departamento || "").toLowerCase().trim();
    const isUserUgea = uSectorRaw.includes("ugea") || uSectorRaw.includes("aquisicoes");

    if (isActUgea && !isUserUgea) return false;
    if (isUserUgea && !isActUgea) return false;

    // 3. Isolamento estrito para Ajudas de Custo (Capítulo 11)
    const isAjudaDeCusto = Array.isArray(a.rubricas) && a.rubricas.some((r: any) => String(r.rubrica || "").toLowerCase().includes("ajuda") || String(r.rubrica || "").startsWith("11"));
    if (isAjudaDeCusto) {
      // Apenas o próprio setor criador pode ver suas ajudas de custo
      return isActivityFromUserSector(a, user);
    }

    const sentToSectors = [
      a.enviadoParaSetor,
      a.setorDestino,
      a.departamentoDestino,
      a.direcaoDestino,
      a.currentGabinete,
      a.gabineteDestinatario,
      a.destinatarioSetor,
    ]
      .filter(Boolean)
      .map((x) => String(x).toLowerCase().trim());

    // 3. Regra padrão para demais actividades (hierarquia)
    return isActivityFromUserSector(a, user) || sentToSectors.some(s => uSector.includes(s) || s.includes(uSector));
  });
};

/**
 * Determines the user's primary workspace area for dashboard redirection.
 */
export const getUserWorkspace = (user: any) => {
  if (!user) return "";
  if (isHRBossUser(user)) {
    return "Repartição de Pessoal";
  }
  if (user.areaDeAfetacao && user.areaDeAfetacao !== "Nenhum" && user.areaDeAfetacao !== "-") {
    return user.areaDeAfetacao;
  }
  return (
    user.setor || user.sector || user.reparticao || user.departamento || user.direcao || user.unidade || ""
  );
};

/**
 * Checks if a user account is an Institutional Administrator account (regardless of active mode).
 */
export const isInstitutionalAdminAccount = (user: any) => {
  if (!user) return false;
  if (isSuperBossUser(user)) return false; // Administrador Geral tem escopo global
  const role = String(user.role || "").toLowerCase();
  const cargoChefia = String(user.cargoChefia || "").toLowerCase();
  const cargo = String(user.cargo || "").toLowerCase();
  
  return (
    user.isInstitutionalAdmin === true ||
    cargoChefia.includes("administrador da instituição") ||
    cargoChefia.includes("administrador de instituição") ||
    cargoChefia.includes("admin da instituição") ||
    cargo.includes("administrador da instituição") ||
    cargo.includes("administrador de instituição") ||
    role.includes("administrador da instituição") ||
    role.includes("administrador de instituição") ||
    role.includes("admin da instituição") ||
    (Boolean(user.instituicaoId) && (role.includes("admin") || role === "administrador"))
  );
};

/**
 * Checks if a user is currently operating as an Institutional Administrator (Admin da Instituição).
 * Returns false if the user explicitly chose to log in as a normal user (activeRoleMode === 'user').
 */
export const isInstitutionalAdminUser = (user: any) => {
  if (!user) return false;
  if (user.activeRoleMode === "user" || user.activeRoleMode === "chefe") return false;
  return isInstitutionalAdminAccount(user);
};

/**
 * Checks if a user holds a leadership position (Chefe de Setor / Departamento / Repartição / Diretor, etc.)
 * excluding the purely institutional admin title.
 */
export const isChefeUser = (user: any) => {
  if (!user) return false;
  if (isHRBossUser(user)) return true;

  const cargoChefia = String(user.cargoChefia || "").toLowerCase();
  const cargo = String(user.cargo || user.title || user.funcao || "").toLowerCase();

  const cleanCargoChefia = cargoChefia
    .replace(/administrador\s+da\s+instituição/gi, "")
    .replace(/administrador\s+da\s+instituicao/gi, "")
    .replace(/administrador\s+de\s+instituição/gi, "")
    .replace(/admin\s+da\s+instituição/gi, "")
    .replace(/administrador/gi, "")
    .trim();

  const cleanCargo = cargo
    .replace(/administrador\s+da\s+instituição/gi, "")
    .replace(/administrador\s+da\s+instituicao/gi, "")
    .replace(/administrador/gi, "")
    .trim();

  const combined = `${cleanCargoChefia} ${cleanCargo}`.toLowerCase();

  return (
    combined.includes("chefe") ||
    combined.includes("diretor") ||
    combined.includes("director") ||
    combined.includes("coordenador") ||
    combined.includes("responsavel") ||
    combined.includes("responsável") ||
    combined.includes("adjunto") ||
    combined.includes("comandante") ||
    combined.includes("supervisor")
  );
};

/**
 * Counts how many institutional admins are registered for a given institution ID.
 * Max limit is 2 per institution.
 */
export const countInstitutionalAdmins = (usersList: any[], instId?: string): number => {
  if (!Array.isArray(usersList)) return 0;
  return usersList.filter((u) => {
    if (!isInstitutionalAdminAccount(u)) return false;
    if (instId) {
      return (
        u.instituicaoId === instId ||
        u.tenantId === instId ||
        u.instituicao === instId ||
        String(u.instituicaoNome || "").toLowerCase() === String(instId).toLowerCase()
      );
    }
    return true;
  }).length;
};

/**
 * Checks if a user is the Head of Personnel / HR (Chefe da Repartição de Pessoal).
 */
export const isHRBossUser = (user: any) => {
  if (!user) return false;
  const rep = String(user.reparticao || "").toLowerCase();
  const dep = String(user.departamento || "").toLowerCase();
  const title = String(user.title || "").toLowerCase();
  const cargo = String(user.cargo || "").toLowerCase();
  const cargoChefia = String(user.cargoChefia || "").toLowerCase();

  return (
    cargoChefia.includes("chefe de repartição de pessoal") ||
    cargoChefia.includes("chefe da repartição de pessoal") ||
    cargoChefia.includes("repartição de pessoal") ||
    cargoChefia.includes("reparticao de pessoal") ||
    cargo.includes("chefe de repartição de pessoal") ||
    cargo.includes("chefe da repartição de pessoal") ||
    rep.includes("pessoal") ||
    title.includes("pessoal") ||
    title.includes("repartição de pessoal") ||
    (cargoChefia.includes("chefe") && (rep.includes("pessoal") || dep.includes("recursos humanos"))) ||
    (cargo.includes("chefe") && (rep.includes("pessoal") || dep.includes("recursos humanos")))
  );
};


/**
 * Checks if a user is a boss (Director, Chief, etc.) based on their name/role.
 * O Administrador Geral/Proprietário/Programador do Sistema não é chefe nem colaborador de nenhuma instituição.
 */
export const isBossUser = (userName: string = "") => {
  const norm = n(userName);
  if (
    norm.includes("proprietario") ||
    norm.includes("programador") ||
    norm.includes("slaiter") ||
    norm.includes("administradordosistema") ||
    norm.includes("administradorgeral")
  ) {
    return false;
  }
  return (
    norm.includes("chefe") ||
    norm.includes("diretor") ||
    norm.includes("director") ||
    norm.includes("coordenador") ||
    norm.includes("adjunto") ||
    norm.includes("secretaria") ||
    norm.includes("presidente") ||
    norm.includes("responsavel") ||
    norm.includes("ugea") ||
    norm.includes("dpep")
  );
};

/**
 * Checks if a user is a Super Boss (Director General or System Admin).
 */
export const isSuperBossUser = (user: any) => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  const title = String(user.title || "").toLowerCase();
  const cargo = String(user.cargo || "").toLowerCase();
  const cargoChefia = String(user.cargoChefia || "").toLowerCase();
  const categoria = String(user.categoria || "").toLowerCase();
  const email = String(user.email || "").toLowerCase();
  const lowName = String(user.name || user.nome || "").toLowerCase();

  if (
    role === "admin" ||
    role === "administrador" ||
    role === "administrador do sistema" ||
    role === "administrador de sistema" ||
    role === "proprietario" ||
    role === "proprietário" ||
    user.isOwner === true ||
    user.isProgrammer === true ||
    title === "administrador" ||
    title === "administrador do sistema" ||
    cargo === "administrador" ||
    cargo === "administrador do sistema" ||
    cargo === "administrador de sistema" ||
    cargo === "proprietário do sistema" ||
    cargo === "proprietario do sistema" ||
    cargoChefia === "administrador" ||
    cargoChefia === "administrador do sistema" ||
    cargoChefia === "administrador de sistema" ||
    cargoChefia === "proprietário do sistema" ||
    cargoChefia === "proprietario do sistema"
  )
    return true;

  if (
    categoria.includes("programador e proprietário") ||
    categoria.includes("proprietário e programador") ||
    categoria.includes("proprietario e progrramador") ||
    categoria.includes("administrador e proprietário") ||
    cargo.includes("programador e proprietário") ||
    cargo.includes("proprietário e programador") ||
    cargo.includes("administrador e proprietário") ||
    cargo.includes("programador do sistema") ||
    cargo.includes("proprietário do sistema")
  )
    return true;

  if (lowName.includes("slaiter") || lowName === "administrador sistema") return true;
  if (email === "slaitertripas@gmail.com") return true;

  const normName = n(user.name || user.nome || "").replace(/\s+/g, "");
  return (
    normName.includes("diretorgeral") ||
    normName.includes("diretorsistema") ||
    normName.includes("administradorsistema")
  );
};

/**
 * Checks if the user is a Technician (Técnico).
 */
export const isTechnicianUser = (user: any) => {
  if (!user) return false;
  const cargo = String(user.cargo || user.cargoChefia || user.title || "").toLowerCase();
  const categoria = String(user.categoria || "").toLowerCase();
  return cargo.includes("tecnico") || cargo.includes("técnico") || categoria.includes("tecnico") || categoria.includes("técnico");
};

/**
 * Determina o papel (role) do utilizador no sistema com base no seu cargo e departamento.
 * Chefias e técnicos do DPEP/Património devem ter conta "Padrão".
 */
export const determineUserRole = (user: any): string => {
  if (!user) return "Utilizador";
  
  // O Administrador Geral/Proprietário/Programador é o topo soberano do sistema (não é colaborador nem chefe de nenhuma IES)
  if (isSuperBossUser(user)) return "Proprietário / Administrador Geral";

  const cargo = String(user.cargo || user.cargoChefia || user.title || "").toLowerCase();
  const departamento = String(user.departamento || "").toLowerCase();
  const role = String(user.role || "").toLowerCase();

  const ehChefia = 
    cargo.includes("chefe") || 
    cargo.includes("diretor") || 
    cargo.includes("director") || 
    cargo.includes("coordenador") || 
    cargo.includes("responsavel") ||
    cargo.includes("adjunto");

  const ehTecnicoEspecial = 
    departamento.includes("dpep") || 
    departamento.includes("planificação") || 
    departamento.includes("patrimonio") || 
    departamento.includes("património");

  if (ehChefia || ehTecnicoEspecial) {
    return "Padrão";
  }

  // Manter papel atual se for válido, senão padrão "Utilizador"
  if (role === "admin" || role === "padrão" || role === "padrao") {
    return user.role;
  }

  return "Utilizador";
};

/**
 * Common role checkers for UI conditional rendering.
 */
export const getRoles = (title: string = "") => {
  const norm = n(title);
  const t = norm.replace(/\s+/g, ""); // Normalized and space-less

  const isDG = t.includes("diretorgeral");
  const isDC =
    t.includes("diretorcentral") ||
    t.includes("diretordadivisao") ||
    t.includes("diretorda") ||
    t.includes("dicosser");
  const isCD =
    t.includes("chefedodepartamento") ||
    t.includes("chefededepartamento") ||
    t.includes("chefedaunidade") ||
    t === "chefedorh" ||
    t === "chefedefinancas" ||
    t === "chefededp" ||
    t === "chefedasg" ||
    t === "chefededtic" ||
    t === "chefededla" ||
    t === "chefededle" ||
    t === "chefededpa" ||
    t === "chefedodra" ||
    t === "chefedodae" ||
    t === "chefesecretariaexecutiva" ||
    t.includes("chefedeinfraestruturaemanutencao") ||
    t === "diretordocurso" ||
    t === "diretordecurso" ||
    t === "DPEP" ||
    t === "chefedoDPEP";
  const isAdjunto = t.includes("adjunto");
  const isCR =
    t.includes("chefedareparticao") ||
    t.includes("chefedereparticao") ||
    t === "diretordocurso" ||
    t === "diretordecurso";

  const isDICOSAFA_Dept =
    t.includes("departamentoderecursoshumanos") ||
    t.includes("departamentodefinancas") ||
    t.includes("departamentodepatrimonio") ||
    t.includes("secretariageral") ||
    t.includes("departamentotic") ||
    t.includes("departamentolardeestudantes") ||
    t.includes("departamentodeproducaoalimentar") ||
    t.includes("unidadegestoraeexecutoradeaquisicoes");

  const isPessoal = t.includes("reparticaodepessoal");

  return {
    isDG,
    isDC,
    isCD,
    isAdjunto,
    isCR,
    isPessoal,
    isDCC:
      t.includes("diretordocurso") ||
      t.includes("diretordoscursos") ||
      t === "diretordecurso",
    isBoss:
      t.includes("chefe") ||
      t.includes("diretor") ||
      t.includes("secretariaexecutiva") ||
      t.includes("adjunto"),
    isConsRep: t.includes("conselhoderepresentantes"),
    isConsAdm: t.includes("conselhoadministrativoedegestao"),
    isConsTec: t.includes("conselhotecnicoedequalidade"),
    isDICOSAFA_Dept,
    isGDG:
      t.includes("chefedogdg") ||
      t.includes("chefedo-gdg") ||
      t.includes("chefegdg") ||
      t.includes("gabinetedodiretorgeral") ||
      t.includes("chefedodepartamentodegdg") ||
      t.includes("chefedogabinete"),
    isGabineteSetor:
      t.includes("expediente") ||
      t.includes("secretariaexecutiva") ||
      t.includes("chefedogdg") ||
      (t.includes("gabinete") && !t.includes("diretorgeral")),
  };
};

/**
 * Verifica se o utilizador é especificamente o Titular do Cargo de Diretor-Geral
 * (Autoridade máxima executiva que assina despachos, homologações e expedientes).
 */
export const isTitularDiretorGeral = (user: any): boolean => {
  if (!user) return false;
  const cargo = String(user.cargo || user.cargoChefia || user.title || "").toLowerCase();
  const normCargo = n(cargo).replace(/\s+/g, "");
  const normName = n(user.name || user.nome || "").replace(/\s+/g, "");
  
  // Exclui assistentes, secretárias, chefes de gabinete ou técnicos de expediente
  if (
    cargo.includes("secretaria") ||
    cargo.includes("expediente") ||
    cargo.includes("chefe do gdg") ||
    cargo.includes("chefe de gabinete") ||
    cargo.includes("assistente") ||
    cargo.includes("tecnico") ||
    cargo.includes("técnico")
  ) {
    return false;
  }

  return (
    normCargo === "diretorgeral" ||
    normCargo === "directorgeral" ||
    normCargo.includes("diretor-geral") ||
    normName === "diretorgeral" ||
    normName === "directorgeral" ||
    isSuperBossUser(user)
  );
};

/**
 * Verifica se o utilizador pertence à Direção do Gabinete do Diretor-Geral
 * (Órgão / Direção Central que engloba DPEP, DCRE, DCTQ, DJ, UGEA, Secretaria Executiva e o Setor do GDG).
 */
export const isDirecaoGabineteDG = (user: any): boolean => {
  if (!user) return false;
  const direcao = String(user.direcao || user.unidadeOrganica || "").toLowerCase();
  return direcao.includes("gabinete") || direcao.includes("diretor-geral") || direcao.includes("gdg") || direcao.includes("odg");
};

/**
 * Verifica se o utilizador pertence ao Setor de Trabalho do Gabinete do Diretor-Geral
 * (Posto de trabalho / Secretaria onde se recebem, registam e preparam os expedientes para assinatura do Diretor-Geral).
 */
export const isSetorExpedienteGabineteDG = (user: any): boolean => {
  if (!user) return false;
  const depto = String(user.departamento || "").toLowerCase();
  const setor = String(user.setor || user.reparticao || "").toLowerCase();
  const cargo = String(user.cargo || user.cargoChefia || user.title || "").toLowerCase();

  return (
    depto.includes("gabinete") ||
    setor.includes("gabinete") ||
    setor.includes("expediente") ||
    cargo.includes("chefe do gdg") ||
    cargo.includes("secretaria executiva") ||
    cargo.includes("expediente")
  );
};

export const isPersonnelBoss = (user: any) => {
  if (!user) return false;
  const title =
    user.title || user.cargoChefia || user.cargo || user.reparticao || "";
  const roles = getRoles(title);
  const norm = n(title).replace(/\s+/g, "");
  return (
    (roles.isPessoal && roles.isCR) ||
    norm.includes("chefedereparticaodepessoal")
  );
};

export const isPatrimonioBossOrAdmin = (
  user: any,
  colaboradores?: any[],
  processos?: any[],
) => {
  if (!user) return false;
  if (isSuperBossUser(user)) return true;

  const email = (user.email || "").toLowerCase();
  if (
    email === "slaitertripas@gmail.com"
  )
    return true;
  if (email.includes("gércio.chaibande") || email.includes("gercio.chaibande"))
    return true;

  const name = (user.name || "").toLowerCase();
  if (
    name.includes("gércio") ||
    name.includes("gercio") ||
    name.includes("chaibande")
  )
    return true;

  const role = String(user.role || "").toUpperCase();
  const departamento = String(user.departamento || "").toUpperCase();
  const cargo = String(user.cargo || "").toUpperCase();
  const cargoChefia = String(user.cargoChefia || "").toUpperCase();
  const title = String(user.title || "").toUpperCase();

  const isPatriText = (str: string) =>
    str.includes("PATRIM") ||
    str.includes("CHEFE DE DP") ||
    str.includes("CHEFE DO DP") ||
    str.includes("CHEFE DE PATRIM") ||
    str.includes("REPARTIÇÃO DE E-PATRI");

  if (
    isPatriText(role) ||
    isPatriText(departamento) ||
    isPatriText(cargo) ||
    isPatriText(cargoChefia) ||
    isPatriText(title)
  ) {
    return true;
  }

  if (colaboradores && colaboradores.length > 0) {
    const colab = colaboradores.find(
      (c) =>
        (c.email &&
          user.email &&
          c.email.toLowerCase() === user.email.toLowerCase()) ||
        (c.nome &&
          user.name &&
          c.nome.toLowerCase() === user.name.toLowerCase()) ||
        (c.nuit && user.nuit && c.nuit === user.nuit),
    );
    if (colab) {
      if (
        String(colab.departamento || "").toUpperCase().includes("PATRIM") &&
        String(colab.cargo || colab.cargoChefia || "").toUpperCase().includes("CHEFE")
      ) {
        return true;
      }
      if (
        isPatriText(String(colab.departamento || "").toUpperCase()) ||
        isPatriText(String(colab.cargo || "").toUpperCase()) ||
        isPatriText(String(colab.cargoChefia || "").toUpperCase())
      ) {
        return true;
      }
    }
  }

  if (processos && processos.length > 0) {
    const proc = processos.find(
      (p) =>
        (p.email &&
          user.email &&
          p.email.toLowerCase() === user.email.toLowerCase()) ||
        (p.nome &&
          user.name &&
          p.nome.toLowerCase() === user.name.toLowerCase()) ||
        (p.nuit && user.nuit && p.nuit === user.nuit),
    );
    if (proc) {
      if (
        String(proc.departamento || "").toUpperCase().includes("PATRIM") &&
        String(proc.cargo || proc.cargoChefia || "").toUpperCase().includes("CHEFE")
      ) {
        return true;
      }
      if (
        isPatriText(String(proc.departamento || "").toUpperCase()) ||
        isPatriText(String(proc.cargo || "").toUpperCase()) ||
        isPatriText(String(proc.cargoChefia || "").toUpperCase())
      ) {
        return true;
      }
    }
  }

  return false;
};
