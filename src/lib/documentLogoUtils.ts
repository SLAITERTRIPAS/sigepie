import { getSystemLogo } from "./logoService";

/**
 * Utilitário centralizado para obter o logótipo da instituição ativa,
 * garantindo injeção dinâmica no cabeçalho e rodapé de todos os documentos gerados no SIGEP.
 */
export function getActiveInstitutionLogo(activeInst?: any, currentUser?: any): string {
  if (activeInst?.logoUrl && !activeInst.logoUrl.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad")) {
    return activeInst.logoUrl;
  }
  if (activeInst?.logo) {
    return activeInst.logo;
  }
  if (currentUser?.logoUrl) {
    return currentUser.logoUrl;
  }
  if (currentUser?.instituicaoLogo) {
    return currentUser.instituicaoLogo;
  }
  if (typeof window !== "undefined") {
    const storedInst = localStorage.getItem("activeInstitution");
    if (storedInst) {
      try {
        const parsed = JSON.parse(storedInst);
        if (parsed?.logo || parsed?.logoUrl) {
          return parsed.logo || parsed.logoUrl;
        }
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
  }
  return getSystemLogo() || "/image.png";
}

export function getActiveInstitutionName(activeInst?: any, currentUser?: any): string {
  if (activeInst?.name || activeInst?.nome) {
    return activeInst.name || activeInst.nome;
  }
  if (currentUser?.instituicao || currentUser?.institutionName) {
    return currentUser.instituicao || currentUser.institutionName;
  }
  if (typeof window !== "undefined") {
    const storedInst = localStorage.getItem("activeInstitution");
    if (storedInst) {
      try {
        const parsed = JSON.parse(storedInst);
        if (parsed?.name || parsed?.nome) {
          return parsed.name || parsed.nome;
        }
      } catch (e) {}
    }
  }
  return "República de Moçambique - Ministério / Instituição Pública";
}

export function getActiveProvinceName(activeInst?: any, currentUser?: any): string {
  if (activeInst?.province || activeInst?.provincia) {
    return activeInst.province || activeInst.provincia;
  }
  if (currentUser?.provincia || currentUser?.province) {
    return currentUser.provincia || currentUser.province;
  }
  if (typeof window !== "undefined") {
    const storedInst = localStorage.getItem("activeInstitution");
    if (storedInst) {
      try {
        const parsed = JSON.parse(storedInst);
        if (parsed?.province || parsed?.provincia) {
          return parsed.province || parsed.provincia;
        }
      } catch (e) {}
    }
  }
  return "Cidade de Maputo";
}
