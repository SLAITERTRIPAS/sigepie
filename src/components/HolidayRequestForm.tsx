import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FileText, Printer, Save, CheckCircle, Calendar, User, Building, MapPin } from "lucide-react";
import { getActiveInstitutionLogo, getActiveInstitutionName, getActiveProvinceName } from "../lib/documentLogoUtils";

interface HolidayRequestFormProps {
  currentUser?: any;
  activeInst?: any;
}

export const HolidayRequestForm: React.FC<HolidayRequestFormProps> = ({ currentUser, activeInst }) => {
  const [institutionName, setInstitutionName] = useState(
    getActiveInstitutionName(activeInst, currentUser)
  );
  const [provinceName, setProvinceName] = useState(
    getActiveProvinceName(activeInst, currentUser)
  );
  const [institutionLogo, setInstitutionLogo] = useState(
    getActiveInstitutionLogo(activeInst, currentUser)
  );

  const [destinatarioCargo, setDestinatarioCargo] = useState("Exmo. Senhor Diretor / Chefe de Instituição");
  const [requerenteNome, setRequerenteNome] = useState(currentUser?.nome || currentUser?.name || "");
  const [afectacao, setAfectacao] = useState(currentUser?.departamento || currentUser?.setor || "Direção de Planificação e Financiamento");
  const [carreiraCategoria, setCarreiraCategoria] = useState(currentUser?.carreira || currentUser?.cargo || "Técnico Superior de Nível 1");
  const [localColocacao, setLocalColocacao] = useState(provinceName);
  
  useEffect(() => {
    setInstitutionName(getActiveInstitutionName(activeInst, currentUser));
    setProvinceName(getActiveProvinceName(activeInst, currentUser));
    setInstitutionLogo(getActiveInstitutionLogo(activeInst, currentUser));
    if (currentUser?.nome || currentUser?.name) {
      setRequerenteNome(currentUser.nome || currentUser.name);
    }
    if (currentUser?.departamento || currentUser?.setor) {
      setAfectacao(currentUser.departamento || currentUser.setor);
    }
    if (currentUser?.carreira || currentUser?.cargo) {
      setCarreiraCategoria(currentUser.carreira || currentUser.cargo);
    }
    const prov = getActiveProvinceName(activeInst, currentUser);
    setLocalColocacao(prov);
    setLocalAssinatura(prov);
  }, [activeInst, currentUser]);
  
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
        institutionLogo,
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
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Cabeçalho Institucional Automático com Logótipo */}
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

      <form onSubmit={handleSubmitRequest} className="space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-3 inline-block">
            REQUERIMENTO PARA PEDIDO DE FÉRIAS ANUAIS
          </h1>
        </div>

        {/* Destinatário */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Exmo. (a) Senhor (a) (Responsável Máximo):
              </label>
              <input
                type="text"
                value={destinatarioCargo}
                onChange={(e) => setDestinatarioCargo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Ex: Diretor Geral / Reitor / Presidente"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cargo da Entidade Destinatária:
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Corpo do Requerimento */}
        <div className="text-sm leading-relaxed text-slate-800 space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="font-medium">
            Eu, <input
              type="text"
              value={requerenteNome}
              onChange={(e) => setRequerenteNome(e.target.value)}
              placeholder="Nome Completo do Funcionário"
              className="border-b border-slate-400 px-2 py-0.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-64 text-center"
              required
            />, funcionário(a) afeto(a) a <input
              type="text"
              value={afectacao}
              onChange={(e) => setAfectacao(e.target.value)}
              placeholder="Departamento / Setor"
              className="border-b border-slate-400 px-2 py-0.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-56 text-center"
              required
            />, enquadrado(a) na carreira/categoria de <input
              type="text"
              value={carreiraCategoria}
              onChange={(e) => setCarreiraCategoria(e.target.value)}
              placeholder="Carreira e Categoria"
              className="border-b border-slate-400 px-2 py-0.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-56 text-center"
              required
            />, colocado(a) em <input
              type="text"
              value={localColocacao}
              onChange={(e) => setLocalColocacao(e.target.value)}
              placeholder="Local de Colocação"
              className="border-b border-slate-400 px-2 py-0.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-40 text-center"
              required
            />, venho, mui respeitosamente, requerer a V. Ex.ª se digne autorizar a concessão das minhas férias anuais, referentes ao ano de <input
              type="text"
              value={anoFerias}
              onChange={(e) => setAnoFerias(e.target.value)}
              className="border-b border-slate-400 px-1 py-0.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-16 text-center"
            />, pelo período de <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs mx-1 inline-block"
              required
            /> a <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs mx-1 inline-block"
              required
            />, num total de <input
              type="text"
              value={totalDias}
              onChange={(e) => setTotalDias(e.target.value)}
              className="border-b border-slate-400 px-1 py-0.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-12 text-center"
            /> dias, nos termos da legislação aplicável aos funcionários e agentes do Estado e dos procedimentos internos da instituição.
          </p>

          <p className="pt-2">
            Durante a minha ausência, proponho que as atividades sob minha responsabilidade sejam asseguradas/coordenadas por <input
              type="text"
              value={substitutoNome}
              onChange={(e) => setSubstitutoNome(e.target.value)}
              placeholder="Nome do Substituto"
              className="border-b border-slate-400 px-2 py-0.5 font-medium text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-64 text-center"
            />, afeto(a) a <input
              type="text"
              value={substitutoAfectacao}
              onChange={(e) => setSubstitutoAfectacao(e.target.value)}
              placeholder="Setor do Substituto"
              className="border-b border-slate-400 px-2 py-0.5 font-medium text-slate-900 focus:outline-none focus:border-blue-600 inline-block w-48 text-center"
            />, se aplicável.
          </p>

          <p className="pt-2 font-semibold">Pede deferimento.</p>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 text-xs gap-4">
            <div className="flex items-center gap-2">
              <span>Local e Data:</span>
              <input
                type="text"
                value={localAssinatura}
                onChange={(e) => setLocalAssinatura(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1 w-32"
              />,
              <input
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1"
              />
            </div>
            <div className="w-full md:w-72 text-center">
              <div className="border-b border-slate-800 pb-8 mb-1 font-bold">
                {requerenteNome || "Assinatura do(a) Funcionário(a)"}
              </div>
              <span className="text-[10px] text-slate-500 uppercase">Assinatura do(a) Funcionário(a)</span>
            </div>
          </div>
        </div>

        {/* Informação dos Recursos Humanos */}
        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
            <User className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-900 uppercase">INFORMAÇÃO DOS RECURSOS HUMANOS</h3>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            No ano anterior, o(a) requerente gozou <input type="text" value={diasGozadosAnterior} onChange={(e) => setDiasGozadosAnterior(e.target.value)} className="w-12 bg-white border border-amber-300 rounded text-center font-bold px-1 mx-1" /> dias de férias/licença anual e registou as seguintes ausências, conforme o processo individual e os registos oficiais:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-slate-700">Faltas justificadas:</span>
              <input type="text" value={faltasJustificadas} onChange={(e) => setFaltasJustificadas(e.target.value)} className="w-16 bg-slate-50 border border-slate-300 rounded text-center p-1 font-semibold" />
            </div>
            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-slate-700">Licença por doença:</span>
              <input type="text" value={licencaDoenca} onChange={(e) => setLicencaDoenca(e.target.value)} className="w-16 bg-slate-50 border border-slate-300 rounded text-center p-1 font-semibold" />
            </div>
            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-slate-700">Faltas injustificadas:</span>
              <input type="text" value={faltasInjustificadas} onChange={(e) => setFaltasInjustificadas(e.target.value)} className="w-16 bg-slate-50 border border-slate-300 rounded text-center p-1 font-semibold" />
            </div>
            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-slate-700">Outras situações relevantes:</span>
              <input type="text" value={outrasSituacoes} onChange={(e) => setOutrasSituacoes(e.target.value)} className="w-32 bg-slate-50 border border-slate-300 rounded text-center p-1 font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-600 mb-1">Direito (dias):</label>
              <input type="text" value={direitoDias} onChange={(e) => setDireitoDias(e.target.value)} className="w-full bg-white border border-amber-300 rounded p-2 text-center font-bold" />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Saldo Anterior:</label>
              <input type="text" value={saldoAnterior} onChange={(e) => setSaldoAnterior(e.target.value)} className="w-full bg-white border border-amber-300 rounded p-2 text-center font-bold" />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Dias Solicitados:</label>
              <input type="text" value={totalDias} onChange={(e) => setTotalDias(e.target.value)} className="w-full bg-white border border-amber-300 rounded p-2 text-center font-bold text-blue-600" />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Saldo Após o Gozo:</label>
              <input type="text" value={saldoAposGozo} onChange={(e) => setSaldoAposGozo(e.target.value)} className="w-full bg-white border border-amber-300 rounded p-2 text-center font-bold text-emerald-600" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span>Data:</span>
              <input type="date" value={rhData} onChange={(e) => setRhData(e.target.value)} className="bg-white border border-amber-300 rounded px-2 py-1" />
            </div>
            <div className="w-full md:w-80 mt-2 md:mt-0 text-right">
              <span className="block text-slate-600 mb-1">Responsável dos RH:</span>
              <input type="text" value={rhResponsavel} onChange={(e) => setRhResponsavel(e.target.value)} className="w-full bg-white border border-amber-300 rounded px-2 py-1 font-semibold text-right" />
            </div>
          </div>
        </div>

        {/* Informação da Chefia / Superior Hierárquico */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-200 pb-3">
            <Building className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-bold text-blue-900 uppercase">INFORMAÇÃO DA CHEFIA / SUPERIOR HIERÁRQUICO</h3>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parecer"
                checked={parecerChefia === "favoravel"}
                onChange={() => setParecerChefia("favoravel")}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-emerald-700 uppercase">Favorável</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parecer"
                checked={parecerChefia === "desfavoravel"}
                onChange={() => setParecerChefia("desfavoravel")}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-red-700 uppercase">Desfavorável</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observações:</label>
            <textarea
              rows={2}
              value={observacoesChefia}
              onChange={(e) => setObservacoesChefia(e.target.value)}
              className="w-full bg-white border border-blue-300 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span>Data:</span>
              <input type="date" value={chefiaData} onChange={(e) => setChefiaData(e.target.value)} className="bg-white border border-blue-300 rounded px-2 py-1" />
            </div>
            <div className="w-full md:w-80 mt-2 md:mt-0 text-right">
              <span className="block text-slate-600 mb-1">Nome / Cargo da Chefia:</span>
              <input type="text" value={chefiaNomeCargo} onChange={(e) => setChefiaNomeCargo(e.target.value)} className="w-full bg-white border border-blue-300 rounded px-2 py-1 font-semibold text-right" />
            </div>
          </div>
        </div>

        {/* Despacho da Entidade Competente */}
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-emerald-200 pb-3">
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-emerald-900 uppercase">DESPACHO DA ENTIDADE COMPETENTE</h3>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="despacho"
                checked={despachoTipo === "autorizado"}
                onChange={() => setDespachoTipo("autorizado")}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-emerald-700 uppercase">Autorizado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="despacho"
                checked={despachoTipo === "nao_autorizado"}
                onChange={() => setDespachoTipo("nao_autorizado")}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-red-700 uppercase">Não autorizado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="despacho"
                checked={despachoTipo === "parcial"}
                onChange={() => setDespachoTipo("parcial")}
                className="w-4 h-4 text-amber-600"
              />
              <span className="text-amber-700 uppercase">Autorizado parcialmente</span>
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

export default HolidayRequestForm;
