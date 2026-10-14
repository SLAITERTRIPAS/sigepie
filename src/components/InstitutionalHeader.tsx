import React from 'react';
import { toTitleCase as tc } from '../lib/utils';
import { EFETIVO_GERAL_DATA } from '../constants/colaboradoresList';
import { getActiveInstituicao } from '../lib/instituicaoEstruturaService';
import { getSystemLogo } from '../lib/logoService';
import { useCurrentLanguage, translateInstitutionalText } from '../lib/i18n';

// Remove valores inválidos como "Songo", "ISPS", traços ou valores vazios
export function cleanHierarchyField(val?: string): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === 'songo' ||
    lower === 'isps' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '-' ||
    lower === '--' ||
    lower === 'n/a'
  ) {
    return '';
  }
  return trimmed;
}

// Mapeia com rigor para um dos 3 Órgãos Oficiais do Sistema
export function resolveOrgaoName(unidadeName?: any, direcaoName?: any, departamentoName?: any): string {
  const uClean = cleanHierarchyField(String(unidadeName || ''));
  const dClean = cleanHierarchyField(String(direcaoName || ''));
  const depClean = cleanHierarchyField(String(departamentoName || ''));
  const allText = `${uClean} ${dClean} ${depClean}`.toUpperCase();

  // 1. Verificação explícita em unidadeName
  if (uClean) {
    const uUpper = uClean.toUpperCase();
    if (uUpper.includes('SERVIÇOS CENTRAIS') || uUpper.includes('SERVICOS CENTRAIS') || uUpper === 'SC') {
      return 'Serviços Centrais';
    }
    if (
      uUpper.includes('DIREÇÃO E GESTÃO') ||
      uUpper.includes('DIRECAO E GESTAO') ||
      uUpper.includes('DIREÇÃO E GESTAO') ||
      uUpper.includes('DIRECAO E GESTÃO') ||
      uUpper === 'ODG' ||
      uUpper === 'ÓRGÃO' ||
      uUpper === 'ORGAO'
    ) {
      return 'Órgão de Direção e Gestão';
    }
    if (uUpper === 'UNIDADE ORGÂNICA' || uUpper === 'UNIDADE ORGANICA' || uUpper === 'UO') {
      return 'Unidade Orgânica';
    }
  }

  // 2. Verificação por Direção e Departamento
  if (
    allText.includes('DICOSAFA') ||
    allText.includes('DICOSSER') ||
    allText.includes('SERVIÇOS CENTRAIS') ||
    allText.includes('SERVICOS CENTRAIS') ||
    allText.includes('FINANÇAS') ||
    allText.includes('FINANCAS') ||
    allText.includes('RECURSOS HUMANOS') ||
    allText.includes('PATRIMÓNIO') ||
    allText.includes('PATRIMONIO') ||
    allText.includes('CONTABILIDADE') ||
    allText.includes('SERVIÇOS SOCIAIS') ||
    allText.includes('SERVICOS SOCIAIS')
  ) {
    return 'Serviços Centrais';
  }

  if (
    allText.includes('DIVISÃO DE ENGENHARIA') ||
    allText.includes('DIVISAO DE ENGENHARIA') ||
    allText.includes('ENGENHARIA') ||
    allText.includes('CENTRO DE INCUBAÇÃO') ||
    allText.includes('CENTRO DE INCUBACAO') ||
    allText.includes('CIE') ||
    allText.includes('CENTROS') ||
    allText.includes('UNIDADE ORGÂNICA') ||
    allText.includes('UNIDADE ORGANICA')
  ) {
    return 'Unidade Orgânica';
  }

  if (
    allText.includes('GABINETE DO DIRETOR-GERAL') ||
    allText.includes('GABINETE DO DIRETOR GERAL') ||
    allText.includes('DIRETOR-GERAL') ||
    allText.includes('DIRETOR GERAL') ||
    allText.includes('GDG') ||
    allText.includes('DPEP') ||
    allText.includes('PLANIFICAÇÃO') ||
    allText.includes('PLANIFICACAO') ||
    allText.includes('UGEA') ||
    allText.includes('AQUISIÇÕES') ||
    allText.includes('AQUISICOES') ||
    allText.includes('COOPERAÇÃO') ||
    allText.includes('COOPERACAO') ||
    allText.includes('CONTROLO TÉCNICO') ||
    allText.includes('CONTROLO TECNICO') ||
    allText.includes('JURÍDICO') ||
    allText.includes('JURIDICO') ||
    allText.includes('CONSELHO DE REPRESENTANTES') ||
    allText.includes('CONSELHO ADMINISTRATIVO') ||
    allText.includes('CONSELHO TÉCNICO') ||
    allText.includes('CONSELHO DE DIREÇÃO') ||
    allText.includes('DIREÇÃO E GESTÃO') ||
    allText.includes('DIRECAO E GESTAO')
  ) {
    return 'Órgão de Direção e Gestão';
  }

  return 'Órgão de Direção e Gestão';
}

export const InstitutionalHeader = ({
  direcaoName,
  departamentoName,
  reparticaoName,
  sectorName,
  year,
  isOwner,
  isPlanificacaoHeader,
  unidadeName,
  title = "Plano de Actividade",
  user,
  isDocumentoNormativo = false,
  compact = false,
}: {
  direcaoName?: string;
  departamentoName?: string;
  reparticaoName?: string;
  sectorName?: string;
  year: number;
  isOwner?: boolean;
  isPlanificacaoHeader?: boolean;
  unidadeName?: string;
  title?: string;
  user?: any;
  isDocumentoNormativo?: boolean;
  compact?: boolean;
}) => {
  const selectedYear = year || 2025;
  const isPESOEHeader = String(title || "").toUpperCase().includes("PESOE");

  // Obter dados dinâmicos da instituição configurada na Gestão das Instituições
  const activeInst = getActiveInstituicao();
  const instName = activeInst?.nome || user?.instituicaoNome || (user?.instituicaoId ? "" : "INSTITUIÇÃO");
  const rawLogo = activeInst?.logo || user?.instituicaoLogo;
  // O logotipo da instituição é exclusivo da instituição e nunca se confunde com o logotipo do sistema
  const instLogo = rawLogo && !rawLogo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad") ? rawLogo : null;
  const instProvincia = activeInst?.provincia || user?.provincia || "";
  const instDistrito = activeInst?.distrito || user?.distrito || "";

  // Obter dados de afetação do utilizador/colaborador se fornecido
  let userOrgao = "";
  let userDirecao = "";
  let userDepartamento = "";
  let userReparticao = "";
  let userSetor = "";
  let userCargo = "";

  if (user) {
    userOrgao = user.unidadeOrganica || user.unidade || user.orgao || "";
    userDirecao = user.direcao || "";
    userDepartamento = user.departamento || "";
    userReparticao = user.reparticao || "";
    userSetor = user.setor || "";
    userCargo = user.cargo || "";

    // Tentar localizar no efetivo geral por email, nome ou id para preenchimento de lacunas
    const matchedColab = EFETIVO_GERAL_DATA.find(
      (c) =>
        (user.email && c.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.nome && c.nome && c.nome.toLowerCase() === user.nome.toLowerCase()) ||
        (user.id && c.id && c.id === user.id)
    );

    if (matchedColab) {
      if (!userOrgao) userOrgao = matchedColab.unidade || "";
      if (!userDirecao) userDirecao = matchedColab.direcao || "";
      if (!userDepartamento) userDepartamento = matchedColab.departamento || "";
      if (!userReparticao) userReparticao = matchedColab.reparticao || "";
      if (!userSetor) userSetor = matchedColab.sector || (matchedColab as any).setor || "";
      if (!userCargo) userCargo = matchedColab.cargo || "";
    }
  }

  // Resolver campos com fallback na afetação do utilizador
  const rawUnidade = cleanHierarchyField(unidadeName) || cleanHierarchyField(userOrgao);
  const rawDirecao = cleanHierarchyField(direcaoName) || cleanHierarchyField(userDirecao);
  const rawDepartamento = cleanHierarchyField(departamentoName) || cleanHierarchyField(userDepartamento);
  const rawReparticao = cleanHierarchyField(reparticaoName) || cleanHierarchyField(userReparticao);
  const rawSector = cleanHierarchyField(sectorName) || cleanHierarchyField(userSetor);

  // Mapeamento dinâmico para um dos 3 Órgãos Oficiais
  const displayUnidade = resolveOrgaoName(rawUnidade, rawDirecao, rawDepartamento);
  const displayDirecao = rawDirecao ? tc(rawDirecao) : (displayUnidade === "Órgão de Direção e Gestão" ? "Gabinete do Diretor-geral" : "");
  const displayDepartamento = rawDepartamento ? tc(rawDepartamento) : "";
  const displayReparticao = rawReparticao ? tc(rawReparticao) : "";
  const displaySector = rawSector ? tc(rawSector) : "";

  // Definir cargo hierárquico correspondente
  let cargoResponsavel = userCargo ? tc(userCargo) : "";
  if (!cargoResponsavel) {
    if (displaySector) {
      cargoResponsavel = "Responsável do Setor";
    } else if (displayReparticao) {
      cargoResponsavel = "Chefe da Repartição";
    } else if (displayDepartamento) {
      cargoResponsavel = "Chefe do Departamento";
    } else if (displayDirecao) {
      if (displayDirecao.toLowerCase().includes("gabinete")) {
        cargoResponsavel = "Chefe do Gabinete";
      } else if (displayDirecao.toLowerCase().includes("divisão") || displayDirecao.toLowerCase().includes("divisao")) {
        cargoResponsavel = "Diretor da Divisão";
      } else {
        cargoResponsavel = "Diretor";
      }
    } else {
      cargoResponsavel = "Chefe do Departamento";
    }
  }

  let lowestLevelName = "";
  if (displaySector) {
    lowestLevelName = displaySector.toLowerCase().startsWith("setor") ? displaySector : `Setor de ${displaySector}`;
  } else if (displayReparticao) {
    lowestLevelName = displayReparticao.toLowerCase().startsWith("repartição") || displayReparticao.toLowerCase().startsWith("reparticao")
      ? displayReparticao
      : `Repartição de ${displayReparticao}`;
  } else if (displayDepartamento) {
    lowestLevelName = displayDepartamento;
  } else if (displayDirecao) {
    lowestLevelName = displayDirecao;
  } else {
    lowestLevelName = displayUnidade;
  }

  const currentLang = useCurrentLanguage();
  const isEn = currentLang === "en";

  let displayTitle = tc(String(title || "Plano de Actividade").trim());
  if (displayTitle.toLowerCase() === "plano de actividade" || displayTitle.toLowerCase() === "plano de actividades") {
    if (lowestLevelName) {
      displayTitle = isEn ? `Activity Plan of ${lowestLevelName}` : `Plano de Actividade de ${lowestLevelName}`;
    }
  }
  const finalTitle = isEn ? translateInstitutionalText(displayTitle, "en") : displayTitle;

  const translatedUnidade = isEn
    ? (displayUnidade === "Órgão de Direção e Gestão" ? "Governance and Management Body"
      : displayUnidade === "Serviços Centrais" ? "Central Services"
      : displayUnidade === "Unidade Orgânica" ? "Organic Unit"
      : displayUnidade)
    : displayUnidade;

  const translatedDirecao = isEn
    ? (displayDirecao.toLowerCase().includes("gabinete do diretor") ? "Office of the Director-General" : displayDirecao)
    : displayDirecao;

  const translatedCargo = isEn
    ? (cargoResponsavel === "Chefe do Departamento" ? "Head of Department"
      : cargoResponsavel === "Chefe da Repartição" ? "Head of Section"
      : cargoResponsavel === "Responsável do Setor" ? "Sector Manager"
      : cargoResponsavel === "Chefe do Gabinete" ? "Head of Cabinet"
      : cargoResponsavel === "Diretor" ? "Director"
      : cargoResponsavel)
    : cargoResponsavel;

  // CABEÇALHO DO PESOE (OFICIAL GOVERNAMENTAL)
  if (isPESOEHeader) {
    return (
      <div className="text-center mb-6 flex flex-col items-center justify-center w-full bg-slate-50/50 p-8 rounded-t-[2.5rem] print:p-4 print:mb-4 print:w-full print:items-center print:text-center">
        {/* 1. Emblema da República de Moçambique */}
        <div className="mb-4 flex justify-center items-center w-full text-center print:mb-3 print:flex print:justify-center print:items-center">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUZVTEsRFhrjEogw8WJJ1Z-ofxr7pQ81TcwMtaHh8Plw&s=10"
            alt="Emblema da República de Moçambique"
            className="w-28 h-auto object-contain mx-auto print:mx-auto print:block"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* 2. Cabeçalho Oficial do Estado / Ministério */}
        <div className="flex flex-col items-center gap-1 mb-5 font-serif">
          <h3 className="text-sm font-extrabold text-slate-800 tracking-[0.15em] uppercase">
            {isEn ? "Republic of Mozambique" : "República de Moçambique"}
          </h3>
          <h4 className="text-sm font-bold text-slate-700 tracking-[0.1em] uppercase">
            {isEn ? "Ministry of Education and Culture" : "Ministério da Educação e Cultura"}
          </h4>
          <h4 className="text-sm font-bold text-slate-700 tracking-[0.1em] uppercase">
            {isEn ? "National Directorate of Higher Education" : "Direcção Nacional de Ensino Superior"}
          </h4>
        </div>

        {/* 3. Instituto Superior Politécnico de Songo */}
        <h2 className="text-[1.8rem] font-serif font-bold text-slate-900 tracking-tight mb-2">
          {instName}
        </h2>

        {/* 4. Província e Distrito */}
        {(instProvincia || instDistrito) && (
          <div className="flex flex-col items-center gap-0.5 mb-6 font-serif">
            {instProvincia && (
              <h3 className="text-xs font-medium text-slate-600 tracking-[0.12em]">
                {isEn
                  ? (instProvincia.toLowerCase().startsWith("província") ? instProvincia.replace(/província de/i, "Province of") : `Province of ${instProvincia}`)
                  : (instProvincia.toLowerCase().startsWith("província") ? instProvincia : `Província de ${instProvincia}`)}
              </h3>
            )}
            {instDistrito && (
              <h3 className="text-xs font-medium text-slate-600 tracking-[0.12em]">
                {isEn
                  ? (instDistrito.toLowerCase().startsWith("distrito") ? instDistrito.replace(/distrito de/i, "District of") : `District of ${instDistrito}`)
                  : (instDistrito.toLowerCase().startsWith("distrito") ? instDistrito : `Distrito de ${instDistrito}`)}
              </h3>
            )}
          </div>
        )}
        
        {/* 5. Título Principal em Destaque */}
        <h5 className="text-[1.25rem] font-serif font-bold text-[#d90429] mt-2 tracking-tight uppercase">
          {isEn ? `PROPOSAL OF ACTIVITIES FOR PESO ${selectedYear}` : `PROPOSTA DE ATIVIDADES PARA O PESO ${selectedYear}`}
        </h5>

        {/* 6. Linha Divisória */}
        <div className="w-full max-w-4xl h-[2px] bg-slate-800 mt-5 mb-5"></div>

        {/* 7. Exercício Económico */}
        <div className="mt-1">
          <span className="text-xs font-black text-slate-800 tracking-wider bg-slate-200/60 px-6 py-2 rounded-xl border border-slate-300">
            {isEn ? `Financial Year: ${selectedYear}` : `Exercício Económico: ${selectedYear}`}
          </span>
        </div>
      </div>
    );
  }

  // CABEÇALHO PARA DOCUMENTOS NORMATIVOS OFICIAIS (COMPACTO, NÃO EMPURRA RODAPÉ PARA PÁGINA EXTRA)
  if (isDocumentoNormativo || compact) {
    return (
      <div className="text-center mb-2 flex flex-col items-center justify-center w-full bg-transparent p-2 print:p-1 print:mb-1 print:w-full print:items-center print:text-center">
        {/* 1. Logotipo da Instituição Centrado */}
        <div className="mb-2 flex justify-center items-center w-full text-center print:mb-1 print:flex print:justify-center print:items-center">
          {instLogo ? (
            <img
              src={instLogo}
              alt={`Logotipo ${instName}`}
              className="h-14 sm:h-16 max-h-16 w-auto object-contain mx-auto print:h-11 print:max-h-11 filter drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#0c2340] text-white flex flex-col items-center justify-center p-1 mx-auto shadow-xs">
              <span className="text-sm font-serif font-black tracking-wider">{activeInst?.sigla || "INST"}</span>
            </div>
          )}
        </div>

        {/* 2. Nome da Instituição Centrado */}
        <h2 className="text-sm sm:text-base font-serif font-bold text-[#0c2340] uppercase tracking-wide mb-0.5">
          {instName}
        </h2>

        {/* 3. Província / Distrito */}
        {(instProvincia || instDistrito) && (
          <div className="flex flex-col items-center gap-0.5 mb-1 font-serif text-[#0c2340]">
            {instProvincia && (
              <h3 className="text-[9.5px] sm:text-[10px] font-medium text-slate-600 tracking-wide">
                {isEn 
                  ? (instProvincia.toLowerCase().startsWith("província") ? instProvincia.replace(/província de/i, "Province of") : `Province of ${instProvincia}`)
                  : (instProvincia.toLowerCase().startsWith("província") ? instProvincia : `Província de ${instProvincia}`)}
              </h3>
            )}
            {instDistrito && (
              <h3 className="text-[9.5px] sm:text-[10px] font-medium text-slate-600 tracking-wide">
                {isEn
                  ? (instDistrito.toLowerCase().startsWith("distrito") ? instDistrito.replace(/distrito de/i, "District of") : `District of ${instDistrito}`)
                  : (instDistrito.toLowerCase().startsWith("distrito") ? instDistrito : `Distrito de ${instDistrito}`)}
              </h3>
            )}
          </div>
        )}

        {/* 4. Hierarquia Organizacional Compacta */}
        <div className="flex flex-col items-center gap-0.5 mb-1.5 font-serif text-[#0c2340]">
          <h4 className="text-[10px] sm:text-[10.5px] font-bold text-[#d90429]">
            {translatedUnidade}
          </h4>
          {translatedDirecao && (
            <h4 className="text-[9.5px] sm:text-[10px] font-bold text-slate-800">
              {translatedDirecao}
            </h4>
          )}
          {displayDepartamento && (
            <h4 className="text-[9.5px] sm:text-[10px] font-bold text-slate-800">
              {displayDepartamento.toLowerCase().startsWith("departamento") ||
              displayDepartamento.toLowerCase().startsWith("divisão") ||
              displayDepartamento.toLowerCase().startsWith("divisao") ||
              displayDepartamento.toLowerCase().startsWith("unidade") ||
              displayDepartamento.toLowerCase().startsWith("centro")
                ? displayDepartamento
                : `${isEn ? "Department of " : "Departamento de "}${displayDepartamento}`}
            </h4>
          )}
          {displayReparticao && (
            <h4 className="text-[9px] sm:text-[9.5px] font-bold text-slate-700">
              {displayReparticao.toLowerCase().startsWith("repartição") || displayReparticao.toLowerCase().startsWith("reparticao")
                ? displayReparticao
                : `${isEn ? "Section of " : "Repartição de "}${displayReparticao}`}
            </h4>
          )}
          {displaySector && (
            <h4 className="text-[9px] sm:text-[9.5px] font-bold text-slate-700">
              {displaySector.toLowerCase().startsWith("setor")
                ? displaySector
                : `${isEn ? "Sector of " : "Setor de "}${displaySector}`}
            </h4>
          )}
          {translatedCargo && (
            <h4 className="text-[9px] sm:text-[9.5px] font-bold text-slate-600">
              {translatedCargo}
            </h4>
          )}
        </div>

        {/* 5. Título Dinâmico Proporcional e Sóbrio (sem tamanho excessivo) */}
        {finalTitle && finalTitle.toLowerCase() !== "plano de actividade" && finalTitle.toLowerCase() !== "activity plan" && (
          <h5 className="text-xs sm:text-sm font-serif font-bold text-slate-900 tracking-wider uppercase mt-1">
            {finalTitle}
          </h5>
        )}

        {/* 6. Linha Divisória Fina */}
        <div className="w-full max-w-4xl h-[1.5px] bg-slate-800/70 my-2"></div>
      </div>
    );
  }

  // CABEÇALHO DO PLANO DE ATIVIDADE & DOCUMENTOS INSTITUCIONAIS (FORMATO EXATO DA IMAGEM)
  return (
    <div className="text-center mb-6 flex flex-col items-center justify-center w-full bg-transparent p-6 print:p-4 print:mb-4 print:w-full print:items-center print:text-center">
      {/* 1. Logotipo da Instituição Centrado */}
      <div className="mb-5 flex justify-center items-center w-full text-center print:mb-4 print:flex print:justify-center print:items-center">
        {instLogo ? (
          <img
            src={instLogo}
            alt={`Logotipo ${instName}`}
            className="w-32 h-auto max-h-32 object-contain mx-auto print:mx-auto print:block filter drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-[#0c2340] text-white flex flex-col items-center justify-center p-2 mx-auto shadow-md">
            <span className="text-xl font-serif font-black tracking-wider">{activeInst?.sigla || "INST"}</span>
            <span className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">Instituição</span>
          </div>
        )}
      </div>

      {/* 2. Nome da Instituição Centrado */}
      <h2 className="text-[1.85rem] md:text-[2.25rem] font-serif font-bold text-[#0c2340] tracking-tight mb-2">
        {instName}
      </h2>

      {/* 3. Província / Distrito */}
      {(instProvincia || instDistrito) && (
        <div className="flex flex-col items-center gap-1 mb-2 font-serif text-[#0c2340]">
          {instProvincia && (
            <h3 className="text-sm md:text-[0.95rem] font-medium tracking-wide">
              {isEn
                ? (instProvincia.toLowerCase().startsWith("província") ? instProvincia.replace(/província de/i, "Province of") : `Province of ${instProvincia}`)
                : (instProvincia.toLowerCase().startsWith("província") ? instProvincia : `Província de ${instProvincia}`)}
            </h3>
          )}
          {instDistrito && (
            <h3 className="text-sm md:text-[0.95rem] font-medium tracking-wide">
              {isEn
                ? (instDistrito.toLowerCase().startsWith("distrito") ? instDistrito.replace(/distrito de/i, "District of") : `District of ${instDistrito}`)
                : (instDistrito.toLowerCase().startsWith("distrito") ? instDistrito : `Distrito de ${instDistrito}`)}
            </h3>
          )}
        </div>
      )}
      
      {/* 4. Hierarquia Organizacional: Órgão (em Vermelho) -> Direção -> Departamento -> Repartição/Setor -> Cargo */}
      <div className="flex flex-col items-center gap-1 mb-6 font-serif text-[#0c2340]">
        {/* ÓRGÃO EM VERMELHO DESTAQUE */}
        <h4 className="text-base md:text-lg font-bold text-[#d90429]">
          {translatedUnidade}
        </h4>

        {/* DIREÇÃO / GABINETE */}
        {translatedDirecao && (
          <h4 className="text-base md:text-lg font-bold">
            {translatedDirecao}
          </h4>
        )}

        {/* DEPARTAMENTO / DIVISÃO */}
        {displayDepartamento && (
          <h4 className="text-base md:text-lg font-bold">
            {displayDepartamento.toLowerCase().startsWith("departamento") ||
            displayDepartamento.toLowerCase().startsWith("divisão") ||
            displayDepartamento.toLowerCase().startsWith("divisao") ||
            displayDepartamento.toLowerCase().startsWith("unidade") ||
            displayDepartamento.toLowerCase().startsWith("centro")
              ? displayDepartamento
              : `${isEn ? "Department of " : "Departamento de "}${displayDepartamento}`}
          </h4>
        )}

        {/* REPARTIÇÃO / SETOR (SE APLICÁVEL) */}
        {displayReparticao && (
          <h4 className="text-base md:text-lg font-bold">
            {displayReparticao.toLowerCase().startsWith("repartição") || displayReparticao.toLowerCase().startsWith("reparticao")
              ? displayReparticao
              : `${isEn ? "Section of " : "Repartição de "}${displayReparticao}`}
          </h4>
        )}

        {displaySector && (
          <h4 className="text-base md:text-lg font-bold">
            {displaySector.toLowerCase().startsWith("setor")
              ? displaySector
              : `${isEn ? "Sector of " : "Setor de "}${displaySector}`}
          </h4>
        )}

        {/* CARGO DO RESPONSÁVEL / CHEFIA */}
        {translatedCargo && (
          <h4 className="text-base md:text-lg font-bold">
            {translatedCargo}
          </h4>
        )}
      </div>

      {/* 5. Título Dinâmico em Vermelho com Serifa & Espaçamento Elegante (se fornecido) */}
      {finalTitle && (
        <h5 className="text-[1.25rem] md:text-[1.5rem] font-serif font-bold text-[#d90429] tracking-wider uppercase mt-2">
          {finalTitle}
        </h5>
      )}

      {/* 6. Linha Divisória */}
      <div className="w-full max-w-4xl h-[2px] bg-slate-800/80 mt-6 mb-5"></div>

      {/* 7. Exercício Económico */}
      <div className="mt-1">
        <span className="text-sm md:text-base font-bold text-slate-900 tracking-wide bg-[#f1f5f9] px-6 py-2 rounded-xl border border-slate-200 shadow-xs">
          {isEn ? `Financial Year: ${selectedYear}` : `Exercício Económico: ${selectedYear}`}
        </span>
      </div>
    </div>
  );
};
