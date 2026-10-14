import { printElementById } from "../../lib/printUtils";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Save,
  Printer,
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { firestoreService } from "../../lib/firestoreService";
import SignatureUpload from "../bloco5_sistema/SignatureUpload";
import { DocumentFooter } from "../../components/shared/DocumentFooter";
import { InstitutionalHeader } from "../../components/InstitutionalHeader";
import { useCurrentLanguage } from "../../lib/i18n";

interface ColaboradorApresentacao {
  nomeColaborador: string;
  carreira: string;
  classe: string;
  escalao: string;
}

interface GuiaApresentacaoInternaProps {
  user: any;
  onCancel: () => void;
}

export default function GuiaApresentacaoInterna({
  user,
  onCancel,
}: GuiaApresentacaoInternaProps) {
  const currentLang = useCurrentLanguage();
  const isEn = currentLang === "en";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Obter data atual para preenchimento automático
  const hoje = new Date();
  const meses = isEn
    ? [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
    : [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];

  const [formData, setFormData] = useState({
    numeroReferencia: "",
    departamentoDestinatario: "Direcção Académica",
    dia: hoje.getDate().toString(),
    mes: meses[hoje.getMonth()],
    ano: hoje.getFullYear().toString(),
    nomeChefe: "MSc. Elias Limpo Elias João",
    cargoChefe: "Instrutor e Técnico Pedagógico N1",
    assinaturaChefe: "",
  });

  const [colaboradores, setColaboradores] = useState<ColaboradorApresentacao[]>(
    [
      {
        nomeColaborador: "",
        carreira: "Docente",
        classe: "Assistente",
        escalao: "1",
      },
    ],
  );

  useEffect(() => {
    const fetchNextNumber = async () => {
      try {
        const nextNum =
          await firestoreService.counters.getNextNumber("GUIA-APRESENTACAO");
        const formattedNum = nextNum.toString().padStart(3, "0");
        setFormData((prev) => ({
          ...prev,
          numeroReferencia: formattedNum,
        }));
      } catch (err) {
        console.error("Erro ao buscar contador:", err);
        setFormData((prev) => ({
          ...prev,
          numeroReferencia: "020",
        }));
      }
    };
    fetchNextNumber();
  }, []);

  const handlePrint = () => {
    printElementById("print-area");
  };

  const handleAddColaborador = () => {
    setColaboradores((prev) => [
      ...prev,
      {
        nomeColaborador: "",
        carreira: "Docente",
        classe: "Assistente",
        escalao: "1",
      },
    ]);
  };

  const handleRemoveColaborador = (index: number) => {
    if (colaboradores.length <= 1) return;
    setColaboradores((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleColaboradorChange = (
    index: number,
    field: keyof ColaboradorApresentacao,
    value: string,
  ) => {
    setColaboradores((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!formData.departamentoDestinatario) {
      alert("Por favor, preencha o Departamento Destinatário.");
      return;
    }

    // Validar colaboradores
    for (let i = 0; i < colaboradores.length; i++) {
      const colab = colaboradores[i];
      if (!colab.nomeColaborador.trim()) {
        alert(`Por favor, preencha o Nome do Colaborador na linha #${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const docCode = `N/Ref: ${formData.numeroReferencia}/Songo/DICOSAFA/DRH/020/${formData.ano}`;
      await firestoreService.requisicoes_internas.add({
        codigo: docCode,
        tipo: "Guia de Apresentação",
        colaboradores: colaboradores,
        departamentoDestinatario: formData.departamentoDestinatario,
        dataEmissao: `${formData.dia} de ${formData.mes} de ${formData.ano}`,
        emitidoPor: user?.displayName || user?.name || "Administrador",
        status: "Emitido",
        assinaturaChefe: formData.assinaturaChefe,
        createdAt: new Date().toISOString(),
      });
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Erro ao registar o documento no sistema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0 print:m-0">
      {/* Barra de Ações - Oculta na Impressão */}
      <div className="max-w-[210mm] mx-auto mb-6 bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> {isEn ? "Back" : "Voltar"}
        </button>

        <div className="flex items-center gap-3">
          {isSubmitted && (
            <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <CheckCircle size={14} /> {isEn ? "Successfully Registered!" : "Registado com Sucesso!"}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Save size={16} />{" "}
            {isSubmitting ? (isEn ? "Saving..." : "A guardar...") : (isEn ? "Save to System" : "Guardar no Sistema")}
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Printer size={16} /> {isEn ? "Print / PDF" : "Imprimir / PDF"}
          </button>
        </div>
      </div>

      {/* DOCUMENTO INTERATIVO (FOLHA DE PAPEL A4 VERTICAL) */}
      <div className="a4-page-normativa max-w-[210mm] mx-auto bg-white shadow-2xl p-[12mm] sm:p-[15mm] print:shadow-none print:p-[8mm] min-h-[297mm] print:min-h-0 print:h-auto print:max-h-[297mm] print:overflow-hidden flex flex-col justify-between relative font-serif text-slate-900 border border-slate-200 print:border-none">
        {/* Cabeçalho do Documento */}
        <div>
          <InstitutionalHeader
            unidadeName={user?.unidadeOrganica || (isEn ? "ORGANIC UNIT" : "UNIDADE ORGÂNICA")}
            direcaoName={user?.direcao || (isEn ? "Administration, Finance and Support Coordination Directorate" : "Direcção de Coordenação dos Serviços de Administração Financeiros e de Apoio")}
            departamentoName={user?.departamento || (isEn ? "Human Resources Department" : "Departamento de Recursos Humanos")}
            reparticaoName={user?.reparticao}
            sectorName={user?.setor}
            year={new Date().getFullYear()}
            title={isEn ? "INTERNAL PRESENTATION LETTER" : "GUIA DE APRESENTAÇÃO INTERNA"}
            isDocumentoNormativo={true}
            user={user}
          />

          {/* Seção Destinatário (Ao:) à Direita */}
          <div className="flex justify-end mt-8">
            <div className="w-80 border border-slate-300 p-4 rounded-xl bg-slate-50/50 print:bg-transparent">
              <span className="font-sans text-[10px] font-bold text-slate-500 block mb-1">
                {isEn ? "To:" : "Ao:"}
              </span>
              <input
                type="text"
                placeholder={isEn ? "(Department name)" : "(Nome do departamento)"}
                value={formData.departamentoDestinatario}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    departamentoDestinatario: e.target.value,
                  }))
                }
                className="w-full font-bold text-slate-950 border-b border-dashed border-slate-400 focus:border-blue-500 bg-transparent outline-none py-1 text-sm font-serif"
              />
            </div>
          </div>

          {/* Seção Referência e Assunto */}
          <div className="mt-8 space-y-3 font-sans text-xs">
            <div className="flex items-center gap-1 font-mono text-slate-800">
              <span className="font-sans font-bold">{isEn ? "Our Ref:" : "N/Ref:"}</span>
              <input
                type="text"
                placeholder="020"
                value={formData.numeroReferencia}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numeroReferencia: e.target.value,
                  }))
                }
                className="w-12 text-center border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/30 print:bg-transparent print:border-none outline-none font-bold"
              />
              <span>/Songo/DICOSAFA/DRH/020/{formData.ano}</span>
            </div>
            <div>
              <p className="font-bold text-sm">
                {isEn ? "Subject: " : "Assunto: "}
                <span className="underline font-serif">
                  {isEn ? "Presentation Letter" : "Guia de Apresentação"}
                </span>
              </p>
            </div>
          </div>

          {/* Corpo do Texto */}
          <div className="mt-12 text-[12pt] leading-loose text-justify space-y-8 px-4 text-slate-800">
            <p>
              {isEn
                ? "Hereby presents to "
                : "Segue apresentar-se no "}
              <span className="font-bold border-b border-slate-300">
                {formData.departamentoDestinatario ||
                  (isEn ? "Academic Registry Department" : "Departamento de Registo Académico")}
              </span>
              {isEn
                ? ", the following employee(s) for the exercise of their labor activities:"
                : ", o(s) seguinte(s) colaborador(es) para o exercício das suas actividades laborais:"}
            </p>

            <div className="space-y-6">
              {colaboradores.map((colab, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-slate-200 relative group py-2"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold mr-1">{index + 1}.</span>
                    <span>{isEn ? "Mr./Ms." : "O Senhor,"}</span>
                    <input
                      type="text"
                      placeholder={isEn ? "(employee name)" : "(nome do colaborador)"}
                      value={colab.nomeColaborador}
                      onChange={(e) =>
                        handleColaboradorChange(
                          index,
                          "nomeColaborador",
                          e.target.value,
                        )
                      }
                      className="font-bold px-2 py-0.5 border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/40 print:bg-transparent print:border-none focus:bg-white text-slate-900 outline-none w-72 transition-colors inline-block"
                    />
                    <span>{isEn ? ", officer categorized under the career of" : ", funcionário enquadrado na carreira de"}</span>
                    <input
                      type="text"
                      placeholder={isEn ? "(career name)" : "(nome da carreira)"}
                      value={colab.carreira}
                      onChange={(e) =>
                        handleColaboradorChange(
                          index,
                          "carreira",
                          e.target.value,
                        )
                      }
                      className="px-2 py-0.5 border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/40 print:bg-transparent print:border-none focus:bg-white text-slate-900 outline-none w-48 transition-colors inline-block"
                    />
                    <span>{isEn ? ", Class" : ", Classe"}</span>
                    <input
                      type="text"
                      placeholder={isEn ? "(class name)" : "(nome da classe)"}
                      value={colab.classe}
                      onChange={(e) =>
                        handleColaboradorChange(index, "classe", e.target.value)
                      }
                      className="px-2 py-0.5 border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/40 print:bg-transparent print:border-none focus:bg-white text-slate-900 outline-none w-40 transition-colors inline-block"
                    />
                    <span>{isEn ? ", Level" : ", Escalão"}</span>
                    <input
                      type="text"
                      placeholder={isEn ? "(number)" : "(número)"}
                      value={colab.escalao}
                      onChange={(e) =>
                        handleColaboradorChange(
                          index,
                          "escalao",
                          e.target.value,
                        )
                      }
                      className="px-2 py-0.5 border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/40 print:bg-transparent print:border-none focus:bg-white text-slate-900 outline-none w-20 transition-colors inline-block"
                    />
                    <span>.</span>

                    {/* Botão de remoção de item na guia coletiva */}
                    {colaboradores.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColaborador(index)}
                        className="ml-4 p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors inline-flex items-center justify-center align-middle print:hidden"
                        title={isEn ? "Remove this employee" : "Remover este colaborador"}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Botão para adicionar mais um colaborador (Disponível apenas na visualização do sistema) */}
            <div className="flex justify-start print:hidden pt-2">
              <button
                type="button"
                onClick={handleAddColaborador}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-sans font-bold text-xs rounded-xl transition-all border border-blue-100 flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={16} /> {isEn ? "Add +1 employee" : "Adicionar +1 colaborador"}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé e Assinatura */}
        <div className="mt-16 space-y-12">
          {/* Songo, __ de Mês de Ano */}
          <div className="text-right text-[12pt] font-medium pr-8">
            <span>Songo, </span>
            <input
              type="text"
              placeholder="____"
              value={formData.dia}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dia: e.target.value }))
              }
              className="w-10 text-center border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/30 print:bg-transparent print:border-none outline-none"
            />
            <span> {isEn ? "of " : "de "} </span>
            <input
              type="text"
              placeholder={isEn ? "Month" : "Mês"}
              value={formData.mes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mes: e.target.value }))
              }
              className="w-24 text-center border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/30 print:bg-transparent print:border-none outline-none"
            />
            <span> {isEn ? "of " : "de "} </span>
            <input
              type="text"
              placeholder={isEn ? "Year" : "Ano"}
              value={formData.ano}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ano: e.target.value }))
              }
              className="w-16 text-center border-b border-dashed border-slate-400 focus:border-blue-500 bg-amber-50/30 print:bg-transparent print:border-none outline-none"
            />
          </div>

          {/* Bloco de Assinatura */}
          <div className="text-center pt-8 max-w-sm mx-auto flex flex-col items-center">
            <p className="font-bold tracking-wide text-[10px] font-sans text-slate-500 mb-2">
              {isEn ? "The Head of Department" : "O Chefe do Departamento"}
            </p>
            <div className="w-64">
              <SignatureUpload
                label=""
                value={formData.assinaturaChefe}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, assinaturaChefe: val }))
                }
                user={user}
              />
            </div>

            <input
              type="text"
              value={formData.nomeChefe}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nomeChefe: e.target.value }))
              }
              className="w-80 text-center font-bold text-slate-900 border-b border-dashed border-transparent hover:border-slate-300 focus:border-blue-500 bg-transparent outline-none py-0.5 mt-1"
            />
            <input
              type="text"
              value={formData.cargoChefe}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cargoChefe: e.target.value }))
              }
              className="w-80 text-center text-xs text-slate-500 font-bold  tracking-wider border-b border-dashed border-transparent hover:border-slate-300 focus:border-blue-500 bg-transparent outline-none py-0.5 mt-1"
            />
          </div>

          {/* Rodapé Oficial */}
          <DocumentFooter user={user} className="mt-3 print:mt-auto" />
        </div>
      </div>
    </div>
  );
}
