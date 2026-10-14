import React, { useState } from "react";
import { 
  Printer, ArrowLeft, Image as ImageIcon, Mail, Globe, MapPin, Phone, Upload, X
} from "lucide-react";
import { motion } from "motion/react";
import { printElementById } from "../../lib/printUtils";
import { getSystemLogo } from "../../lib/logoService";

const ResumoTemplateView = ({ onBack }: { onBack: () => void }) => {
  const [logoIsps, setLogoIsps] = useState<string | null>(null);
  const [logoSigep, setLogoSigep] = useState<string | null>(getSystemLogo() || "/sigep-logo.svg");
  const [partnerLogos, setPartnerLogos] = useState<(string | null)[]>([null, null, null]);

  const handlePrint = () => {
    printElementById("poster-template-print-area", "SIGEP - Poster Jornadas Cientificas", "portrait", "A4");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartnerUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...partnerLogos];
        updated[index] = reader.result as string;
        setPartnerLogos(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between print:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Sistema
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-[#050b38] text-white rounded-xl font-black hover:bg-[#0d1b54] transition-all shadow-xl shadow-blue-900/20 text-xs uppercase tracking-widest cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Exportar Póster (A4/PDF)
          </button>
        </div>

        {/* Poster Container */}
        <div 
          id="poster-template-print-area" 
          className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] mx-auto border border-slate-200 print:border-0 print:shadow-none overflow-hidden relative"
          style={{ width: "100%", maxWidth: "900px", minHeight: "1200px" }}
        >
          {/* Top Institutional Color Accents */}
          <div className="flex w-full h-3">
            <div className="flex-1 bg-[#050b38]" />
            <div className="flex-1 bg-[#FFB800]" />
            <div className="flex-1 bg-[#0d1b54]" />
            <div className="flex-1 bg-red-600" />
          </div>

          <div className="p-12 space-y-10">
            {/* Header Logos & Event */}
            <header className="flex items-center justify-between gap-8 pb-6 border-b-2 border-slate-100">
              {/* ISPS Logo Upload / Display */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <label className="cursor-pointer block">
                    <div className="w-[72px] h-[72px] bg-[#050b38] rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden border-2 border-dashed border-[#FFB800] shadow-md">
                      {logoIsps ? (
                        <img src={logoIsps} alt="ISPS" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-xl text-[#FFB800]">ISPS</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoIsps)} />
                  </label>
                  {logoIsps && (
                    <button onClick={() => setLogoIsps(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 print:hidden">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="h-12 w-px bg-slate-200" />
                
                <div className="flex flex-col">
                  <span className="text-[28px] font-black tracking-tighter text-[#050b38] flex items-baseline gap-2">
                    7<span className="text-xl uppercase italic text-[#FFB800]">as</span> 
                    <span className="bg-[#050b38] text-white px-2 py-0.5 rounded ml-1">Jornadas</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Científicas Estudantis</span>
                </div>
              </div>

              {/* SIGEP Logo Upload / Display */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <label className="cursor-pointer block">
                    <div className="w-[72px] h-[72px] bg-[#0d1b54] rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden border-2 border-dashed border-[#FFB800] shadow-md">
                      {logoSigep ? (
                        <img src={logoSigep} alt="SIGEP" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-sm text-[#FFB800]">SIGEP</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoSigep)} />
                  </label>
                  {logoSigep && (
                    <button onClick={() => setLogoSigep(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 print:hidden">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* Eixo Temático */}
            <div className="text-center">
              <span className="text-sm font-black text-[#050b38] uppercase tracking-widest border-x-4 border-[#FFB800] px-6 py-1 bg-slate-50 rounded">
                Eixo temático: Governação Digital e Sistemas de Informação
              </span>
            </div>

            {/* Title Section */}
            <div className="text-center space-y-4 max-w-4xl mx-auto">
              <h1 className="text-3xl font-black text-[#050b38] leading-[1.15] uppercase tracking-tighter">
                O IMPACTO DO SIGEP NA MODERNIZAÇÃO DA GESTÃO ACADÉMICA, ADMINISTRATIVA E ORÇAMENTAL EM MOÇAMBIQUE
              </h1>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">Franzissi Tripalonga Vicente (FTV / Slaiter Tripas)¹</p>
                <div className="flex flex-col text-[10px] font-semibold text-slate-500 uppercase tracking-wider gap-0.5">
                  <span>¹Autor, Engenheiro de Software & Proprietário do SIGEP | E-mail: slaitertripas@gmail.com</span>
                  <span>²SIGEP - Sistema Integrado de Gestão de Processos e Projeção Académica (V1.1.2.0 Quântica)</span>
                </div>
              </div>

              {/* Resumo & Abstract Box */}
              <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] leading-snug">
                <div className="space-y-1 border-r border-slate-200 pr-3">
                  <span className="font-black text-[#050b38] uppercase tracking-wider text-[10px] block">Resumo Executivo</span>
                  <p className="text-slate-700 text-justify">
                    Este estudo avalia a eficácia do SIGEP na transformação digital da administração pública e do ensino superior em Moçambique. A solução integra a automação de expedientes, gestão de vistos digitais, controlo patrimonial e cabimento orçamental em estrita conformidade com as diretrizes do SISTAFE e PESOE.
                  </p>
                  <span className="text-[9px] font-bold text-[#050b38] block mt-1">
                    <strong>Palavras-Chave:</strong> Governação Eletrónica, SIGEP, SISTAFE, Gestão Académica, Inovação Pública.
                  </span>
                </div>
                <div className="space-y-1 pl-1">
                  <span className="font-black text-[#050b38] uppercase tracking-wider text-[10px] block">Abstract</span>
                  <p className="text-slate-600 text-justify italic">
                    This paper evaluates the impact of SIGEP on the digital transformation of public administration and higher education in Mozambique. The platform unifies workflow automation, digital approvals, asset tracking, and budget execution under strict compliance with SISTAFE and PESOE frameworks.
                  </p>
                  <span className="text-[9px] font-bold text-[#050b38] block mt-1">
                    <strong>Keywords:</strong> E-Governance, SIGEP, SISTAFE, Academic Management, Public Innovation.
                  </span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Column Left (6/12) */}
              <div className="col-span-6 space-y-8 text-justify">
                {/* INTRODUÇÃO */}
                <section className="space-y-2.5">
                  <h2 className="text-lg font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-1">
                    1. INTRODUÇÃO & CONTEXTUALIZAÇÃO
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    As Instituições de Ensino Superior (IES) em Moçambique enfrentam desafios complexos ligados à morosidade na tramitação física de expedientes, riscos de extravio documental e morosidade no controlo de cabimento orçamental segundo as normas do SISTAFE. O <strong>SIGEP (Sistema Integrado de Gestão de Processos)</strong> foi concebido para erradicar tais fragilidades institucionais.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    O objetivo deste trabalho é demonstrar como a integração holística entre a gestão de recursos humanos, património, contratação pública (UGEA) e pareceres de chefia em tempo real estabelece um novo paradigma de integridade, transparência e celeridade governamental.
                  </p>
                </section>

                {/* MATERIAIS E MÉTODOS */}
                <section className="space-y-3">
                  <h2 className="text-lg font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-1">
                    2. MATERIAIS E MÉTODOS
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    A pesquisa adotou uma abordagem metodológica mista, combinando engenharia de software reativa com modelação empírica de processos operacionais em 16 unidades orgânicas e direções setoriais do ecossistema público moçambicano.
                  </p>
                  <ul className="text-[11px] leading-relaxed text-slate-700 list-disc list-inside space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                    <li><strong>Arquitetura Técnica:</strong> Single Page Application (SPA) reativa desenvolvida com React 18, TypeScript, Tailwind CSS e motor Cloud Firestore em tempo real.</li>
                    <li><strong>Motor de Regras de Negócio:</strong> Mapeamento de grafos de decisão para validação automática de vistos digitais, quotas orçamentais por rubrica e regras do SISTAFE.</li>
                    <li><strong>Resiliência e Segurança:</strong> Modelo Offline-First com sincronização em nuvem e mecanismos de salvaguarda de dados sem perdas.</li>
                  </ul>

                  {/* Figura Gráfica Enriquecida */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-2 mt-2">
                    <div className="w-full h-44 bg-white border border-slate-200 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden shadow-inner">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 border-b border-slate-100 pb-1">
                        <span>Volume de Carga Processual (Casos/Mês)</span>
                        <span className="text-emerald-600 font-extrabold">Total: 1.480 Processos</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 w-full h-28 items-end pt-2">
                        <div className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[8px] font-black text-slate-600">380</span>
                          <div className="bg-[#050b38] h-[80%] w-full rounded-t-md shadow-sm" />
                          <span className="text-[7px] font-bold text-slate-500 uppercase">UGEA</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[8px] font-black text-slate-600">420</span>
                          <div className="bg-[#FFB800] h-[95%] w-full rounded-t-md shadow-sm" />
                          <span className="text-[7px] font-bold text-slate-500 uppercase">RH/Efetivo</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[8px] font-black text-slate-600">290</span>
                          <div className="bg-[#0d1b54] h-[65%] w-full rounded-t-md shadow-sm" />
                          <span className="text-[7px] font-bold text-slate-500 uppercase">Financeiro</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[8px] font-black text-slate-600">240</span>
                          <div className="bg-blue-600 h-[55%] w-full rounded-t-md shadow-sm" />
                          <span className="text-[7px] font-bold text-slate-500 uppercase">Académico</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[8px] font-black text-slate-600">150</span>
                          <div className="bg-emerald-600 h-[35%] w-full rounded-t-md shadow-sm" />
                          <span className="text-[7px] font-bold text-slate-500 uppercase">Património</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 italic text-center">
                      Figura 1 - Distribuição e resolução automatizada de cargas processuais por setor estratégico
                    </span>
                  </div>
                </section>
              </div>

              {/* Column Right (6/12) */}
              <div className="col-span-6 space-y-8 text-justify">
                {/* RESULTADOS E DISCUSSÃO */}
                <section className="space-y-3">
                  <h2 className="text-lg font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-1">
                    3. RESULTADOS E DISCUSSÃO
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    A implementação piloto do SIGEP nas unidades orgânicas e direções estratégicas evidenciou ganhos quantitativos e qualitativos sem precedentes, revolucionando a cadência da administração pública e do ensino superior:
                  </p>

                  {/* KPIs de Alto Impacto */}
                  <div className="grid grid-cols-3 gap-2 my-2">
                    <div className="bg-[#050b38] text-white p-2 rounded-lg text-center shadow-sm border-b-2 border-[#FFB800]">
                      <span className="block text-base font-black text-[#FFB800]">99,6%</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold">Redução na Latência</span>
                    </div>
                    <div className="bg-emerald-800 text-white p-2 rounded-lg text-center shadow-sm border-b-2 border-emerald-400">
                      <span className="block text-base font-black text-emerald-300">100%</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold">Conformidade Legal</span>
                    </div>
                    <div className="bg-[#0d1b54] text-white p-2 rounded-lg text-center shadow-sm border-b-2 border-blue-400">
                      <span className="block text-base font-black text-blue-300">0,0%</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold">Erros de Cabimento</span>
                    </div>
                  </div>

                  {/* Tabela Expandida de Indicadores */}
                  <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                    <table className="w-full text-[9.5px]">
                      <thead className="bg-[#050b38] text-white font-bold uppercase">
                        <tr>
                          <th className="px-2 py-1.5 text-left border-r border-[#0d1b54]">Indicador de Desempenho</th>
                          <th className="px-1.5 py-1.5 text-center border-r border-[#0d1b54]">Manual (Antes)</th>
                          <th className="px-1.5 py-1.5 text-center text-[#FFB800]">SIGEP (Atual)</th>
                          <th className="px-1.5 py-1.5 text-center text-emerald-400">Ganho</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr>
                          <td className="px-2 py-1 font-bold border-r border-slate-100">Tempo de Tramitação Física</td>
                          <td className="px-1.5 py-1 text-center text-red-600 font-semibold">14,2 dias</td>
                          <td className="px-1.5 py-1 text-center text-emerald-600 font-black">0,05 dias (3 min)</td>
                          <td className="px-1.5 py-1 text-center text-emerald-700 font-bold">+99,6%</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 font-bold border-r border-slate-100">Erros de Cabimento Orçamental</td>
                          <td className="px-1.5 py-1 text-center text-red-600 font-semibold">12,4%</td>
                          <td className="px-1.5 py-1 text-center text-emerald-600 font-black">0,0%</td>
                          <td className="px-1.5 py-1 text-center text-emerald-700 font-bold">100% Blindado</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 font-bold border-r border-slate-100">Rastreabilidade de Expedientes</td>
                          <td className="px-1.5 py-1 text-center text-red-600 font-semibold">35,0%</td>
                          <td className="px-1.5 py-1 text-center text-emerald-600 font-black">100,0%</td>
                          <td className="px-1.5 py-1 text-center text-emerald-700 font-bold">+185%</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 font-bold border-r border-slate-100">Autenticação de Visto Digital</td>
                          <td className="px-1.5 py-1 text-center text-red-600 font-semibold">Manual / Riscos</td>
                          <td className="px-1.5 py-1 text-center text-emerald-600 font-black">100% Criptográfico</td>
                          <td className="px-1.5 py-1 text-center text-emerald-700 font-bold">Inviolável</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 font-bold border-r border-slate-100">Consumo de Papel (Folhas/Proc.)</td>
                          <td className="px-1.5 py-1 text-center text-red-600 font-semibold">18,5 folhas</td>
                          <td className="px-1.5 py-1 text-center text-emerald-600 font-black">0,0 folhas</td>
                          <td className="px-1.5 py-1 text-center text-emerald-700 font-bold">100% Eco</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-1.5 text-[10.5px] leading-relaxed text-slate-700">
                    <p>
                      • <strong>Discussão da Eficiência Orçamental:</strong> A validação algorítmica de cabimento impede a emissão de despesas sem saldo orçamental prévio nas rubricas do PESOE, assegurando plena conformidade com as regras de liquidação e pagamento do SISTAFE.
                    </p>
                    <p>
                      • <strong>Transparência e Rastreabilidade Total:</strong> A eliminação de travamentos físicos permite que qualquer expediente seja localizado em tempo real, fornecendo aos Órgãos de Gestão indicadores em dashboards de alta precisão para a tomada de decisões estratégicas.
                    </p>
                  </div>
                </section>

                {/* CONCLUSÃO */}
                <section className="space-y-2.5">
                  <h2 className="text-lg font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-1">
                    4. CONCLUSÃO & RECOMENDAÇÕES
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    O <strong>SIGEP (Sistema Integrado de Gestão de Processos)</strong> consolida-se como uma solução soberana, sustentável e altamente eficiente de governação digital para Moçambique. Ao demonstrar a eliminação integral de gargalos burocráticos e inconformidades orçamentares, a plataforma redefine o padrão de modernização e integridade administrativa do ensino superior nacional.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10.5px] leading-relaxed text-slate-700 space-y-1.5">
                    <span className="font-black text-[#050b38] uppercase tracking-wider text-[10px] block">Recomendações Estratégicas:</span>
                    <p>
                      • <strong>Expansão Escalonada em IES:</strong> Recomenda-se a sua adoção escalonada nas restantes Instituições de Ensino Superior públicas e privadas do país, promovendo a interoperabilidade sistémica e a transformação digital.
                    </p>
                    <p>
                      • <strong>Padronização do PESOE e SISTAFE:</strong> Unificação dos instrumentos de planificação orçamental e monitoria do PESOE em tempo real, aperfeiçoando a prestação de contas, a transparência radical e a blindagem contra auditorias.
                    </p>
                    <p>
                      • <strong>Sustentabilidade e Governação Sem Papel:</strong> Consolidação do modelo "Zero Papel", reduzindo custos operacionais com economato e impulsionando a maturidade institucional da administração pública moçambicana.
                    </p>
                  </div>
                </section>

                {/* REFERÊNCIAS BIBLIOGRÁFICAS */}
                <section className="space-y-1.5">
                  <h2 className="text-lg font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-1">
                    5. REFERÊNCIAS BIBLIOGRÁFICAS
                  </h2>
                  <div className="text-[9px] font-mono text-slate-600 space-y-1 leading-tight border-l-2 border-[#FFB800] pl-2">
                    <p>[1] REPÚBLICA DE MOÇAMBIQUE. <em>Lei n.º 14/2020 de 23 de Dezembro (SISTAFE)</em>. Maputo, Imprensa Nacional, 2020.</p>
                    <p>[2] MINISTÉRIO DA CIÊNCIA, TECNOLOGIA E ENSINO SUPERIOR. <em>Regulamento das Instituições de Ensino Superior</em>. Maputo, 2024.</p>
                    <p>[3] VICENTE, F. T. (Slaiter Tripas). <em>Documentação de Arquitetura e Engenharia Reativa do SIGEP</em>. Songo, SIGEP-DOC-2026, 2026.</p>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Area */}
            <footer className="pt-8 border-t-2 border-slate-100">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[11px] font-black text-[#050b38] uppercase tracking-widest mb-2">Agradecimentos</h3>
                  <p className="text-[10px] text-slate-600 italic leading-relaxed">
                    Agradecemos à Direção do ISPS e ao Ministério da Ciência e Tecnologia pelo apoio institucional e técnico durante o desenvolvimento deste sistema.
                  </p>
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-[#050b38] uppercase tracking-widest mb-2">Contactos</h3>
                  <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-700 font-bold">
                    <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#050b38]" /> slaitertripas@gmail.com</span>
                    <span className="flex items-center gap-1.5"><Globe size={12} className="text-[#050b38]" /> www.sigep.ac.mz</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#050b38]" /> Songo, Tete, MZ</span>
                    <span className="flex items-center gap-1.5"><Phone size={12} className="text-[#050b38]" /> +258 84 000 0000</span>
                  </div>
                </div>
              </div>

              {/* Partner Logos Upload */}
              <div className="mt-10 flex justify-center items-center gap-16">
                {partnerLogos.map((logo, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 relative group">
                    <label className="cursor-pointer block">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 shadow-sm">
                        {logo ? (
                          <img src={logo} alt={`Parceiro ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePartnerUpload(e, index)} />
                    </label>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Parceiro {index + 1}</span>
                    {logo && (
                      <button onClick={() => {
                        const updated = [...partnerLogos];
                        updated[index] = null;
                        setPartnerLogos(updated);
                      }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 print:hidden">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoTemplateView;
