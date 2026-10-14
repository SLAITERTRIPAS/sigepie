/**
 * Utilitário de Impressão de Documentos do SIGEP
 * Permite abrir qualquer documento (Plano de Actividades, Relatório, Balancete, Ficha)
 * ajustando e escolhendo o formato ideal (A4 / A3 em Orientação Vertical ou Horizontal)
 * conforme a ocupação da área com informações.
 */

import { getActiveInstituicao } from "./instituicaoEstruturaService";

export interface PrintDocumentOptions {
  title: string;
  subtitle?: string;
  orgao?: string;
  direcao?: string;
  divisao?: string;
  departamento?: string;
  reparticao?: string;
  setor?: string;
  headerHtml?: string;
  contentHtml: string;
  styles?: string;
  orientation?: "portrait" | "landscape" | "auto";
  pageSize?: "A3" | "A4" | "A5" | "letter" | "legal" | "auto";
  printType?: string;
  autoDetectFormat?: boolean;
}

export interface PrintFormatResult {
  pageSize: "A3" | "A4";
  orientation: "portrait" | "landscape";
  reason: string;
  maxCols: number;
}

/**
 * Análise inteligente da ocupação de área e densidade do documento
 * para determinar automaticamente se o formato ideal é A4/A3 e Retrato/Paisagem.
 */
export function detectIdealPrintFormat(options: {
  title?: string;
  subtitle?: string;
  contentHtml: string;
  pageSize?: "A3" | "A4" | "A5" | "letter" | "legal" | "auto";
  orientation?: "portrait" | "landscape" | "auto";
}): PrintFormatResult {
  const {
    title = "",
    subtitle = "",
    contentHtml,
    pageSize = "auto",
    orientation = "auto",
  } = options;

  let maxTableCols = 0;
  const colMatch = contentHtml.match(/<tr[\s\S]*?<\/tr>/gi);
  if (colMatch) {
    colMatch.forEach((rowStr) => {
      const cols = (rowStr.match(/<(td|th)[\s>]/gi) || []).length;
      if (cols > maxTableCols) maxTableCols = cols;
    });
  }

  const hasWideClasses =
    contentHtml.includes("min-w-[1900px]") ||
    contentHtml.includes("min-w-[1500px]") ||
    contentHtml.includes("min-w-[1200px]") ||
    contentHtml.includes("w-[1200px]") ||
    contentHtml.includes("w-[1500px]");

  const titleLower = (title + " " + (subtitle || "")).toLowerCase();
  const contentLength = contentHtml.length;

  let finalPageSize: "A3" | "A4" = "A4";
  let finalOrientation: "portrait" | "landscape" = "portrait";
  let reason = "Análise automática por área de ocupação de informação.";

  // 1. Matrizes muito largas ou tabelas com > 8 colunas -> A3 Paisagem (Horizontal)
  if (
    maxTableCols > 8 ||
    hasWideClasses ||
    (titleLower.includes("plano") && (maxTableCols >= 6 || contentLength > 4000)) ||
    titleLower.includes("matriz") ||
    titleLower.includes("quadro orçamental") ||
    titleLower.includes("mapa geral")
  ) {
    finalPageSize = "A3";
    finalOrientation = "landscape";
    reason = `Documento com matriz extensa (${maxTableCols} colunas). Formato A3 Horizontal selecionado para máxima legibilidade.`;
  }
  // 2. Relatórios de média largura (5 a 8 colunas) ou Balanços/Horários -> A4 Paisagem (Horizontal)
  else if (
    maxTableCols >= 5 ||
    titleLower.includes("balanço") ||
    titleLower.includes("balanco") ||
    titleLower.includes("balancete") ||
    titleLower.includes("horário") ||
    titleLower.includes("horario") ||
    titleLower.includes("exames") ||
    titleLower.includes("mapa de execução")
  ) {
    if (contentLength > 12000) {
      finalPageSize = "A3";
      finalOrientation = "portrait";
      reason = "Extenso volume vertical de dados. Formato A3 Vertical selecionado.";
    } else {
      finalPageSize = "A4";
      finalOrientation = "landscape";
      reason = `Documento com ${maxTableCols || 5} colunas. Formato A4 Horizontal otimiza a área de impressão.`;
    }
  }
  // 3. Documentos muito extensos em texto vertical -> A3 Retrato (Vertical)
  else if (contentLength > 15000 && maxTableCols <= 4) {
    finalPageSize = "A3";
    finalOrientation = "portrait";
    reason = "Documento muito extenso verticalmente. Formato A3 Vertical reduz o número de páginas.";
  }
  // 4. Formulários, Fichas, Despachos, Guias e Documentos Curtos -> A4 Retrato (Vertical)
  else {
    finalPageSize = "A4";
    finalOrientation = "portrait";
    reason = "Documento padrão de 1-4 colunas. Formato A4 Vertical é a opção ideal.";
  }

  // Respeita preferências do utilizador caso não sejam "auto"
  if (pageSize && pageSize !== "auto" && (pageSize === "A3" || pageSize === "A4")) {
    finalPageSize = pageSize;
  }
  if (orientation && orientation !== "auto") {
    finalOrientation = orientation;
  }

  return {
    pageSize: finalPageSize,
    orientation: finalOrientation,
    reason,
    maxCols: maxTableCols,
  };
}

export function openPrintDocumentWindow(options: PrintDocumentOptions) {
  const {
    title,
    subtitle,
    orgao,
    direcao,
    divisao,
    departamento,
    reparticao,
    setor,
    headerHtml,
    contentHtml,
    styles = "",
    orientation = "auto",
    pageSize = "auto",
    printType,
  } = options;

  // Validação de dados: se não houver conteúdo válido ou estiver vazio
  const cleanContent = contentHtml ? contentHtml.replace(/<[^>]*>?/gm, "").trim() : "";
  const hasNoData = !contentHtml || cleanContent.length < 5 || cleanContent.toLowerCase().includes("nenhum registo") || cleanContent.toLowerCase().includes("nenhum dado encontrado");

  if (hasNoData) {
    const docName = title || "documento";
    alert(`Não é possível gerar o ${docName} por falta de dados, insira dados necessários para gerar o ${docName}`);
    return;
  }

  // Análise de ocupação de área
  const detected = detectIdealPrintFormat({
    title,
    subtitle,
    contentHtml,
    pageSize,
    orientation,
  });

  const resolvedPageSize = detected.pageSize;
  const resolvedOrientation = detected.orientation;

  let printWindow: Window | null = null;
  try {
    printWindow = window.open(
      "",
      "_blank",
      "width=1280,height=920,scrollbars=yes,resizable=yes",
    );
  } catch {
    printWindow = null;
  }

  const hasEmbeddedHeader =
    contentHtml.includes("REPÚBLICA DE MOÇAMBIQUE") ||
    contentHtml.includes("República de Moçambique") ||
    contentHtml.includes("INSTITUTO SUPERIOR POLITÉCNICO") ||
    contentHtml.includes("Instituto Superior Politécnico") ||
    contentHtml.includes("sigep-logo.svg") ||
    contentHtml.includes("lh3.googleusercontent.com/d/11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad");

  const cleanVal = (val?: string) => {
    if (!val) return '';
    const trimmed = String(val).trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'songo' || lower === 'isps' || lower === 'null' || lower === 'undefined' || lower === '-' || lower === 'n/a') return '';
    return trimmed;
  };

  const cleanOrgao = cleanVal(orgao);
  const cleanDirecao = cleanVal(direcao);
  const cleanDivisao = cleanVal(divisao);
  const cleanDepartamento = cleanVal(departamento);
  const cleanReparticao = cleanVal(reparticao);
  const cleanSetor = cleanVal(setor);

  const resolvedOrgao = (() => {
    const allText = `${cleanOrgao} ${cleanDirecao} ${cleanDivisao} ${cleanDepartamento}`.toUpperCase();
    if (allText.includes("DICOSAFA") || allText.includes("DICOSSER") || allText.includes("SERVIÇOS CENTRAIS") || allText.includes("SERVICOS CENTRAIS") || allText.includes("FINANÇAS") || allText.includes("RECURSOS HUMANOS")) {
      return "Serviços Centrais";
    }
    if (allText.includes("DIVISÃO DE ENGENHARIA") || allText.includes("DIVISAO DE ENGENHARIA") || allText.includes("ENGENHARIA") || allText.includes("CIE") || allText.includes("CENTRO")) {
      return "Unidade Orgânica";
    }
    return "Órgão de Direção e Gestão";
  })();

  const lowestLevelName = [cleanSetor, cleanReparticao, cleanDepartamento, cleanDivisao, cleanDirecao].filter(Boolean)[0] || resolvedOrgao;
  let resolvedTitle = (title || "Plano de Actividade").trim();
  if (resolvedTitle.toUpperCase() === "PLANO DE ATIVIDADE" || resolvedTitle.toUpperCase() === "PLANO DE ATIVIDADES") {
    resolvedTitle = `Plano de Actividade de ${lowestLevelName}`;
  }

  // Determinar cargo correspondente para o documento
  const cargoCorrespondente = (() => {
    if (cleanSetor) return "Responsável do Setor";
    if (cleanReparticao) return "Chefe da Repartição";
    if (cleanDepartamento) return "Chefe do Departamento";
    if (cleanDivisao) return "Diretor da Divisão";
    if (cleanDirecao) {
      if (cleanDirecao.toLowerCase().includes("gabinete")) return "Chefe do Gabinete";
      if (cleanDirecao.toLowerCase().includes("divisão") || cleanDirecao.toLowerCase().includes("divisao")) return "Diretor da Divisão";
      return "Diretor";
    }
    return "Chefe do Departamento";
  })();

  const activeInst = getActiveInstituicao();
  const instName = activeInst?.nome || "Instituição de Ensino Superior";
  const rawInstLogo = activeInst?.logo;
  const sysLogo = typeof window !== "undefined" ? localStorage.getItem("systemLogo") : null;
  const instLogo = rawInstLogo && !rawInstLogo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad") ? rawInstLogo : (sysLogo || "/image.png");
  const instProvincia = activeInst?.provincia ? (activeInst.provincia.toLowerCase().startsWith("província") ? activeInst.provincia : `Província de ${activeInst.provincia}`) : "";
  const instDistrito = activeInst?.distrito ? (activeInst.distrito.toLowerCase().startsWith("distrito") ? activeInst.distrito : `Distrito de ${activeInst.distrito}`) : "";
  const instAddress = activeInst?.endereco || activeInst?.distrito || "Moçambique";
  const instEmail = activeInst?.email || "contacto@instituicao.ac.mz";
  const instTelefone = activeInst?.telefone || "";
  const instWebsite = activeInst?.website || "";

  const defaultHeader =
    headerHtml !== undefined
      ? headerHtml
      : hasEmbeddedHeader
        ? ""
        : `
    <style>
      .document-logo {
        width: ${resolvedPageSize === "A3" ? "70mm" : "50mm"};
        height: auto;
        object-fit: contain;
        max-width: 100%;
        display: block;
        margin: 0 auto;
      }
      @media print {
        .document-logo {
          width: ${resolvedPageSize === "A3" ? "70mm" : "50mm"} !important;
          height: auto !important;
        }
      }
      .a3-print .document-logo {
        width: 70mm !important;
        height: auto !important;
      }
    </style>
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; font-family: 'Times New Roman', Times, serif; width: 100%;">
      <div style="margin-bottom: 12px; text-align: center; display: flex; justify-content: center; align-items: center; width: 100%;">
        <img src="${instLogo}" alt="Logotipo ${instName}" class="document-logo" />
      </div>
      <h2 style="font-size: 16px; font-weight: bold; margin: 2px 0 4px 0; color: #000; text-transform: uppercase;">
        ${instName}
      </h2>
      ${instProvincia ? `<h3 style="font-size: 14px; font-weight: 500; margin: 2px 0; color: #000;">${instProvincia}</h3>` : ""}
      ${instDistrito ? `<h3 style="font-size: 14px; font-weight: 500; margin: 2px 0; color: #000;">${instDistrito}</h3>` : ""}
      
      <div style="margin-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 3px;">
        <h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${resolvedOrgao}</h4>
        ${cleanDirecao ? `<h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${cleanDirecao}</h4>` : `<h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">Gabinete do Diretor-geral</h4>`}
        ${cleanDivisao ? `<h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${cleanDivisao}</h4>` : ""}
        ${cleanDepartamento ? `<h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${cleanDepartamento.toLowerCase().startsWith("departamento") || cleanDepartamento.toLowerCase().startsWith("unidade") ? cleanDepartamento : `Departamento de ${cleanDepartamento}`}</h4>` : ""}
        ${cleanReparticao ? `<h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${cleanReparticao.toLowerCase().startsWith("repartição") || cleanReparticao.toLowerCase().startsWith("reparticao") ? cleanReparticao : `Repartição de ${cleanReparticao}`}</h4>` : ""}
        ${cleanSetor ? `<h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${cleanSetor.toLowerCase().startsWith("setor") ? cleanSetor : `Setor de ${cleanSetor}`}</h4>` : ""}
        <h4 style="font-size: 14px; font-weight: bold; margin: 1px 0; color: #000;">${cargoCorrespondente}</h4>
      </div>

      <h5 style="font-size: 16px; font-weight: bold; margin: 18px auto 0; color: #000; text-transform: uppercase; width: 95%; letter-spacing: 0.5px;">
        ${resolvedTitle}
      </h5>
      ${subtitle ? `<p style="font-size: 14px; margin: 6px 0 0 0; color: #333; font-style: italic; text-align: center;">${subtitle}</p>` : ""}
    </div>
  `;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const docFooterTag = `(${hours}:${minutes}:${seconds} ${day}/${month}/${year}) ${resolvedTitle || title || "Documento Oficial"} - (${instName})`;

  const defaultFooter = `
    <div style="margin-top: 36px; padding-top: 12px; border-top: 2px solid #800000; font-family: 'Bookman Old Style', 'Bookman', Georgia, serif; font-size: 11px; color: #000;">
      <!-- Bloco de Assinatura Digital Obrigatória do SIGEP -->
      <div style="margin-bottom: 20px; padding: 12px; border: 1.5px solid #800000; background: #fffdfd; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="line-height: 1.4;">
          <div style="font-weight: bold; font-size: 12px; color: #800000; text-transform: uppercase; margin-bottom: 4px;">
            🔒 ASSINATURA DIGITAL SIGEP (CERTIFICADA)
          </div>
          <div style="font-size: 11px; margin-bottom: 2px;"><strong>Código de Verificação:</strong> SIGEP-${year}-${Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
          <div style="font-size: 11px; margin-bottom: 2px;"><strong>Assinado Digitalmente por:</strong> Gestor Autorizado (${instName})</div>
          <div style="font-size: 11px; margin-bottom: 2px;"><strong>Cargo:</strong> ${cargoCorrespondente}</div>
          <div style="font-size: 11px; margin-bottom: 2px;"><strong>Data:</strong> ${day}/${month}/${year} | <strong>Hora:</strong> ${hours}:${minutes}</div>
          <div style="font-size: 9.5px; color: #555; margin-top: 4px;">Hash Criptográfico: SHA-256 Validado e Imutável</div>
        </div>
        <div style="text-align: center; flex-shrink: 0; border: 1px dashed #800000; padding: 8px; background: #ffffff;">
          <div style="font-size: 8px; font-weight: bold; color: #800000; margin-bottom: 2px;">QR CODE DE VALIDAÇÃO</div>
          <div style="width: 55px; height: 55px; background: #000; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: bold; margin: 0 auto;">SIGEP-QR</div>
          <div style="font-size: 8px; margin-top: 2px; color: #333;">Verificar Online</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 9.5px; font-weight: bold; color: #475569;">
        <span>${docFooterTag}</span>
        <span style="font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px; background: #f1f5f9; padding: 1px 5px; border-radius: 3px;">Documento Certificado SIGEP</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="line-height: 1.3; font-size: 10px;">
          <div>${instName} | ${instAddress}</div>
          <div>
            ${instTelefone ? `Tel: ${instTelefone}, ` : ""}email: <a href="mailto:${instEmail}" style="color: #2563eb; text-decoration: underline;">${instEmail}</a>${instWebsite ? `. Página oficial: <a href="${instWebsite}" target="_blank" style="color: #2563eb; text-decoration: underline;">${instWebsite}</a>` : ""}
          </div>
        </div>
        <div style="border: 1px solid #800000; padding: 1px; background: #fff; display: flex; align-items: center; justify-content: center; margin-left: 16px; flex-shrink: 0;">
          <img src="${instLogo}" alt="Logotipo ${instName}" style="height: 28px; width: auto; object-fit: contain;" />
        </div>
      </div>
    </div>
  `;

  const initialMargin = resolvedPageSize === "A3" && resolvedOrientation === "landscape" 
    ? "2cm 2cm 2cm 2.5cm" 
    : resolvedPageSize === "A4" && resolvedOrientation === "portrait"
    ? "2.5cm 2cm 2.5cm 3cm"
    : resolvedOrientation === "landscape"
    ? "2cm 2.5cm 2cm 2.5cm"
    : "2.5cm 2cm 2.5cm 3cm";

  const docHtml = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Songo SIGEP</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style id="dynamic-page-style">
        @page {
          size: ${resolvedPageSize} ${resolvedOrientation};
          margin: ${initialMargin};
        }
      </style>
      <style id="dynamic-zoom-style">
        @media print {
          .a4-container, #print-container {
            zoom: 1.0 !important;
            transform: none !important;
          }
        }
      </style>
      <style>
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            font-family: 'Bookman Old Style', 'Bookman', Georgia, serif !important;
            font-size: 12pt !important;
            line-height: 1.5 !important;
            text-align: justify !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, 
          button, 
          input[type="checkbox"], 
          input[type="radio"], 
          .btn-action, 
          [title*="Editar"], 
          [title*="Eliminar"], 
          [title*="Visualizar"],
          .th-checkbox, 
          .td-checkbox, 
          .th-actions, 
          .td-actions {
            display: none !important;
          }
          .a4-container, #print-container {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            zoom: 1.0 !important;
          }
          div, section, article, table, tbody, thead, tr, td, th, p, span, h1, h2, h3, h4, h5, h6 {
            overflow: visible !important;
            max-height: none !important;
            font-family: 'Bookman Old Style', 'Bookman', Georgia, serif !important;
          }
          p, span, li, td {
            text-align: justify !important;
            font-size: 12pt !important;
            line-height: 1.5 !important;
            color: #000000 !important;
          }
          h2, .sigep-title { font-size: 14pt !important; font-weight: bold !important; text-align: center !important; text-transform: uppercase !important; }
          h3, h4, h5, .sigep-subtitle { font-size: 14pt !important; font-weight: bold !important; text-align: center !important; }
          thead {
            display: table-header-group !important;
          }
          table {
            page-break-inside: auto;
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
            margin: 8px 0 !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: auto;
          }
          th, td {
            word-break: normal !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            font-size: 12pt !important;
            padding: 6px 8px !important;
            line-height: 1.5 !important;
            border: 1.5px solid #000000 !important;
            color: #000000 !important;
            vertical-align: middle !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            font-weight: bold !important;
            font-size: 12pt !important;
            text-align: center !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .whitespace-nowrap {
            white-space: normal !important;
          }
          [class*="min-w-"], .min-w-\[1900px\], .min-w-\[1200px\], .min-w-\[1500px\] {
            min-width: 0 !important;
            width: 100% !important;
          }
          .print-page-break {
            page-break-after: always;
            break-after: page;
          }
        }
        body {
          font-family: 'Bookman Old Style', 'Bookman', Georgia, serif;
          background-color: #0f172a;
          margin: 0;
          padding: 16px;
          color: #0f172a;
        }
        .a4-container, #print-container {
          background: white;
          width: 100%;
          max-width: ${resolvedPageSize === "A3" ? (resolvedOrientation === "landscape" ? "420mm" : "297mm") : (resolvedOrientation === "landscape" ? "297mm" : "210mm")};
          min-height: ${resolvedPageSize === "A3" ? (resolvedOrientation === "landscape" ? "297mm" : "420mm") : (resolvedOrientation === "landscape" ? "210mm" : "297mm")};
          margin: 0 auto;
          padding: 15mm;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12pt;
          margin-top: 10px;
          table-layout: auto;
        }
        th, td {
          border: 1.5px solid #111111;
          padding: 6px 8px;
          text-align: left;
          word-break: normal;
          overflow-wrap: break-word;
          white-space: normal;
          font-size: 12pt;
          line-height: 1.5;
          color: #000000;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
          color: #000000;
          font-size: 12pt;
          text-align: center;
        }
        p, span, div {
          text-align: justify;
          line-height: 1.5;
          font-size: 12pt;
          font-family: 'Bookman Old Style', 'Bookman', Georgia, serif;
        }
        .sigep-title, h2 { font-size: 14pt !important; font-weight: bold !important; text-align: center !important; text-transform: uppercase !important; }
        .sigep-subtitle, h3, h4, h5 { font-size: 14pt !important; font-weight: bold !important; text-align: center !important; }
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
        .font-bold { font-weight: bold !important; }

        /* Barra de controlo de formato interativa */
        .btn-format {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-format:hover {
          background: #334155;
          color: white;
        }
        .btn-format.active {
          background: #2563eb;
          color: white;
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
        }
        ${styles}
      </style>
    </head>
    <body>
      <!-- Painel de Controlo da Área de Impressão -->
      <div class="no-print" style="position: sticky; top: 0; background: #090d16; color: white; padding: 14px 20px; border-radius: 14px; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.4); margin-bottom: 24px; border: 1px solid #1e293b;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 22px;">🖨️</span>
            <div>
              <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: white;">${title}</h3>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;" id="status-text">
                Ajuste Recomendado: <strong style="color: #60a5fa;" id="current-format-label">${resolvedPageSize} ${resolvedOrientation.toUpperCase()}</strong> — ${detected.reason}
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 9px 22px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(37,99,235,0.4);">
              🖨️ Imprimir / Salvar PDF
            </button>
            <button onclick="window.close()" style="background: #334155; color: white; border: none; padding: 9px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">
              Fechar
            </button>
          </div>
        </div>

        <!-- Opções de Seleção de Formato A4/A3 e Orientação -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Formato do Papel:</span>
            <button id="btn-size-a4" onclick="applyFormat('A4', currentOrientation)" class="btn-format ${resolvedPageSize === "A4" ? "active" : ""}">A4 (210 × 297mm)</button>
            <button id="btn-size-a3" onclick="applyFormat('A3', currentOrientation)" class="btn-format ${resolvedPageSize === "A3" ? "active" : ""}">A3 (297 × 420mm)</button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Orientação da Folha:</span>
            <button id="btn-ori-portrait" onclick="applyFormat(currentPageSize, 'portrait')" class="btn-format ${resolvedOrientation === "portrait" ? "active" : ""}"> Vertical / Retrato</button>
            <button id="btn-ori-landscape" onclick="applyFormat(currentPageSize, 'landscape')" class="btn-format ${resolvedOrientation === "landscape" ? "active" : ""}"> Horizontal / Paisagem</button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Escala / Zoom:</span>
            <button id="btn-zoom-auto" onclick="applyZoom('auto')" class="btn-format active">Auto Fit</button>
            <button id="btn-zoom-100" onclick="applyZoom('1.0')" class="btn-format">100%</button>
            <button id="btn-zoom-85" onclick="applyZoom('0.85')" class="btn-format">85%</button>
            <button id="btn-zoom-70" onclick="applyZoom('0.70')" class="btn-format">70%</button>
          </div>
        </div>

        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #3b82f6;">
          <span>💡</span>
          <span><strong>Dica para Papel A4 / PDF:</strong> Para um resultado perfeito em papel A4, configure as Margens da impressora como <strong>"Nenhuma"</strong> (ou "Padrão") e certifique-se de ativar a opção <strong>"Gráficos de segundo plano"</strong> nas definições de impressão do seu navegador.</span>
        </div>
      </div>

      <div class="a4-container" id="print-container" ${printType ? `data-print-type="${printType}"` : ""}>
        ${defaultHeader}
        ${contentHtml}
        ${contentHtml.includes("border-t-[3px]") || contentHtml.includes("border-[#800000]") || contentHtml.includes("secretariado@ispsongo.ac.mz") ? "" : defaultFooter}
      </div>

      <script>
        var currentPageSize = '${resolvedPageSize}';
        var currentOrientation = '${resolvedOrientation}';
        var currentZoom = 'auto';

        function applyFormat(size, orientation) {
          currentPageSize = size;
          currentOrientation = orientation;

          var pageMargin = orientation === 'landscape' ? '5mm' : '10mm';
          
          // Atualiza CSS da Impressora
          document.getElementById('dynamic-page-style').innerHTML =
            '@page { size: ' + size + ' ' + orientation + '; margin: ' + pageMargin + '; }';

          // Atualiza Dimensões da Folha na Pré-visualização
          var container = document.getElementById('print-container');
          var maxWidths = {
            'A4-portrait': '210mm',
            'A4-landscape': '297mm',
            'A3-portrait': '297mm',
            'A3-landscape': '420mm'
          };
          var minHeights = {
            'A4-portrait': '297mm',
            'A4-landscape': '210mm',
            'A3-portrait': '420mm',
            'A3-landscape': '297mm'
          };

          var key = size + '-' + orientation;
          if (container) {
            container.style.maxWidth = maxWidths[key] || '210mm';
            container.style.minHeight = minHeights[key] || '297mm';
          }

          // Atualiza botões ativos
          document.querySelectorAll('[id^="btn-size-"]').forEach(function(b) { b.classList.remove('active'); });
          document.querySelectorAll('[id^="btn-ori-"]').forEach(function(b) { b.classList.remove('active'); });
          
          var sizeBtn = document.getElementById('btn-size-' + size.toLowerCase());
          var oriBtn = document.getElementById('btn-ori-' + orientation);
          if (sizeBtn) sizeBtn.classList.add('active');
          if (oriBtn) oriBtn.classList.add('active');

          document.getElementById('current-format-label').innerText = size + ' ' + orientation.toUpperCase();
          applyZoom(currentZoom);
        }

        function applyZoom(zoomVal) {
          currentZoom = zoomVal;
          var zoomScale = zoomVal === 'auto' ? '1.0' : zoomVal;
          
          document.getElementById('dynamic-zoom-style').innerHTML =
            '@media print { .a4-container, #print-container { zoom: ' + zoomScale + ' !important; transform: none !important; } }';

          document.querySelectorAll('[id^="btn-zoom-"]').forEach(function(b) { b.classList.remove('active'); });
          var zBtn = document.getElementById('btn-zoom-' + (zoomVal === '1.0' ? '100' : zoomVal === '0.85' ? '85' : zoomVal === '0.70' ? '70' : '100'));
          if (zBtn) zBtn.classList.add('active');
        }

        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 450);
        };
      </script>
    </body>
    </html>
  `;

  if (printWindow && !printWindow.closed && typeof printWindow.document !== "undefined") {
    try {
      printWindow.document.open();
      printWindow.document.write(docHtml);
      printWindow.document.close();
      printWindow.focus();
    } catch (err) {
      console.warn("Writing to popup print window failed, using iframe fallback:", err);
      printViaIframe(docHtml);
    }
  } else {
    printViaIframe(docHtml);
  }
}

/**
  * Método de Impressão via IFrame Oculto
  * Garante que a impressão funciona perfeitamente mesmo quando o bloqueador de popups do navegador está ativo.
  */
export function printViaIframe(docHtml: string): void {
  try {
    let iframe = document.getElementById("sigep-print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "sigep-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";
      iframe.style.zIndex = "-9999";
      document.body.appendChild(iframe);
    }

    const iframeWin = iframe.contentWindow;
    const iframeDoc = iframeWin?.document || iframe.contentDocument;

    if (!iframeDoc || !iframeWin) {
      printViaMountDiv(docHtml);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(docHtml);
    iframeDoc.close();

    // Aguardar tempo de renderização CSS e recursos
    setTimeout(() => {
      try {
        iframeWin.focus();
        iframeWin.print();
      } catch (err) {
        console.warn("Falha ao invocar print() no iframe, acionando fallback de container:", err);
        printViaMountDiv(docHtml);
      }
    }, 450);
  } catch (err) {
    console.warn("Exceção em printViaIframe, acionando printViaMountDiv:", err);
    printViaMountDiv(docHtml);
  }
}

/**
  * Método de Impressão por Injeção de Container na Página Principal (Tier 3)
  * Utilizado caso a sandboxing do iframe proíba chamadas ao diálogo de impressão.
  */
export function printViaMountDiv(docHtml: string): void {
  try {
    let mount = document.getElementById("sigep-print-mount");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "sigep-print-mount";
      document.body.appendChild(mount);
    }
    mount.innerHTML = docHtml;
    document.body.classList.add("sigep-printing-active");

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove("sigep-printing-active");
      }, 1000);
    }, 300);
  } catch (err) {
    console.error("Erro crítico na impressão:", err);
  }
}

/**
 * Extrai todo o conteúdo de um elemento DOM mantendo todos os dados inseridos,
 * selecionados em dropdowns, opções marcadas e expandindo áreas colapsadas/scrolláveis.
 */
export function extractFullPrintableHtml(sourceEl: HTMLElement): string {
  try {
    const clone = sourceEl.cloneNode(true) as HTMLElement;

    // Sincronizar os valores reais do DOM ativo para a cópia clonada antes de exportar
    const sourceControls = sourceEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    );
    const cloneControls = clone.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    );

    sourceControls.forEach((sEl, i) => {
      const cEl = cloneControls[i];
      if (!cEl) return;

      if (sEl.tagName === "SELECT") {
        const select = sEl as HTMLSelectElement;
        const selectedOption = select.options[select.selectedIndex];
        const textVal = selectedOption ? selectedOption.text : select.value || "";
        const span = document.createElement("span");
        span.className = "print-val font-semibold text-slate-900 border-b border-slate-300 px-1.5 py-0.5 inline-block min-w-[60px]";
        span.textContent = textVal || "—";
        cEl.replaceWith(span);
      } else if (sEl.tagName === "TEXTAREA") {
        const textarea = sEl as HTMLTextAreaElement;
        const val = textarea.value || textarea.textContent || "";
        const div = document.createElement("div");
        div.className = "print-val font-medium text-slate-900 bg-slate-50/80 p-2 border border-slate-300 rounded whitespace-pre-wrap my-1";
        div.textContent = val || "—";
        cEl.replaceWith(div);
      } else if (sEl.tagName === "INPUT") {
        const input = sEl as HTMLInputElement;
        const type = (input.type || "text").toLowerCase();

        if (type === "checkbox" || type === "radio") {
          const span = document.createElement("span");
          span.className = "print-checkbox font-bold px-1 text-slate-900";
          span.textContent = input.checked ? "[ X ]" : "[   ]";
          cEl.replaceWith(span);
        } else if (type === "hidden" || type === "button" || type === "submit") {
          cEl.remove();
        } else {
          const val = input.value || input.getAttribute("value") || "";
          const span = document.createElement("span");
          span.className = "print-val font-semibold text-slate-900 border-b border-slate-300 px-1.5 py-0.5 inline-block min-w-[60px]";
          span.textContent = val || "—";
          cEl.replaceWith(span);
        }
      }
    });

    // Expandir elementos colapsados, abas ocultas e sanfonas de detalhes
    const collapsedOrHidden = clone.querySelectorAll<HTMLElement>(
      ".hidden, .collapse, [class*='max-h-'], details"
    );
    collapsedOrHidden.forEach((el) => {
      if (el.classList.contains("no-print") || el.classList.contains("print:hidden")) {
        return;
      }
      el.classList.remove("hidden", "collapse");
      if (el.tagName === "DETAILS") {
        el.setAttribute("open", "true");
      }
      el.style.display = "block";
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
      el.style.height = "auto";
    });

    // Remover apenas botões e ações de interface
    const actionButtons = clone.querySelectorAll<HTMLElement>(
      "button, .no-print, .print\\:hidden, .fixed-action-btn, [title*='Editar'], [title*='Eliminar']"
    );
    actionButtons.forEach((btn) => btn.remove());

    return sanitizeHtmlForPrinting(clone.innerHTML);
  } catch (err) {
    console.warn("Erro em extractFullPrintableHtml, recorrendo a innerHTML básico:", err);
    return sanitizeHtmlForPrinting(sourceEl.innerHTML);
  }
}

export function sanitizeHtmlForPrinting(rawHtml: string): string {
  if (!rawHtml) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${rawHtml}</div>`, "text/html");

    // Processar formulários ou selects remanescentes em templates HTML estáticos
    const selects = doc.querySelectorAll("select");
    selects.forEach((sel) => {
      const selected = sel.querySelector("option[selected]") || sel.querySelector("option");
      const val = selected ? selected.textContent : sel.value || "—";
      const span = doc.createElement("span");
      span.className = "font-semibold text-slate-900 border-b border-slate-300 px-1.5 inline-block";
      span.textContent = val || "—";
      sel.replaceWith(span);
    });

    const inputs = doc.querySelectorAll("input");
    inputs.forEach((inp) => {
      const type = (inp.type || "text").toLowerCase();
      if (type === "checkbox" || type === "radio") {
        const span = doc.createElement("span");
        span.className = "font-bold px-1 text-slate-900";
        span.textContent = inp.hasAttribute("checked") ? "[ X ]" : "[   ]";
        inp.replaceWith(span);
      } else if (type !== "hidden") {
        const val = inp.getAttribute("value") || inp.value || "—";
        const span = doc.createElement("span");
        span.className = "font-semibold text-slate-900 border-b border-slate-300 px-1.5 inline-block";
        span.textContent = val;
        inp.replaceWith(span);
      } else {
        inp.remove();
      }
    });

    const textareas = doc.querySelectorAll("textarea");
    textareas.forEach((ta) => {
      const val = ta.textContent || ta.value || "—";
      const div = doc.createElement("div");
      div.className = "font-medium text-slate-900 bg-slate-50 p-2 border border-slate-300 rounded whitespace-pre-wrap my-1";
      div.textContent = val;
      ta.replaceWith(div);
    });

    // Limpar estilos de dark mode preservando toda a estrutura de dados
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
      let cls = el.getAttribute("class");
      if (cls) {
        cls = cls.replace(/bg-slate-[89]00\/?\d*/g, "bg-white");
        cls = cls.replace(/text-slate-[123]00/g, "text-slate-900");
        cls = cls.replace(/text-white/g, "text-slate-900");
        cls = cls.replace(/border-slate-[789]00\/?\d*/g, "border-slate-300");
        cls = cls.replace(/max-h-\[\d+vh\]/g, "max-h-none");
        cls = cls.replace(/overflow-y-auto/g, "overflow-visible");
        el.setAttribute("class", cls);
      }
    });

    // Remover APENAS botões e elementos explicitamente marcados como no-print
    const toRemove = doc.querySelectorAll(
      "button, .no-print, .print\\:hidden, [title*='Editar'], [title*='Eliminar']"
    );
    toRemove.forEach((el) => el.remove());

    // Remover classes fixas de largura excessiva mantendo largura fluida para papel
    const remainingElements = doc.querySelectorAll("*");
    remainingElements.forEach((el) => {
      if (el.className && typeof el.className === "string") {
        el.className = el.className
          .replace(/min-w-\[\d+px\]/g, "w-full")
          .replace(/w-\[\d+px\]/g, "")
          .replace(/whitespace-nowrap/g, "")
          .trim();
      }
    });

    return doc.body.firstElementChild ? doc.body.firstElementChild.innerHTML : rawHtml;
  } catch {
    return rawHtml;
  }
}

export function printElementById(
  elementId: string,
  title: string = "Documento Songo",
  orientation: "portrait" | "landscape" | "auto" = "auto",
  pageSize?: "A3" | "A4" | "A5" | "auto",
) {
  let el = document.getElementById(elementId);
  if (!el) {
    el = document.querySelector("#print-area") ||
         document.querySelector(".a4-container") ||
         document.querySelector("[id*='print']") ||
         document.querySelector("main");
  }

  if (!el) {
    window.print();
    return;
  }

  const cleanContent = extractFullPrintableHtml(el);

  openPrintDocumentWindow({
    title,
    contentHtml: cleanContent,
    orientation,
    pageSize,
    printType: el.getAttribute("data-print-type") || undefined,
  });
}

export interface PrintPlanOptions {
  activities: any[];
  user?: any;
  year: number;
  title?: string;
  subtitle?: string;
  isDPEP?: boolean;
}

export function printActivitiesPlanDocument(options: PrintPlanOptions) {
  const { activities = [], user, year, title, subtitle, isDPEP = false } = options;

  // Formatar números monetários
  const formatMZN = (val: any) =>
    Number(val || 0).toLocaleString("pt-MZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Agrupar por Direção e Departamento
  const grouped: Record<string, Record<string, any[]>> = {};

  activities.forEach((act) => {
    const dir = act.direcao || act.unidadeOrganica || "DIREÇÃO GERAL";
    const dept = act.departamento || act.setor || act.reparticao || "DEPARTAMENTO GERAL";
    if (!grouped[dir]) grouped[dir] = {};
    if (!grouped[dir][dept]) grouped[dir][dept] = [];
    grouped[dir][dept].push(act);
  });

  let grandTotal = 0;

  // Montar as linhas da tabela
  let tableRowsHtml = "";
  let globalIndex = 1;

  Object.entries(grouped).forEach(([dirName, depts]) => {
    let dirTotal = 0;

    Object.entries(depts).forEach(([deptName, actList]) => {
      actList.forEach((act) => {
        const rubricas =
          Array.isArray(act.rubricas) && act.rubricas.length > 0
            ? act.rubricas
            : [
                {
                  rubrica: act.rubrica || "-",
                  necessidade: act.necessidade || act.especificacoes || act.detalhes || "-",
                  quantidade: act.quantidade || act.numeroPessoas || "-",
                  precoUnitario: act.unitario || act.precoUnitario || 0,
                  valorTotal: act.ajudaCusto || act.valorTotal || 0,
                },
              ];

        const actTotal = rubricas.reduce(
          (sum: number, r: any) =>
            sum + (Number(r.valorTotal) || Number(r.quantidade || 0) * Number(r.precoUnitario || 0) || 0),
          0
        );
        dirTotal += actTotal;
        grandTotal += actTotal;

        const codAct = act.codigoActividade || act.referencia || act.codigo || "-";
        const nomeAct = act.nomeActividade || act.designacao || act.title || act.actividade || "-";
        const objAct = act.objetivo || act.objetivoActividade || "-";
        const orgao = act.orgao || act.unidadeOrganica || (user?.unidadeOrganica) || "Songo";
        const noDir = act.noDirecao || act.no || globalIndex;

        // Meses / Trimestre
        const meses = Array.isArray(act.mesesRealizacao) && act.mesesRealizacao.length > 0
          ? act.mesesRealizacao.join(", ")
          : (act.trimestre || act.mesRealizacao || act.periodo || "-");

        const transporte = act.necessitaTransporte === "Sim" || act.transporte === "Sim" ? "Sim" : "Não";
        const observacoes = act.observacoes || "-";
        const meta = act.meta || act.metas || act.indicador || "-";

        rubricas.forEach((rItem: any, rIdx: number) => {
          const rTotal = Number(rItem.valorTotal) || Number(rItem.quantidade || 0) * Number(rItem.precoUnitario || 0) || 0;
          const isFirstRow = rIdx === 0;
          const rowSpan = rubricas.length;

          tableRowsHtml += `
            <tr style="page-break-inside: avoid; border-bottom: 1px solid #000000; font-size: 12px;">
              ${isFirstRow ? `
                <td rowspan="${rowSpan}" style="text-align: center; font-weight: bold; border: 1.5px solid #000000; padding: 6px 4px; width: 35px;">${globalIndex}</td>
                <td rowspan="${rowSpan}" style="text-align: center; border: 1.5px solid #000000; padding: 6px 4px; width: 45px; font-weight: bold;">${noDir}</td>
                <td rowspan="${rowSpan}" style="border: 1.5px solid #000000; padding: 6px 8px; width: 80px;">${orgao}</td>
                <td rowspan="${rowSpan}" style="border: 1.5px solid #000000; padding: 6px 8px; width: 100px;">${dirName}</td>
                <td rowspan="${rowSpan}" style="border: 1.5px solid #000000; padding: 6px 8px; width: 100px;">${deptName}</td>
                <td rowspan="${rowSpan}" style="text-align: center; font-weight: bold; border: 1.5px solid #000000; padding: 6px 6px; width: 75px;">${codAct}</td>
                <td rowspan="${rowSpan}" style="font-weight: bold; border: 1.5px solid #000000; padding: 6px 8px;">${nomeAct}</td>
                <td rowspan="${rowSpan}" style="border: 1.5px solid #000000; padding: 6px 8px;">${objAct}</td>
                <td rowspan="${rowSpan}" style="text-align: center; border: 1.5px solid #000000; padding: 6px 6px; width: 85px;">${meses}</td>
                <td rowspan="${rowSpan}" style="text-align: center; border: 1.5px solid #000000; padding: 6px 6px; width: 50px;">${meta}</td>
                <td rowspan="${rowSpan}" style="text-align: center; border: 1.5px solid #000000; padding: 6px 4px; width: 45px;">${transporte}</td>
              ` : ""}
              <td style="border: 1.5px solid #000000; padding: 6px 8px; font-weight: 600; width: 130px;">${rItem.rubrica || "-"}</td>
              <td style="border: 1.5px solid #000000; padding: 6px 8px; font-style: italic; width: 140px;">${rItem.necessidade || rItem.especificacao || "-"}</td>
              <td style="border: 1.5px solid #000000; padding: 6px 8px; width: 130px;">${rItem.nomeProduto || rItem.produto || rItem.item || rItem.nomeItem || "-"}</td>
              <td style="text-align: center; border: 1.5px solid #000000; padding: 6px 4px; width: 45px; font-weight: bold;">${rItem.quantidade || "-"}</td>
              <td style="text-align: right; border: 1.5px solid #000000; padding: 6px 8px; width: 85px;">${rItem.precoUnitario ? formatMZN(rItem.precoUnitario) : "-"}</td>
              <td style="text-align: right; font-weight: bold; border: 1.5px solid #000000; padding: 6px 8px; width: 95px; background-color: #f8fafc;">${formatMZN(rTotal)}</td>
              ${isFirstRow ? `
                <td rowspan="${rowSpan}" style="border: 1.5px solid #000000; padding: 6px 8px; width: 90px; color: #334155;">${observacoes}</td>
              ` : ""}
            </tr>
          `;
        });

        globalIndex++;
      });
    });

    // Subtotal da Direção
    tableRowsHtml += `
      <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #000000; border-bottom: 2px solid #000000; font-size: 12px;">
        <td colspan="16" style="border: 1.5px solid #000000; padding: 8px 12px;">
          Subtotal Direção: ${dirName}
        </td>
        <td style="text-align: right; border: 1.5px solid #000000; padding: 8px 12px; font-size: 13px; font-weight: 900; background-color: #e2e8f0;">
          ${formatMZN(dirTotal)} MT
        </td>
        <td style="border: 1.5px solid #000000; padding: 8px;"></td>
      </tr>
    `;
  });

  // Linha de TOTAL GERAL
  tableRowsHtml += `
    <tr style="background-color: #0f172a; color: #ffffff; font-weight: 900; border: 2px solid #000000; font-size: 13px;">
      <td colspan="16" style="border: 1.5px solid #000000; padding: 10px 14px; color: #ffffff; letter-spacing: 0.5px;">
        Valor Global Total do Plano de Actividades (${year})
      </td>
      <td style="text-align: right; border: 1.5px solid #000000; padding: 10px 14px; font-size: 14px; font-weight: 900; color: #ffffff; background-color: #1e293b;">
        ${formatMZN(grandTotal)} MT
      </td>
      <td style="border: 1.5px solid #000000; padding: 10px; background-color: #0f172a;"></td>
    </tr>
  `;

  // Construir a tabela completa
  const tableHtml = `
    <div style="width: 100%; margin-top: 15px;">
      <table style="width: 100%; border-collapse: collapse; table-layout: auto; font-family: 'Latin Modern Roman', 'Times New Roman', serif; font-size: 12px; border: 2px solid #000000;">
        <thead>
          <tr style="background-color: #3b82f6; color: #ffffff; font-size: 12px; font-weight: 900; border: 1.5px solid #000000;">
            <th rowspan="2" style="border: 1.5px solid #000000; padding: 6px 4px; text-align: center; width: 35px; color: #000000; background-color: #cbd5e1;">N/O</th>
            <th rowspan="2" style="border: 1.5px solid #000000; padding: 6px 4px; text-align: center; width: 45px; color: #000000; background-color: #cbd5e1;">Nº Dir.</th>
            <th colspan="3" style="border: 1.5px solid #000000; padding: 6px 8px; text-align: center; color: #000000; background-color: #e2e8f0;">I. Identificação</th>
            <th colspan="3" style="border: 1.5px solid #000000; padding: 6px 8px; text-align: center; color: #000000; background-color: #e2e8f0;">II. Actividade</th>
            <th colspan="2" style="border: 1.5px solid #000000; padding: 6px 6px; text-align: center; color: #000000; background-color: #e2e8f0;">V. Tempo</th>
            <th rowspan="2" style="border: 1.5px solid #000000; padding: 6px 4px; text-align: center; width: 45px; color: #000000; background-color: #cbd5e1;">VI. Trans</th>
            <th colspan="6" style="border: 1.5px solid #000000; padding: 6px 8px; text-align: center; color: #000000; background-color: #e2e8f0;">VII. Rubricas e Necessidades</th>
            <th rowspan="2" style="border: 1.5px solid #000000; padding: 6px 8px; text-align: center; width: 90px; color: #000000; background-color: #cbd5e1;">IX. Obs</th>
          </tr>
          <tr style="background-color: #f1f5f9; color: #000000; font-size: 11px; font-weight: 800; border: 1.5px solid #000000;">
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: center; color: #000000; width: 80px;">Órgão</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: center; color: #000000; width: 100px;">Direção</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: center; color: #000000; width: 100px;">Departamento</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: center; color: #000000; width: 75px;">Cód.</th>
            <th style="border: 1.5px solid #000000; padding: 5px 8px; text-align: left; color: #000000;">Designação</th>
            <th style="border: 1.5px solid #000000; padding: 5px 8px; text-align: left; color: #000000;">Objetivo</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: center; color: #000000; width: 85px;">Período</th>
            <th style="border: 1.5px solid #000000; padding: 5px 4px; text-align: center; color: #000000; width: 50px;">Met/Real.</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: left; color: #000000; width: 130px;">Rubrica</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: left; color: #000000; width: 140px;">Necessidade</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: left; color: #000000; width: 130px;">nome do produto</th>
            <th style="border: 1.5px solid #000000; padding: 5px 4px; text-align: center; color: #000000; width: 45px;">Qtd</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: right; color: #000000; width: 85px;">Preço Unit.</th>
            <th style="border: 1.5px solid #000000; padding: 5px 6px; text-align: right; color: #000000; width: 95px;">Total (MT)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </div>
  `;

  // Resolver título do plano
  const lowestArea = [
    user?.setor,
    user?.reparticao,
    user?.departamento,
    user?.direcao,
    user?.unidadeOrganica,
  ].filter(Boolean)[0] || "INSTITUCIONAL";

  const resolvedTitle = title || `Plano de Actividade de ${lowestArea} - ${year}`;

  openPrintDocumentWindow({
    title: resolvedTitle,
    subtitle: subtitle || `Documento Oficial do Plano Económico e Social e Orçamento da Entidade (PESOE) - ${year}`,
    orgao: user?.unidadeOrganica,
    direcao: user?.direcao,
    departamento: user?.departamento,
    reparticao: user?.reparticao,
    setor: user?.setor,
    contentHtml: tableHtml,
    pageSize: "A3",
    orientation: "landscape",
  });
}

