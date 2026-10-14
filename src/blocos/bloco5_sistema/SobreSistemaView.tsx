import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  FileText,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Check,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "../../lib/utils";
import SigepLogo from "../../components/SigepLogo";
import { firestoreService } from "../../lib/firestoreService";
import { optimizeImageForFirestore } from "../../lib/imageUtils";

export interface SobreSistemaViewProps {
  currentLogo?: string | null;
  onLogoUpdated?: (newLogo: string | null) => void;
  user?: any;
  onShowAlert?: (msg: string, type?: "success" | "error" | "info") => void;
}

const pages = [
  {
    id: 1,
    title: "Página 1: Enquadramento & Objetivos",
    subtitle: "Visão Geral, Objetivo Geral e Objetivos Específicos",
    content: `## 1. Enquadramento

O **SIGEP – Sistema Integrado de Gestão de Processos** é uma plataforma digital concebida para apoiar a **modernização, integração e transformação dos processos institucionais**, disponibilizando um ambiente único para gerir, acompanhar e controlar as principais atividades e procedimentos de uma instituição.

A plataforma foi concebida para ser **flexível, modular, segura e adaptável**, podendo ser implementada em diferentes instituições em Moçambique, independentemente da sua dimensão, estrutura ou área de atuação.

O SIGEP procura substituir processos fragmentados, baseados em documentos físicos, comunicações dispersas e procedimentos manuais, por **processos digitais estruturados, rastreáveis, transparentes e orientados para resultados**.

Mais do que informatizar tarefas, o SIGEP pretende **melhorar a forma como as instituições planeiam, executam, comunicam, controlam, avaliam e tomam decisões**.

---

## 2. Objetivo Geral

O objetivo geral do SIGEP é **disponibilizar uma plataforma integrada para a gestão, tramitação, planificação, execução, monitoria, documentação, comunicação e controlo dos processos institucionais**, garantindo maior eficiência, transparência, segurança, responsabilização e qualidade na prestação dos serviços.

O sistema procura assegurar que a informação institucional esteja **centralizada, organizada, disponível, atualizada e protegida**, permitindo que os responsáveis tenham acesso à informação necessária para acompanhar as operações e tomar decisões fundamentadas.

---

## 3. Objetivos Específicos

O SIGEP tem como principais objetivos:

1. **Digitalizar os processos institucionais**, reduzindo a dependência de procedimentos manuais e documentos físicos.

2. **Integrar diferentes áreas da instituição** numa plataforma única, evitando a dispersão da informação.

3. **Automatizar fluxos de trabalho**, reduzindo etapas desnecessárias e melhorando a velocidade de tramitação.

4. **Garantir a rastreabilidade dos processos**, permitindo identificar responsáveis, ações, datas, movimentações e decisões.

5. **Melhorar a transparência institucional**, proporcionando mecanismos de acompanhamento e controlo de acordo com os níveis de acesso definidos.

6. **Apoiar a planificação institucional**, permitindo transformar objetivos e planos em atividades concretas, responsáveis, metas e indicadores.

7. **Controlar a execução das atividades**, permitindo comparar o que foi planificado com aquilo que foi efetivamente realizado.

8. **Fortalecer a monitoria e avaliação**, disponibilizando indicadores e informações atualizadas sobre o desempenho institucional.

9. **Automatizar a produção de relatórios**, utilizando os dados efetivamente registados no sistema.

10. **Digitalizar e organizar processos individuais**, garantindo maior segurança, disponibilidade e controlo da informação.

11. **Modernizar a gestão patrimonial**, permitindo identificar, localizar, movimentar e acompanhar os bens institucionais durante o seu ciclo de vida.

12. **Facilitar a comunicação interna**, através de um sistema integrado de mensagens e partilha de informação.

13. **Reforçar a segurança da informação**, através de perfis, permissões, controlo de acesso e auditoria.

14. **Apoiar a tomada de decisão**, disponibilizando informação estruturada, indicadores, dashboards e relatórios.`
  },
  {
    id: 2,
    title: "Página 2: Principais Áreas Funcionais",
    subtitle: "Módulos Operacionais da Plataforma (4.1 a 4.12)",
    content: `## 4. Principais Áreas Funcionais

O SIGEP integra um conjunto de áreas funcionais interligadas, permitindo que a instituição tenha uma visão global dos seus processos.

### 4.1. Gestão de Processos
Permite gerir todo o ciclo de vida dos processos, desde a criação ou receção até à tramitação, análise, encaminhamento, despacho, aprovação, conclusão e arquivo. Cada processo mantém o seu histórico, permitindo acompanhar o seu estado, responsáveis, documentos, decisões e movimentações.

### 4.2. Gestão de Planificação
Permite elaborar e acompanhar planos estratégicos, planos anuais, planos operacionais, planos setoriais, planos de atividades, planos individuais e programas ou projetos institucionais. Cada plano pode conter objetivos, atividades, responsáveis, metas, indicadores, prazos e resultados esperados.

### 4.3. Gestão e Controlo de Atividades
O SIGEP permite acompanhar o ciclo completo das atividades:
**Planificação → Programação → Execução → Monitoria → Avaliação → Relatório.**
Cada atividade pode possuir responsável, prazo, estado, meta, indicador, resultado esperado e evidências da execução. O sistema permite identificar atividades concluídas, em execução, atrasadas, suspensas, canceladas ou não iniciadas.

### 4.4. Monitoria e Avaliação
A plataforma permite comparar continuamente o **planeado com o executado**, fornecendo indicadores sobre o nível de realização dos planos e atividades. Os gestores podem acompanhar o desempenho por instituição, unidade, departamento, setor, responsável ou período.

### 4.5. Relatórios e Informação de Gestão
O SIGEP gera relatórios com base nos dados existentes na plataforma. Isso permite produzir informação sobre execução de planos e atividades, cumprimento de metas, processos concluídos e pendentes, desempenho institucional e situação patrimonial. Os relatórios deixam de depender exclusivamente de consolidações manuais e passam a refletir os **dados efetivamente registados no sistema**.

### 4.6. Gestão Documental
Permite digitalizar, classificar, armazenar, consultar, encaminhar e arquivar documentos. Os documentos podem ser associados a processos, atividades, planos, pessoas ou outras entidades institucionais.

### 4.7. Gestão de Processos Individuais Digitalizados
Permite criar **dossiês digitais individuais**, organizando documentos e informações relacionados com cada pessoa abrangida pela instituição. O sistema mantém o histórico e controla o acesso às informações de acordo com as permissões atribuídas.

### 4.8. Gestão Patrimonial
Permite gerir o património institucional através de cadastro de bens, inventário, localização, responsável, estado de conservação, movimentação, transferência, manutenção, conferência física e abate. O SIGEP permite acompanhar o **ciclo de vida dos bens institucionais**.

### 4.9. Comunicação Interna
O sistema possui um ambiente interno de comunicação que permite enviar e receber mensagens, criar conversas, partilhar documentos e associar mensagens a processos ou atividades.

### 4.10. Tramitação e Aprovação
O SIGEP permite configurar fluxos de tramitação de acordo com a estrutura da instituição. Um processo pode ser encaminhado sucessivamente aos responsáveis competentes, mantendo o histórico de cada etapa.

### 4.11. Notificações e Alertas
A plataforma pode emitir alertas relacionados com novos processos, tarefas atribuídas, prazos, processos pendentes, atividades atrasadas e solicitações de aprovação.

### 4.12. Gestão de Utilizadores e Permissões
O SIGEP permite administrar utilizadores, funções, cargos, unidades e níveis de acesso. Cada utilizador possui permissões específicas para consultar, criar, alterar, encaminhar, aprovar ou administrar informações.`
  },
  {
    id: 3,
    title: "Página 3: Transparência, Segurança & Gestão",
    subtitle: "Rastreabilidade, Controlo de Acesso e Tomada de Decisão",
    content: `## 5. Transparência e Rastreabilidade

A **transparência é um dos princípios estruturantes do SIGEP**.

A plataforma permite acompanhar o percurso dos processos e das atividades, respeitando sempre os níveis de confidencialidade e acesso definidos pela instituição.

O sistema pode registar:
* Utilizador responsável;
* Data e hora da operação;
* Movimentação do processo;
* Alterações efetuadas;
* Documentos associados;
* Encaminhamentos, despachos e aprovações;
* Decisões e estado do processo;
* Histórico da atividade.

Assim, cada operação relevante pode ser **rastreada e auditada**.

> **Toda operação relevante deve deixar um registo verificável no sistema.**

---

## 6. Segurança e Controlo

O SIGEP incorpora mecanismos destinados a proteger a informação institucional através de:
* Autenticação de utilizadores e perfis de acesso;
* Permissões por função e controlo de acesso à informação;
* Registo de atividades, auditoria e histórico de alterações;
* Proteção dos documentos e gestão de sessões;
* Mecanismos de recuperação e continuidade, conforme a infraestrutura adotada.

A segurança é applied de forma integrada, garantindo que a transparência não comprometa a **confidencialidade das informações institucionais**.

---

## 7. Dashboards e Tomada de Decisão

O SIGEP disponibiliza **dashboards de gestão**, permitindo transformar dados operacionais em informação útil para os gestores.

Os responsáveis podem acompanhar indicadores como:
**Planificado | Programado | Em execução | Executado | Atrasado | Não executado**

Esta informação permite identificar rapidamente problemas, desvios e áreas que necessitam de intervenção. O gestor passa a dispor de uma **visão estruturada da situação institucional** em tempo real.`
  },
  {
    id: 4,
    title: "Página 4: Qualidade & Benefícios",
    subtitle: "Ganhos Institucionais proporcionados pelo SIGEP (8.1 a 8.10)",
    content: `## 8. Qualidade que o SIGEP proporciona às instituições

A implementação do SIGEP contribui diretamente para elevar a **qualidade da gestão institucional**.

### 8.1. Maior eficiência
A digitalização e automatização reduzem tarefas repetitivas, circulação física de documentos e tempo gasto na localização de informações.

### 8.2. Maior transparência
Os processos passam a possuir histórico, responsáveis, movimentações e registos verificáveis.

### 8.3. Maior responsabilização
Cada utilizador atua dentro das suas competências e as operações relevantes podem ser associadas ao respetivo responsável.

### 8.4. Maior controlo
A instituição consegue acompanhar processos, atividades, prazos, planos, património e resultados de forma estruturada.

### 8.5. Melhor comunicação
A comunicação interna passa a estar integrada com os processos e atividades, reduzindo a dispersão da informação.

### 8.6. Melhor organização
Documentos, processos, atividades, planos e informações individuais passam a estar estruturados num ambiente centralizado.

### 8.7. Redução de perdas de informação
A digitalização e o arquivo estruturado reduzem os riscos associados à perda, extravio ou deterioração de documentos físicos.

### 8.8. Melhor capacidade de decisão
Os gestores passam a dispor de **indicadores, dashboards e relatórios baseados nos dados registados no sistema**.

### 8.9. Maior capacidade de monitoria
A instituição pode acompanhar continuamente aquilo que foi planeado, executado, atrasado ou não realizado.

### 8.10. Melhoria contínua
A informação produzida pelo SIGEP permite identificar problemas, analisar resultados e implementar medidas corretivas.`
  },
  {
    id: 5,
    title: "Página 5: Impacto, Visão & Conclusão",
    subtitle: "Transformação Digital e Princípio Fundamental",
    content: `## 9. Impacto Institucional

O SIGEP contribui para uma mudança significativa na forma de funcionamento das instituições.

Em vez de:
**Documentos dispersos → processos manuais → informação fragmentada → comunicação informal → relatórios manuais → decisões tardias**

A instituição passa a trabalhar com:
**Processos digitais → informação centralizada → fluxos controlados → comunicação integrada → monitoria contínua → relatórios baseados em dados → decisões fundamentadas.**

---

## 10. Visão do SIGEP

O SIGEP pretende constituir-se como um **ecossistema digital de gestão institucional**, capaz de integrar pessoas, processos, atividades, documentos, património, comunicação, informação e resultados num único ambiente.

O ciclo de gestão promovido pelo sistema pode ser representado por:

**PLANIFICAR → PROGRAMAR → EXECUTAR → DOCUMENTAR → COMUNICAR → MONITORAR → AVALIAR → REPORTAR → CORRIGIR → MELHORAR**

---

## 11. Conclusão

O **SIGEP – Sistema Integrado de Gestão de Processos** representa uma solução tecnológica destinada a apoiar a modernização das instituições em Moçambique, promovendo uma gestão mais **eficiente, transparente, organizada, segura, rastreável e orientada para resultados**.

Em síntese, o SIGEP procura criar instituições mais:
**EFICIENTES • TRANSPARENTES • ORGANIZADAS • RESPONSÁVEIS • SEGURAS • RASTREÁVEIS • ORIENTADAS PARA RESULTADOS**

### Princípio fundamental

> **“Planificar com clareza, executar com controlo, comunicar com segurança, acompanhar com transparência, comprovar com evidências e decidir com base em informação.”**`
  },
  {
    id: 6,
    title: "Página 6: Ficha Técnica",
    subtitle: "Propriedade, Autoria e Arquitetura",
    content: `## 12. Ficha Técnica

Este sistema foi idealizado, desenhado e desenvolvido de raiz para promover a excelência na gestão, operação e tramitação processual, aplicando os mais elevados padrões de segurança, escalabilidade e design centrado no utilizador.

### 12.1. Propriedade e Direitos
* **Nome do Sistema:** SIGEP – Sistema Integrado de Gestão de Processos
* **Designação Secundária:** Plataforma Inteligente de Gestão de Processos Institucionais
* **Âmbito de Aplicação:** Instituições de Ensino Superior e Entidades Estatais de Moçambique

### 12.2. Coordenação e Desenvolvimento Técnico
* **Arquiteto de Software & Programador Principal:** Slaiter Tripas (slaitertripas@gmail.com)
* **Design UI/UX e Frontend:** Slaiter Tripas
* **Engenharia de Dados e Infraestrutura Cloud:** Slaiter Tripas

### 12.3. Especificações Tecnológicas
* **Ambiente de Execução:** Cloud-Native e Serverless
* **Frontend:** React, TypeScript, Tailwind CSS
* **Arquitetura de Dados:** Real-time NoSQL, Estrutura em Grafo e Sincronização Descentralizada
* **Segurança de Tráfego:** Autenticação End-to-End, Encriptação de Sessão, Role-Based Access Control (RBAC)

> **Nota de Autoria e Direitos:** A infraestrutura de base, código-fonte, algoritmos de tramitação e identidade visual original associada ao sistema SIGEP constituem propriedade intelectual do seu programador e arquiteto de software. A adoção desta plataforma pressupõe a sua utilização como ferramenta licenciada ao serviço da modernização da gestão institucional.`
  }
];

function convertMarkdownToHtml(md: string): string {
  let html = md;
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="color:#b91c1c; font-size:16px; font-weight:800; border-left:3px solid #fca5a5; padding-left:10px; margin-top:20px; margin-bottom:10px; text-align:left;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color:#dc2626; font-size:20px; font-weight:900; border-left:4px solid #dc2626; padding-left:12px; margin-top:24px; margin-bottom:14px; text-align:left;">$1</h2>');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left:4px solid #dc2626; background:#fef2f2; margin:16px 0; padding:12px 16px; font-style:italic; border-radius:0 8px 8px 0; text-align:justify;">$1</blockquote>');
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0;" />');
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li style="margin-bottom:6px; text-align:justify;">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-bottom:6px; text-align:justify;">$1</li>');
  // Paragraphs
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(p => {
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<hr') || p.startsWith('<li')) {
      return p;
    }
    return `<p style="text-align:justify; margin:10px 0; line-height:1.6; color:#334155;">${p.trim()}</p>`;
  }).join('');

  return html;
}

export default function SobreSistemaView({
  currentLogo,
  onLogoUpdated,
  user,
  onShowAlert,
}: SobreSistemaViewProps = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);

  // Estados de Gestão do Logotipo do Sistema
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    return currentLogo || localStorage.getItem("systemLogo") || null;
  });
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [isLogoPanelOpen, setIsLogoPanelOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar com props e Firestore em tempo real
  useEffect(() => {
    if (currentLogo !== undefined) {
      setSystemLogo(currentLogo);
    }
  }, [currentLogo]);

  useEffect(() => {
    const unsubscribe = firestoreService.config.subscribe("main_config", (data) => {
      if (data && data.systemLogo !== undefined) {
        setSystemLogo(data.systemLogo || null);
        if (data.systemLogo) {
          localStorage.setItem("systemLogo", data.systemLogo);
        } else {
          localStorage.removeItem("systemLogo");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const totalPages = pages.length;
  const activePageData = pages.find((p) => p.id === currentPage) || pages[0];

  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusMessage({
        text: "Por favor, selecione um ficheiro de imagem válido (PNG, JPG, SVG, WebP).",
        type: "error",
      });
      return;
    }
    try {
      setIsProcessingImage(true);
      setStatusMessage(null);
      const optimizedBase64 = await optimizeImageForFirestore(file, 320, 320, 180 * 1024);
      if (!optimizedBase64) {
        setStatusMessage({ text: "Ficheiro demasiado grande ou formato não suportado. Tente outra imagem.", type: "error" });
        return;
      }
      setPreviewLogo(optimizedBase64);
    } catch (err) {
      console.error("Erro ao processar imagem do logotipo:", err);
      setStatusMessage({ text: "Erro ao processar a imagem do logotipo. Tente outro ficheiro.", type: "error" });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) {
      setStatusMessage({ text: "Por favor, insira o link de uma imagem.", type: "error" });
      return;
    }
    try {
      setIsProcessingImage(true);
      const optimized = await optimizeImageForFirestore(urlInput.trim(), 320, 320, 180 * 1024);
      setPreviewLogo(optimized || urlInput.trim());
      setStatusMessage(null);
    } catch (_) {
      setPreviewLogo(urlInput.trim());
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSaveLogo = async () => {
    let targetLogo = previewLogo !== null ? previewLogo : systemLogo;
    if (!targetLogo) return;

    try {
      setIsSavingLogo(true);
      // Garantir otimização prévia antes de enviar ao Firestore
      if (typeof targetLogo === "string" && (targetLogo.startsWith("data:image/") || targetLogo.length > 80000)) {
        try {
          targetLogo = await optimizeImageForFirestore(targetLogo, 300, 300, 100 * 1024);
        } catch (compErr) {
          console.warn("Aviso ao otimizar imagem no cliente:", compErr);
        }
      }

      // Salvar imediatamente no localStorage para garantia de persistência no navegador
      try {
        localStorage.setItem("systemLogo", targetLogo);
      } catch (_) {}

      setSystemLogo(targetLogo);
      setPreviewLogo(null);
      setUrlInput("");

      // Disparar atualização em tempo real para todo o sistema SIGEP
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sigep_system_logo_updated", { detail: { logo: targetLogo } })
        );
      }

      // Persistir no Firestore
      await firestoreService.config.set("main_config", {
        systemLogo: targetLogo,
      });

      if (onLogoUpdated) onLogoUpdated(targetLogo);
      if (onShowAlert) onShowAlert("Logotipo oficial do sistema guardado com sucesso!", "success");

      setStatusMessage({
        text: "Logotipo oficial do sistema guardado e aplicado no SIGEP com sucesso!",
        type: "success",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.error("Erro ao guardar logotipo no Firestore:", err);
      const isSizeError = err?.message?.includes("exceeds the maximum allowed size");
      const errorText = isSizeError
        ? "A imagem selecionada excede a cota permitida pelo banco de dados. O sistema aplicou a imagem localmente, por favor tente com um ficheiro menor para sincronizar na nuvem."
        : `Erro ao guardar o logotipo na nuvem (${err?.message || "conexão temporária"}). O logotipo foi aplicado na sessão atual.`;
      setStatusMessage({ text: errorText, type: "error" });
      if (onShowAlert) onShowAlert(errorText, "error");
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (!window.confirm("Deseja realmente restaurar o logotipo original padrão do SIGEP?")) {
      return;
    }
    try {
      setIsSavingLogo(true);
      await firestoreService.config.set("main_config", {
        systemLogo: null,
      });
      localStorage.removeItem("systemLogo");
      setSystemLogo(null);
      setPreviewLogo(null);
      setUrlInput("");

      // Disparar atualização em tempo real para todo o sistema SIGEP
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sigep_system_logo_updated", { detail: { logo: null } })
        );
      }

      if (onLogoUpdated) onLogoUpdated(null);
      if (onShowAlert) onShowAlert("Logotipo padrão do SIGEP restaurado com sucesso!", "success");

      setStatusMessage({ text: "Logotipo padrão restaurado com sucesso!", type: "success" });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error("Erro ao restaurar logotipo:", err);
      setStatusMessage({ text: "Erro ao restaurar o logotipo padrão.", type: "error" });
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handlePrint = () => {
    // Abrir o documento formatado em PDF numa nova janela direcionada para impressão
    try {
      const printWin = window.open("", "_blank");
      if (printWin) {
        const fullHtml = `
          <!DOCTYPE html>
          <html lang="pt">
          <head>
            <meta charset="UTF-8">
            <title>SIGEP - Manual do Sistema (PDF)</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
              body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 40px;
                color: #0f172a;
                background-color: #fff;
                line-height: 1.6;
                text-align: justify;
              }
              .header {
                border-bottom: 3px solid #dc2626;
                padding-bottom: 16px;
                margin-bottom: 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .header h1 {
                margin: 0;
                color: #dc2626;
                font-size: 24px;
                font-weight: 900;
              }
              .header p {
                margin: 4px 0 0 0;
                color: #64748b;
                font-size: 13px;
                font-weight: 600;
              }
              .page {
                page-break-after: always;
                break-after: page;
                margin-bottom: 40px;
                padding-bottom: 24px;
                border-bottom: 1px dashed #cbd5e1;
              }
              .page:last-child {
                page-break-after: auto;
                break-after: auto;
                border-bottom: none;
              }
              .page-header {
                font-size: 11px;
                font-weight: 800;
                color: #dc2626;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 16px;
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 8px;
              }
              p, li {
                text-align: justify;
                font-size: 13px;
                color: #334155;
              }
              .footer {
                margin-top: 40px;
                font-size: 11px;
                color: #94a3b8;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                padding-top: 16px;
              }
              @media print {
                body { padding: 20px; }
                .no-print-btn { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="no-print-btn" style="text-align: right; margin-bottom: 24px;">
              <button onclick="window.print()" style="background:#dc2626; color:#fff; border:none; padding:12px 24px; border-radius:10px; font-weight:800; font-size:14px; cursor:pointer; box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                🖨️ Imprimir / Guardar em PDF
              </button>
            </div>

            <div class="header">
              <div style="display:flex; align-items:center; gap:16px;">
                ${
                  systemLogo
                    ? `<img src="${systemLogo}" alt="Logotipo SIGEP" style="max-height:50px; max-width:140px; object-fit:contain; border-radius:8px;" />`
                    : `<div style="width:44px; height:44px; background:#000066; color:#fff; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:15px; letter-spacing:-0.5px;">SIGEP</div>`
                }
                <div>
                  <h1>SIGEP – Sistema Integrado de Gestão de Processos</h1>
                  <p>Manual do Sistema & Documentação Institucional Oficial</p>
                </div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b;">
                <strong>Data de Emissão:</strong> ${new Date().toLocaleDateString("pt-PT")}
              </div>
            </div>

            ${pages
              .map(
                (p) => `
                <div class="page">
                  <div class="page-header">
                    <span>${p.title}</span>
                    <span>Página ${p.id} de ${pages.length}</span>
                  </div>
                  <div>
                    ${convertMarkdownToHtml(p.content)}
                  </div>
                </div>
              `
              )
              .join("")}

            <div class="footer">
              SIGEP - Sistema Integrado de Gestão de Processos • Documento Oficial de Manual de Utilização
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 400);
              };
            </script>
          </body>
          </html>
        `;
        printWin.document.open();
        printWin.document.write(fullHtml);
        printWin.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      window.print();
    }
  };

  return (
    <div className="space-y-6 text-justify font-sans w-full py-1">
      {/* Estilos CSS para Impressão com Quebra de Página */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-container, .print-container * {
            visibility: visible !important;
          }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
          }
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
            padding-bottom: 2rem !important;
            margin-bottom: 2rem !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 no-print">
        <div className="flex items-center gap-3">
          {/* Visualizador do Logotipo do Sistema no Cabeçalho */}
          <div 
            onClick={() => setIsLogoPanelOpen((prev) => !prev)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-gray-100 shadow-sm p-1.5 flex items-center justify-center shrink-0 cursor-pointer hover:border-red-400 hover:shadow-md transition-all group overflow-hidden"
            title="Clique para gerir ou inserir o Logotipo do Sistema"
          >
            {systemLogo ? (
              <img
                src={systemLogo}
                alt="Logotipo Oficial do Sistema"
                className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-105 transition-transform mx-auto my-auto block"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center mx-auto">
                <SigepLogo size="xs" showText={false} animated={true} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight text-left flex items-center gap-2">
                <BookOpen className="text-red-600 shrink-0 hidden sm:inline" size={26} />
                <span>SIGEP – Manual do Sistema</span>
              </h1>
              {systemLogo ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={10} /> Logo Personalizado
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck size={10} /> Logo Oficial Padrão
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium text-left mt-0.5">
              Documentação Institucional separada em {totalPages} páginas interativas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          {/* Botão de Inserção / Gestão do Logotipo do Sistema */}
          <button
            type="button"
            onClick={() => setIsLogoPanelOpen((prev) => !prev)}
            className={cn(
              "px-3.5 py-2 font-bold rounded-xl text-xs transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm",
              isLogoPanelOpen
                ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-100"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
            )}
            title="Inserir, alterar ou gerir o Logotipo Oficial do Sistema"
          >
            <ImageIcon size={15} className={systemLogo ? "text-emerald-600" : "text-red-600"} />
            <span>Inserir Logotipo</span>
            {systemLogo && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            )}
            {isLogoPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setShowAllPages(!showAllPages)}
            className={cn(
              "px-3.5 py-2 font-bold rounded-xl text-xs transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm",
              showAllPages
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            )}
            title="Alternar entre navegação por páginas ou visualização contínua"
          >
            <Layers size={15} />
            <span>{showAllPages ? "Ver por Páginas" : "Ver Todas as Páginas"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer hover:scale-105"
            title="Abrir o Manual completo em formato PDF e acionar a impressão"
          >
            <Printer size={16} />
            <span>Abrir & Imprimir PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const event = new CustomEvent("navigate_to_item", { detail: "Template de Resumo" });
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer hover:scale-105"
            title="Ver o Template de Resumo do SIGEP"
          >
            <Layers size={16} />
            <span>Template de Resumo</span>
          </button>
        </div>
      </div>

      {/* Feedback de Status Global */}
      {statusMessage && (
        <div
          className={cn(
            "no-print p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-sm transition-all",
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          )}
        >
          {statusMessage.type === "success" ? (
            <Check size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid Principal:
          - Coluna 1 (Esquerda): Destaques & Módulos (Índice em 4 Cartões Arredondados)
          - Coluna 2 (Centro): Leitor / Manual do Sistema (Larga)
          - Coluna 3 (Direita): Logótipo do SIGEP e Ficha do Proprietário
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* COLUNA 1 (ESQUERDA): ÍNDICE DE MÓDULOS                   */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-3.5 no-print">
          <div className="flex items-center justify-between px-2 text-xs text-gray-500 font-medium">
            <span className="text-gray-900 font-black flex items-center gap-1.5">
              <Layers size={14} className="text-red-600" />
              <span>Índice de Módulos</span>
            </span>
            <span className="text-[11px] text-gray-400 font-bold">4 Capítulos</span>
          </div>

          {/* Lista Vertical de 4 Cartões Arredondados como Índice */}
          <div className="flex flex-col gap-3.5">
            {[
              {
                id: 1,
                num: "01",
                title: "Enquadramento",
                sub: "Visão Geral & Objetivos",
                desc: "Modernização digital, integração e objetivos fundamentais do SIGEP.",
                icon: Sparkles,
                badge: "Geral",
              },
              {
                id: 2,
                num: "02",
                title: "Áreas Funcionais",
                sub: "12 Módulos Integrados",
                desc: "Gestão de Processos, RH, Finanças, Logística e Património.",
                icon: Layers,
                badge: "Módulos",
              },
              {
                id: 3,
                num: "03",
                title: "Arquitetura & Nuvem",
                sub: "Segurança & Perfis",
                desc: "Governação de dados, controlo de acessos e auditoria contínua.",
                icon: ShieldCheck,
                badge: "Segurança",
              },
              {
                id: 4,
                num: "04",
                title: "Tramitação & Planos",
                sub: "PESO / PESOE & Fluxos",
                desc: "Tramitação ágil de despachos, planos operacionais e monitoria.",
                icon: FileText,
                badge: "Fluxos",
              },
            ].map((card) => {
              const IconComp = card.icon;
              const isSelected = currentPage === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setCurrentPage(card.id);
                    if (showAllPages) setShowAllPages(false);
                  }}
                  className={cn(
                    "rounded-[26px] p-4 sm:p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden group select-none min-h-[145px]",
                    isSelected
                      ? "bg-gradient-to-br from-red-50 to-white border-2 border-red-500 shadow-md ring-2 ring-red-100"
                      : "bg-white border-2 border-gray-100 hover:border-red-300 hover:shadow-md hover:bg-slate-50/50"
                  )}
                >
                  {/* Top Line: Badge, Number & Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <span
                        className={cn(
                          "w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-colors shrink-0",
                          isSelected
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 group-hover:bg-red-50 group-hover:text-red-600"
                        )}
                      >
                        {card.num}
                      </span>
                      <div
                        className={cn(
                          "w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0",
                          isSelected
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600"
                        )}
                      >
                        <IconComp size={15} />
                      </div>
                    </div>

                    {/* Titles */}
                    <h4 className={cn(
                      "text-xs sm:text-[13px] font-black leading-snug transition-colors",
                      isSelected ? "text-red-700" : "text-gray-900 group-hover:text-red-600"
                    )}>
                      {card.title}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {card.sub}
                    </p>

                    {/* Short Description */}
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <span className={cn(
                      "font-bold uppercase tracking-wider text-[9px]",
                      isSelected ? "text-red-600 font-black" : "text-gray-400"
                    )}>
                      {isSelected ? "Capítulo Ativo" : "Ver Conteúdo"}
                    </span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected ? "bg-red-500 animate-pulse" : "bg-gray-300 group-hover:bg-red-400"
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUNA 2 (CENTRO): MANUAL DO SISTEMA & LEITURA           */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-4">
          {/* Subtitle Indicator */}
          <div className="flex items-center justify-between px-2 text-xs text-gray-500 font-medium no-print">
            <span className="text-red-700 font-black flex items-center gap-1.5 truncate">
              <BookOpen size={14} className="shrink-0" />
              <span className="truncate">{activePageData.title}</span>
            </span>
            <span className="shrink-0 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full text-[11px] text-gray-700">
              Pág. {currentPage} / {totalPages}
            </span>
          </div>

          {/* UI & Print Content Area */}
          <div className="print-container space-y-6">
            {!showAllPages ? (
              /* Single Active Page View */
              <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 min-h-[640px] flex flex-col justify-between transition-all duration-300">
                <div>
                  <div className="mb-5 pb-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-red-600 uppercase tracking-wider block">
                        {activePageData.title}
                      </span>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {activePageData.subtitle}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-bold border border-red-100 no-print shrink-0">
                      Cap. {currentPage}
                    </span>
                  </div>

                  <div className="markdown-body text-justify leading-relaxed text-gray-800 text-xs sm:text-[13px] max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                    <ReactMarkdown
                      components={{
                        h2: ({ node, ...props }) => (
                          <h2
                            {...props}
                            className="text-base sm:text-lg font-black text-red-600 border-l-4 border-red-500 pl-3 py-1 my-3 text-left"
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            {...props}
                            className="text-sm sm:text-base font-bold text-red-600 border-l-4 border-red-300 pl-2.5 py-1 my-2 text-left"
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            {...props}
                            className="my-2.5 text-justify leading-relaxed text-gray-800"
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            {...props}
                            className="text-justify my-1 leading-relaxed text-gray-800"
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            {...props}
                            className="text-justify italic border-l-4 border-red-500 pl-3 py-2 my-3 bg-red-50/60 rounded-r-xl text-gray-800 shadow-xs"
                          />
                        ),
                      }}
                    >
                      {activePageData.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Bottom Pagination Bar */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between no-print gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                    {pages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setCurrentPage(p.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg transition-all cursor-pointer flex items-center justify-center text-[11px]",
                          currentPage === p.id
                            ? "bg-red-600 text-white shadow-xs font-black"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold"
                        )}
                      >
                        {p.id}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* Continuous Scroll view / Multi-page Stacked View */
              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                {pages.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 print-page-break"
                  >
                    <div className="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-red-600 uppercase tracking-wider">
                          {p.title}
                        </span>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {p.subtitle}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-bold border border-red-100">
                        {p.id} / {totalPages}
                      </span>
                    </div>

                    <div className="markdown-body text-justify leading-relaxed text-gray-800 text-xs sm:text-[13px]">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => (
                            <h2
                              {...props}
                              className="text-base sm:text-lg font-black text-red-600 border-l-4 border-red-500 pl-3 py-1 my-3 text-left"
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              {...props}
                              className="text-sm sm:text-base font-bold text-red-600 border-l-4 border-red-300 pl-2.5 py-1 my-2 text-left"
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              {...props}
                              className="my-2 text-justify leading-relaxed text-gray-800"
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              {...props}
                              className="text-justify my-1 leading-relaxed text-gray-800"
                            />
                          ),
                        }}
                      >
                        {p.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUNA 3 (DIREITA): LOGÓTIPO & PROPRIETÁRIO (5px margem) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4 no-print">
          <div className="flex items-center justify-between px-2 text-xs text-gray-500 font-medium">
            <span className="text-gray-900 font-black flex items-center gap-1.5">
              <ImageIcon size={14} className="text-red-600" />
              <span>Identidade & Autor</span>
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">Oficial</span>
          </div>

          {/* Card 1: Logotipo Oficial do Sistema SIGEP */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <ImageIcon size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-900 leading-tight">Logotipo SIGEP</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Identidade Visual</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 shrink-0">
                Oficial
              </span>
            </div>

            {/* Preview do Logotipo */}
            <div className="w-full h-36 rounded-2xl bg-slate-50 border-2 border-dashed border-gray-200 p-3 flex items-center justify-center text-center relative overflow-hidden group">
              {previewLogo ? (
                <div className="w-full h-full flex items-center justify-center text-center">
                  <img
                    src={previewLogo}
                    alt="Novo Logotipo"
                    className="max-h-full max-w-full object-contain mx-auto my-auto block transition-transform group-hover:scale-105 rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : systemLogo ? (
                <div className="w-full h-full flex items-center justify-center text-center">
                  <img
                    src={systemLogo}
                    alt="Logotipo Oficial SIGEP"
                    className="max-h-full max-w-full object-contain mx-auto my-auto block transition-transform group-hover:scale-105 rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center mx-auto">
                  <div className="flex items-center justify-center mx-auto">
                    <SigepLogo size="sm" showText={false} animated={true} />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 mt-1.5 text-center block">Logotipo Padrão SIGEP</span>
                </div>
              )}

              {previewLogo && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8.5px] font-black bg-amber-500 text-white shadow-xs">
                  Pendente
                </div>
              )}
            </div>

            {/* Botões de Ação do Logotipo */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLogoInputMode("upload")}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                    logoInputMode === "upload"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Upload size={11} />
                  <span>Ficheiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode("url")}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                    logoInputMode === "url"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <LinkIcon size={11} />
                  <span>Link / URL</span>
                </button>
              </div>

              {logoInputMode === "upload" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleFileSelect(file);
                      if (e.target) e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="w-full py-2 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-gray-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    {isProcessingImage ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} className="text-red-600" />
                    )}
                    <span>{isProcessingImage ? "A processar..." : "Carregar Imagem"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="https://.../logo.png"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-[11px] font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-2.5 py-1.5 bg-gray-900 hover:bg-black text-white text-[11px] font-bold rounded-xl cursor-pointer shrink-0"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {previewLogo && (
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveLogo}
                    disabled={isSavingLogo}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSavingLogo ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                    <span>Guardar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewLogo(null);
                      setUrlInput("");
                    }}
                    className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {systemLogo && !previewLogo && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  disabled={isSavingLogo}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Restaurar Padrão</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Proprietário e Ficha Técnica de Arquitetura do Sistema */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-slate-800 space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-xs font-black text-[11px] shrink-0">
                  ST
                </div>
                <div>
                  <h3 className="text-xs font-black text-white leading-tight">Proprietário</h3>
                  <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Arquiteto de Software</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                Autor
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Desenvolvedor Principal</p>
                <p className="text-xs font-black text-white">Slaiter Tripas</p>
                <p className="text-[10px] text-amber-300/90 font-mono">slaitertripas@gmail.com</p>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[10px] leading-relaxed">
                <p>
                  O <strong>SIGEP</strong> é um software de gestão pública e institucional, concebido para a modernização dos processos, planos operacionais e governança de dados.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Direitos © SIGEP</span>
                  <span className="text-emerald-400 font-bold">Moçambique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500 no-print">
        <span>SIGEP – Documentação Oficial do Sistema Integrado de Gestão de Processos</span>
        <button
          type="button"
          onClick={handlePrint}
          className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer mt-2 sm:mt-0 hover:underline"
        >
          <FileText size={14} />
          <span>Abrir & Imprimir Documento PDF</span>
        </button>
      </div>
    </div>
  );
}
