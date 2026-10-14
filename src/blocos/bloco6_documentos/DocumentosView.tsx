import React, { useState } from "react";
import { FileText, Folder, Trash2, Upload, FileSignature } from "lucide-react";
import FormularioRequisicaoInterna from "../bloco6_documentos/FormularioRequisicaoInterna";
import GuiaTransferenciaBens from "../bloco6_documentos/GuiaTransferenciaBens";
import FichaInventarioMovel from "../bloco6_documentos/FichaInventarioMovel";
import OrdemServicoTransferencia from "../bloco6_documentos/OrdemServicoTransferencia";
import GuiaApresentacaoInterna from "../bloco6_documentos/GuiaApresentacaoInterna";
import InformacaoPropostaForm from "../bloco6_documentos/InformacaoPropostaForm";
import JustificacaoFaltaDispensaForm from "../bloco6_documentos/JustificacaoFaltaDispensaForm";
import { firestoreService } from "../../lib/firestoreService";
import { isSuperBossUser, isPersonnelBoss } from "../../lib/auth";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { ActiveFormWrapper } from "../../components/shared/ActiveFormWrapper";
import { InstitutionalHeader } from "../../components/InstitutionalHeader";
import { useCurrentLanguage, getTranslation } from "../../lib/i18n";

export default function DocumentosView({ title = "Documentos Normativos", user }: { title?: string; user: any }) {
  const currentLang = useCurrentLanguage();
  const isEn = currentLang === "en";

  const isAdmin = isSuperBossUser(user);
  const isRHBoss =
    isPersonnelBoss(user) ||
    user?.cargoChefia?.toLowerCase().includes("recursos humanos") ||
    isAdmin;
  const isPatrimonio =
    user?.departamento?.toUpperCase().includes("PATRIM") ||
    user?.reparticao?.toUpperCase().includes("PATRIM") ||
    user?.setor?.toUpperCase().includes("PATRIM") ||
    isAdmin;

  const [documentos] = useState<any[]>([]);
  const [activeDigitalForm, setActiveDigitalForm] = useState<string | null>(
    null,
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log("File selected:", file);
    alert(
      "Funcionalidade de conversão de PDF para dados digitais ainda não implementada.",
    );
  };

  const handleSelectDoc = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;

    const normalized = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (normalized.includes("requisicao interna")) {
      setActiveDigitalForm("m1");
    } else if (
      normalized.includes("pedido de transferencia") ||
      normalized.includes("guia de transferencia")
    ) {
      setActiveDigitalForm("m2");
    } else if (
      normalized.includes("ficha de cadastro de inventario") ||
      normalized.includes("inventario movel") ||
      normalized.includes("cadastro de inventario")
    ) {
      setActiveDigitalForm("m3");
    } else if (
      normalized.includes("ordem de servico: transferencia") ||
      normalized.includes("ordem de servico (transferencia") ||
      normalized.includes("ordem de servico: transferencia interna")
    ) {
      setActiveDigitalForm("m4");
    } else if (
      normalized.includes("guia de apresentacao") ||
      normalized.includes("apresentacao")
    ) {
      setActiveDigitalForm("m5");
    } else if (
      normalized.includes("informacao proposta") ||
      normalized.includes("informacao posta") ||
      normalized.includes("proposta") ||
      normalized === "informacao"
    ) {
      setActiveDigitalForm("m6");
    } else if (
      normalized.includes("justificacao") ||
      normalized.includes("justificativa") ||
      normalized.includes("falta") ||
      normalized.includes("faltas") ||
      normalized.includes("efectividade")
    ) {
      if (normalized.includes("dispensa")) {
        setActiveDigitalForm("m7_ambos");
      } else {
        setActiveDigitalForm("m7_justificacao");
      }
    } else if (normalized.includes("dispensa")) {
      setActiveDigitalForm("m7_dispensa");
    } else {
      alert(`O modelo para "${val}" ainda não está implementado.`);
      e.target.value = ""; // reset
    }
  };

  const handleInventorySubmit = async (data: any) => {
    try {
      await firestoreService.inventarios_patrimoniais.add({
        ...data,
        userId: user?.id,
        tipo_patrimonio: "Móvel",
        unidade: user?.departamento,
        data_inventario: new Date().toISOString(),
      });
      alert("Inventário salvo com sucesso!");
      setActiveDigitalForm(null);
    } catch (error) {
      console.error("Erro ao salvar inventário:", error);
      throw error;
    }
  };

  if (activeDigitalForm) {
    return (
      <ActiveFormWrapper onBack={() => setActiveDigitalForm(null)}>
        {activeDigitalForm === "m1" && (
          <FormularioRequisicaoInterna
            user={user}
            onCancel={() => setActiveDigitalForm(null)}
          />
        )}
        {activeDigitalForm === "m2" && (
          <GuiaTransferenciaBens
            user={user}
            onCancel={() => setActiveDigitalForm(null)}
          />
        )}
        {activeDigitalForm === "m3" && (
          <FichaInventarioMovel
            user={user}
            onSubmit={handleInventorySubmit}
            onCancel={() => setActiveDigitalForm(null)}
          />
        )}
        {activeDigitalForm === "m4" && (
          <OrdemServicoTransferencia
            user={user}
            onCancel={() => setActiveDigitalForm(null)}
          />
        )}
        {activeDigitalForm === "m5" && (
          <GuiaApresentacaoInterna
            user={user}
            onCancel={() => setActiveDigitalForm(null)}
          />
        )}
        {activeDigitalForm === "m6" && (
          <InformacaoPropostaForm
            user={user}
            onCancel={() => setActiveDigitalForm(null)}
          />
        )}
        {activeDigitalForm?.startsWith("m7") && (
          <JustificacaoFaltaDispensaForm
            user={user}
            onCancel={() => setActiveDigitalForm(null)}
            tipoInicial={
              activeDigitalForm === "m7_dispensa"
                ? "dispensa"
                : activeDigitalForm === "m7_justificacao"
                ? "justificacao"
                : "ambos"
            }
          />
        )}
      </ActiveFormWrapper>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-10 pb-16 text-slate-900">
      {/* Cabeçalho Institucional Oficial (Idêntico ao Plano de Actividade) */}
      <InstitutionalHeader
        unidadeName={user?.unidadeOrganica || user?.unidade}
        direcaoName={user?.direcao}
        departamentoName={user?.departamento}
        reparticaoName={user?.reparticao}
        sectorName={user?.setor}
        year={new Date().getFullYear()}
        title={title || "Documentos Normativos"}
      />

      {/* Secção de Modelos e Formulários */}
      <section className="space-y-6">
        <SectionHeader
          title={isEn ? "Official Templates & Forms" : "Modelos e Formulários Oficiais"}
          description={isEn ? "Select the desired normative document from the list below to fill and issue" : "Selecione o documento normativo desejado na lista abaixo para preenchimento e emissão"}
          icon={FileSignature}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-800"
        />

        <div className="w-full max-w-xl bg-white p-2 rounded-2xl">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
            {isEn ? "Select Normative Document" : "Selecione o Documento Normativo"}
          </label>
          <select
            className="w-full p-4 rounded-xl border border-slate-300 bg-white shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-900 cursor-pointer"
            onChange={handleSelectDoc}
            defaultValue=""
          >
            <option value="" disabled className="text-slate-400">
              {isEn ? "Select a document..." : "Selecione um documento..."}
            </option>

            <optgroup label={isEn ? "General" : "Geral"} className="font-bold text-slate-900">
              <option value="Minuta de pedido de férias">
                {isEn ? "Vacation Request Draft" : "Minuta de pedido de férias"}
              </option>
              <option value="Informação proposta">{isEn ? "Information Proposal" : "Informação proposta"}</option>
              <option value="Requisição Interna">{isEn ? "Internal Requisition" : "Requisição Interna"}</option>
              <option value="Pedido de Transferência Interna">
                {isEn ? "Internal Transfer Request" : "Pedido de Transferência Interna"}
              </option>
              <option value="Pedido de dispensa">{isEn ? "Dispensation Request" : "Pedido de dispensa"}</option>
              <option value="Justificação de faltas">
                {isEn ? "Justification of Absences (Attendance)" : "Justificação de faltas (Efectividade)"}
              </option>
              <option value="Pedido de dispensa ou justificativa de faltas">
                {isEn ? "Dispensation Request / Absence Justification" : "Pedido de dispensa / Justificativa de faltas"}
              </option>
              <option value="Ordem de Serviço: Transferência Interna">
                {isEn ? "Service Order (Internal Transfer)" : "Ordem de Serviço (Transferência Interna)"}
              </option>
            </optgroup>

            {isRHBoss && (
              <optgroup label={isEn ? "For Head of Human Resources" : "Para Chefe de Recursos Humanos"} className="font-bold text-slate-900">
                <option value="Guia de Marcha">{isEn ? "Travel Order" : "Guia de Marcha"}</option>
                <option value="Guia de Apresentação">
                  {isEn ? "Internal Presentation Letter" : "Guia de Apresentação"}
                </option>
                <option value="Justificação de faltas">
                  {isEn ? "Justification of Absences / Attendance" : "Justificação de Faltas / Efectividade"}
                </option>
                <option value="Ordem de serviços">{isEn ? "Service Order" : "Ordem de serviços"}</option>
                <option value="Ordem de Serviço: Transferência Interna">
                  {isEn ? "Service Order (Internal Transfer)" : "Ordem de Serviço (Transferência Interna)"}
                </option>
                <option value="Informação">{isEn ? "Information" : "Informação"}</option>
                <option value="Comunicado">{isEn ? "Official Notice" : "Comunicado"}</option>
              </optgroup>
            )}

            {isPatrimonio && (
              <optgroup label={isEn ? "Exclusive Asset Section" : "Exclusivo Repartição de Património"} className="font-bold text-slate-900">
                <option value="Ficha de Cadastro de Inventário">
                  {isEn ? "Inventory Registration Form" : "Ficha de Cadastro de Inventário"}
                </option>
              </optgroup>
            )}
          </select>
        </div>

        {/* CARTÕES DE ACESSO RÁPIDO AOS FORMULÁRIOS DIGITAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div
            onClick={() => setActiveDigitalForm("m7_justificacao")}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-600 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600 text-white font-bold group-hover:scale-105 transition-transform shadow-xs">
                📋
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">
                  {isEn ? "Justification of Absences" : "Justificação de Faltas"}
                </h4>
                <p className="text-xs font-semibold text-blue-800">{isEn ? "Attendance Record" : "Registo de Efectividade"}</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveDigitalForm("m7_dispensa")}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold group-hover:scale-105 transition-transform shadow-xs">
                📅
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">
                  {isEn ? "Dispensation Request" : "Pedido de Dispensa"}
                </h4>
                <p className="text-xs font-semibold text-emerald-800">{isEn ? "EGFAE Article 101" : "Art. 101 do EGFAE"}</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveDigitalForm("m6")}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-600 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500 text-white font-bold group-hover:scale-105 transition-transform shadow-xs">
                📝
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">
                  {isEn ? "Information Proposal" : "Informação Proposta"}
                </h4>
                <p className="text-xs font-semibold text-amber-800">{isEn ? "Travel & Activities" : "Deslocações & Actividades"}</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveDigitalForm("m1")}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-600 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 text-white font-bold group-hover:scale-105 transition-transform shadow-xs">
                📦
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">
                  {isEn ? "Internal Requisition" : "Requisição Interna"}
                </h4>
                <p className="text-xs font-semibold text-slate-700">{isEn ? "Materials & Supplies" : "Material & Economato"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secção de Documentos Normativos Carregados */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2.5 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Regulamentos e Normativas
              </h3>
              <p className="text-sm font-medium text-slate-700">
                Repositório de documentos legais e orientações técnicas
              </p>
            </div>
          </div>
          <label className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all cursor-pointer shadow-md">
            <Upload size={16} className="text-amber-400" />
            Upload Normativo
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentos.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-4 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-slate-200">
                <Folder className="text-slate-500" size={32} />
              </div>
              <p className="text-slate-800 font-bold text-base">
                Nenhum documento normativo carregado nesta unidade.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Utilize o botão "Upload Normativo" para carregar regulamentos ou diretrizes internas em formato PDF.
              </p>
            </div>
          ) : (
            documentos.map((doc) => (
              <div
                key={doc.id}
                className={`p-6 rounded-2xl shadow-sm border ${doc.isRascunho ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200 hover:border-blue-400"}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl ${doc.isRascunho ? "bg-slate-200 text-slate-700" : "bg-blue-50 text-blue-700"}`}
                  >
                    {doc.isRascunho ? (
                      <Folder size={24} />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{doc.nome}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      {doc.tipo} • {doc.formato}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {!doc.isRascunho && isAdmin && (
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir Documento"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Upload size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
