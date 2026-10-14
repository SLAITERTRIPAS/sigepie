import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FileText, Printer, Save, CheckCircle, Calendar, User, Building, MapPin } from "lucide-react";

interface VacationRequestFormProps {
  currentUser?: any;
}

export const VacationRequestForm: React.FC<VacationRequestFormProps> = ({ currentUser }) => {
  // Preenchimento automático com dados do utilizador logado ou predefinições institucionais de Moçambique
  const [institutionName, setInstitutionName] = useState(
    currentUser?.instituicao || currentUser?.institutionName || "República de Moçambique - Ministério / Instituição Pública"
  );
  const [provinceName, setProvinceName] = useState(
    currentUser?.provincia || currentUser?.province || "Cidade de Maputo"
  );
  const [institutionLogo, setInstitutionLogo] = useState(
    currentUser?.logoUrl || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=120&auto=format&fit=crop&q=80"
  );

  const [destinatarioCargo, setDestinatarioCargo] = useState("Exmo. Senhor Diretor Nacional / Chefe de Instituição");
  const [requerenteNome, setRequerenteNome] = useState(currentUser?.nome || currentUser?.name || "");
  const [afectacao, setAfectacao] = useState(currentUser?.departamento || currentUser?.setor || "Direção de Planificação e Financiamento");
  const [carreiraCategoria, setCarreiraCategoria] = useState(currentUser?.carreira || currentUser?.cargo || "Técnico Superior de Nível 1");
  const [localColocacao, setLocalColocacao] = useState(currentUser?.localColocacao || provinceName);
  
  const [anoFerias, setAnoFerias] = useState(new Date().getFullYear().toString());
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [totalDias, setTotalDias] = useState("30");
  
  const [substitutoNome, setSubstitutoNome] = useState("");
  const [substitutoAfectacao, setSubstitutoAfectacao] = useState("");
  const [localAssinatura, setLocalAssinatura] = useState(provinceName);
  const [dataAssinatura, setDataAssinatura] = useState(new Date().toISOString().split("T")[0]);

  // Informação dos Recursos Humanos
  const [diasGozadosAnterior, setDiasGozadosAnterior] = useState("30");
  const [faltasJustificadas, setFaltasJustificadas] = useState("0");
  const [licencaDoenca, setLicencaDoenca] = useState("0");
  const [faltasInjustificadas, setFaltasInjustificadas] = useState("0");
  const [outrasSituacoes, setOutrasSituacoes] = useState("Nenhuma");
  const [direitoDias, setDireitoDias] = useState("30");
  const [saldoAnterior, setSaldoAnterior] = useState("0");
  const [saldoAposGozo, setSaldoAposGozo] = useState("0");
  const [rhData, setRhData] = useState(new Date().toISOString().split("T")[0]);
  const [rhResponsavel, setRhResponsavel] = useState("Chefe dos Recursos Humanos");

  // Informação da Chefia / Superior Hierárquico
  const [parecerChefia, setParecerChefia] = useState<"favoravel" | "desfavoravel">("favoravel");
  const [observacoesChefia, setObservacoesChefia] = useState("Plano de férias conforme escala aprovada para o ano em curso.");
  const [chefiaNomeCargo, setChefiaNomeCargo] = useState("Chefe do Departamento / Superior Hierárquico");
  const [chefiaData, setChefiaData] = useState(new Date().toISOString().split("T")[0]);

  // Despacho da Entidade Competente
  const [despachoTipo, setDespachoTipo] = useState<"autorizado" | "nao_autorizado" | "parcial">("autorizado");
  const [despachoInicio, setDespachoInicio] = useState("");
  const [despachoFim, setDespachoFim] = useState("");
  const [despachoTotalDias, setDespachoTotalDias] = useState("30");
  const [fundamentacao, setFundamentacao] = useState("Aprovado nos termos regulamentares em vigor.");
  const [autoridadeNomeCargo, setAutoridadeNomeCargo] = useState("A Entidade Competente");
  const [autoridadeData, setAutoridadeData] = useState(new Date().toISOString().split("T")[0]);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    try {
      const payload = {
        institutionName,
        provinceName,
        destinatarioCargo,
        requerenteNome,
        afectacao,
        carreiraCategoria,
        localColocacao,
        anoFerias,
        dataInicio,
        dataFim,
        totalDias,
        substitutoNome,
        substitutoAfectacao,
        localAssinatura,
        dataAssinatura,
        rh: {
          diasGozadosAnterior,
          faltasJustificadas,
          licencaDoenca,
          faltasInjustificadas,
          outrasSituacoes,
          direitoDias,
          saldoAnterior,
          saldoAposGozo,
          rhData,
          rhResponsavel
        },
        chefia: {
          parecerChefia,
          observacoesChefia,
          chefiaNomeCargo,
          chefiaData
        },
        despacho: {
          despachoTipo,
          despachoInicio,
          despachoFim,
          despachoTotalDias,
          fundamentacao,
          autoridadeNomeCargo,
          autoridadeData
        },
        createdAt: serverTimestamp(),
        userId: currentUser?.uid || "anonymous",
        status: "Submetido"
      };

      await addDoc(collection(db, "vacation_requests"), payload);
      setSuccessMessage("Requerimento de férias submetido e guardado com sucesso no sistema SIGEP!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Erro ao submeter requerimento de férias:", err);
      alert("Erro ao gravar requerimento na base de dados.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white text-slate-900 shadow-2xl rounded-3xl my-8 font-sans print:shadow-none print:m-0 print:p-0">
      {/* Cabeçalho Institucional Automático */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-slate-900 pb-6 mb-8 gap-4 print:border-black">
        <div className="flex items-center gap-4">
          <img
            src={institutionLogo}
            alt="Logótipo da Instituição"
            className="w-20 h-20 object-contain rounded-xl border border-slate-200 p-1 bg-slate-50"
          />
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-600" /> {provinceName}
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 uppercase">
              {institutionName}
            </h2>
            <p className="text-xs text-slate-600">Sistema Integrado de Gestão de Pessoal (SIGEP)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-500 rounded-xl text-emerald-800 text-sm flex items-center gap-2 print:hidden">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitRequest} className="space-y-8">
        {/* Título do Requerimento */}
        <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-slate-900">
            Requerimento para Pedido de Férias Anuais
          </h1>
          <p className="text-xs text-slate-500 mt-1">Modelo oficial adaptado para funcionários e agentes do Estado em Moçambique</p>
        </div>

        {/* Destinatário */}
        <div className="space-y-3 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase">Exmo. (a) Senhor (a)</label>
          <input
            type="text"
            value={destinatarioCargo}
            onChange={(e) => setDestinatarioCargo(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="Nome ou cargo do responsável máximo da instituição"
          />
        </div>

        {/* Corpo do Requerimento */}
        <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200 space-y-4 text-sm leading-relaxed text-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span>Eu,</span>
            <input
              type="text"
              value={requerenteNome}
              onChange={(e) => setRequerenteNome(e.target.value)}
              className="flex-1 min-w-[240px] bg-white border-b-2 border-blue-600 px-2 py-1 font-bold text-slate-900 outline-none"
              placeholder="Nome completo do funcionário"
              required
            />
            <span>, funcionário(a) afecto(a) a</span>
            <input
              type="text"
              value={afectacao}
              onChange={(e) => setAfectacao(e.target.value)}
              className="flex-1 min-w-[200px] bg-white border-b-2 border-blue-600 px-2 py-1 font-semibold text-slate-900 outline-none"
              placeholder="Departamento / Setor / Direção"
              required
            />
            <span>, enquadrado(a) na carreira/categoria de</span>
            <input
              type="text"
              value={carreiraCategoria}
              onChange={(e) => setCarreiraCategoria(e.target.value)}
              className="flex-1 min-w-[180px] bg-white border-b-2 border-blue-600 px-2 py-1 font-semibold text-slate-900 outline-none"
              placeholder="Carreira e Categoria"
              required
            />
            <span>, colocado(a) em</span>
            <input
              type="text"
              value={localColocacao}
              onChange={(e) => setLocalColocacao(e.target.value)}
              className="w-48 bg-white border-b-2 border-blue-600 px-2 py-1 font-semibold text-slate-900 outline-none"
              placeholder="Local de colocação"
              required
            />
            <span>, venho, mui respeitosamente, requerer a V. Ex.ª se digne autorizar a concessão das minhas férias anuais, referentes ao ano de</span>
            <input
              type="text"
              value={anoFerias}
              onChange={(e) => setAnoFerias(e.target.value)}
              className="w-20 bg-white border-b-2 border-blue-600 px-2 py-1 font-bold text-center text-slate-900 outline-none"
              placeholder="Ano"
              required
            />
            <span>, pelo período de</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-white border-b-2 border-blue-600 px-2 py-1 text-slate-900 outline-none font-semibold"
              required
            />
            <span>a</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-white border-b-2 border-blue-600 px-2 py-1 text-slate-900 outline-none font-semibold"
              required
            />
            <span>, num total de</span>
            <input
              type="text"
              value={totalDias}
              onChange={(e) => setTotalDias(e.target.value)}
              className="w-16 bg-white border-b-2 border-blue-600 px-2 py-1 font-bold text-center text-slate-900 outline-none"
              placeholder="Dias"
              required
            />
            <span>dias, nos termos da legislação aplicável aos funcionários e agentes do Estado e dos procedimentos internos da instituição.</span>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-2">
            <span>Durante a minha ausência, proponho que as actividades sob minha responsabilidade sejam asseguradas/coordenadas por</span>
            <input
              type="text"
              value={substitutoNome}
              onChange={(e) => setSubstitutoNome(e.target.value)}
              className="flex-1 min-w-[240px] bg-white border-b-2 border-blue-600 px-2 py-1 font-semibold text-slate-900 outline-none"
              placeholder="Nome do substituto"
            />
            <span>, afecto(a) a</span>
            <input
              type="text"
              value={substitutoAfectacao}
              onChange={(e) => setSubstitutoAfectacao(e.target.value)}
              className="flex-1 min-w-[200px] bg-white border-b-2 border-blue-600 px-2 py-1 font-semibold text-slate-900 outline-none"
              placeholder="Departamento do substituto"
            />
            <span>, se aplicável.</span>
          </div>

          <div className="pt-4 font-semibold">
            Pede deferimento.
          </div>

          <div className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={localAssinatura}
                onChange={(e) => setLocalAssinatura(e.target.value)}
                className="w-36 bg-white border-b border-slate-400 px-1 py-0.5"
                placeholder="Local"
              />
              <span>,</span>
              <input
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
                className="bg-white border-b border-slate-400 px-1 py-0.5"
              />
            </div>
            <div className="flex-1 md:text-right">
              <span className="block text-slate-500 mb-1">Assinatura do(a) funcionário(a):</span>
              <div className="inline-block border-b border-slate-900 w-64 pb-1 text-blue-900 font-mono italic">
                {requerenteNome || "(Assinatura digital / manuscrita)"}
              </div>
            </div>
          </div>
        </div>

        {/* Informação dos Recursos Humanos */}
        <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50/80 space-y-4">
          <h3 className="text-sm font-black uppercase text-blue-900 border-b border-blue-200 pb-2">
            Informação dos Recursos Humanos
          </h3>
          <p className="text-xs text-slate-600">
            No ano anterior, o(a) requerente gozou
            <input
              type="text"
              value={diasGozadosAnterior}
              onChange={(e) => setDiasGozadosAnterior(e.target.value)}
              className="w-14 mx-1 bg-white border border-slate-300 rounded px-1 text-center font-bold"
            />
            dias de férias/licença anual e registou as seguintes ausências, conforme o processo individual e os registos oficiais:
          </p>

          <table className="w-full text-xs text-left border-collapse border border-slate-300 bg-white">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-300 p-2">Tipo de ausência</th>
                <th className="border border-slate-300 p-2 w-36 text-center">Número de dias</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2">Faltas justificadas — conforme registo aplicável</td>
                <td className="border border-slate-300 p-2 text-center">
                  <input
                    type="text"
                    value={faltasJustificadas}
                    onChange={(e) => setFaltasJustificadas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-1 text-center"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Licença por doença</td>
                <td className="border border-slate-300 p-2 text-center">
                  <input
                    type="text"
                    value={licencaDoenca}
                    onChange={(e) => setLicencaDoenca(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-1 text-center"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Faltas injustificadas</td>
                <td className="border border-slate-300 p-2 text-center">
                  <input
                    type="text"
                    value={faltasInjustificadas}
                    onChange={(e) => setFaltasInjustificadas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-1 text-center"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Outras situações relevantes (especificar)</td>
                <td className="border border-slate-300 p-2 text-center">
                  <input
                    type="text"
                    value={outrasSituacoes}
                    onChange={(e) => setOutrasSituacoes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-1 text-center"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium pt-2">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="block text-slate-500">Direito a férias:</span>
              <input
                type="text"
                value={direitoDias}
                onChange={(e) => setDireitoDias(e.target.value)}
                className="w-full font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded p-1 mt-1 text-center"
              />
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="block text-slate-500">Saldo anterior:</span>
              <input
                type="text"
                value={saldoAnterior}
                onChange={(e) => setSaldoAnterior(e.target.value)}
                className="w-full font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded p-1 mt-1 text-center"
              />
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="block text-slate-500">Dias solicitados:</span>
              <input
                type="text"
                value={totalDias}
                readOnly
                className="w-full font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded p-1 mt-1 text-center"
              />
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="block text-slate-500">Saldo após gozo:</span>
              <input
                type="text"
                value={saldoAposGozo}
                onChange={(e) => setSaldoAposGozo(e.target.value)}
                className="w-full font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded p-1 mt-1 text-center"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 text-xs">
            <div className="flex items-center gap-2">
              <span>Data:</span>
              <input
                type="date"
                value={rhData}
                onChange={(e) => setRhData(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex-1 md:text-right">
              <span className="block text-slate-500 mb-1">Nome e assinatura do responsável dos RH:</span>
              <input
                type="text"
                value={rhResponsavel}
                onChange={(e) => setRhResponsavel(e.target.value)}
                className="w-full md:w-80 bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-right"
              />
            </div>
          </div>
        </div>

        {/* Informação da Chefia / Superior Hierárquico */}
        <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50/80 space-y-4">
          <h3 className="text-sm font-black uppercase text-blue-900 border-b border-blue-200 pb-2">
            Informação da Chefia / Superior Hierárquico
          </h3>
          <div className="flex items-center gap-6 text-xs font-bold">
            <span>Parecer:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parecer"
                checked={parecerChefia === "favoravel"}
                onChange={() => setParecerChefia("favoravel")}
                className="text-blue-600"
              />
              Favorável
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parecer"
                checked={parecerChefia === "desfavoravel"}
                onChange={() => setParecerChefia("desfavoravel")}
                className="text-blue-600"
              />
              Desfavorável
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observações:</label>
            <textarea
              rows={2}
              value={observacoesChefia}
              onChange={(e) => setObservacoesChefia(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span>Data:</span>
              <input
                type="date"
                value={chefiaData}
                onChange={(e) => setChefiaData(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex-1 md:text-right">
              <span className="block text-slate-500 mb-1">Nome/Cargo e Assinatura:</span>
              <input
                type="text"
                value={chefiaNomeCargo}
                onChange={(e) => setChefiaNomeCargo(e.target.value)}
                className="w-full md:w-80 bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-right"
              />
            </div>
          </div>
        </div>

        {/* Despacho da Entidade Competente */}
        <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50/80 space-y-4">
          <h3 className="text-sm font-black uppercase text-blue-900 border-b border-blue-200 pb-2">
            Despacho da Entidade Competente
          </h3>
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="despacho"
                checked={despachoTipo === "autorizado"}
                onChange={() => setDespachoTipo("autorizado")}
                className="text-blue-600"
              />
              Autorizado
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="despacho"
                checked={despachoTipo === "nao_autorizado"}
                onChange={() => setDespachoTipo("nao_autorizado")}
                className="text-blue-600"
              />
              Não autorizado
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="despacho"
                checked={despachoTipo === "parcial"}
                onChange={() => setDespachoTipo("parcial")}
                className="text-blue-600"
              />
              Autorizado parcialmente
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-500 mb-1">Período autorizado - Início:</label>
              <input
                type="date"
                value={despachoInicio}
                onChange={(e) => setDespachoInicio(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Período autorizado - Fim:</label>
              <input
                type="date"
                value={despachoFim}
                onChange={(e) => setDespachoFim(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Total de dias autorizados:</label>
              <input
                type="text"
                value={despachoTotalDias}
                onChange={(e) => setDespachoTotalDias(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fundamentação / Observações:</label>
            <textarea
              rows={2}
              value={fundamentacao}
              onChange={(e) => setFundamentacao(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span>Data:</span>
              <input
                type="date"
                value={autoridadeData}
                onChange={(e) => setAutoridadeData(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex-1 md:text-right">
              <span className="block text-slate-500 mb-1">Nome e cargo / Assinatura e carimbo:</span>
              <input
                type="text"
                value={autoridadeNomeCargo}
                onChange={(e) => setAutoridadeNomeCargo(e.target.value)}
                className="w-full md:w-80 bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-right"
              />
            </div>
          </div>
        </div>

        {/* Nota Rodapé Oficial */}
        <div className="text-[11px] text-slate-500 italic bg-slate-100 p-4 rounded-xl border border-slate-200">
          <strong>Nota:</strong> Modelo adaptado ao formato tradicional de requerimento de férias anuais utilizado em instituições públicas moçambicanas. Confirmar com os Recursos Humanos a legislação em vigor e o formulário oficial aplicável à instituição antes de usar.
        </div>

        {/* Rodapé Institucional com Logótipo */}
        <div className="mt-8 pt-6 border-t-2 border-slate-300 flex justify-between items-center text-xs text-slate-700">
          <div>
            <p className="font-bold uppercase">{institutionName}</p>
            <p className="text-[10px] text-slate-500">{provinceName} — Sistema Integrado de Gestão de Pessoal (SIGEP)</p>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={institutionLogo}
              alt="Logótipo Institucional no Rodapé"
              className="w-10 h-10 object-contain rounded border border-slate-200 p-0.5 bg-white"
            />
          </div>
        </div>

        {/* Botão de Submissão */}
        <div className="flex justify-end pt-4 print:hidden">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {submitting ? "A guardar requerimento..." : "Submeter e Guardar Requerimento de Férias"}
          </button>
        </div>
      </form>
    </div>
  );
};
