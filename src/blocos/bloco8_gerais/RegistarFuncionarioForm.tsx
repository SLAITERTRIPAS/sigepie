import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Calendar,
  CreditCard,
  FileText,
  Building,
  BookOpen,
  GraduationCap,
  Upload,
  ShieldCheck,
  Printer,
  Search,
  X,
  Camera,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { firestoreService } from "../../lib/firestoreService";
import { useInstituicaoEstrutura } from "../../lib/instituicaoEstruturaService";
import { DraftModal, SyncIndicator } from "../../components/ui/DraftMemoryUI";
import {
  PROVINCIAS_DISTRITOS,
  UNIDADES_ORGANICAS_SISTEMA,
  DEPARTAMENTOS,
  REPARTICOES,
  SETORES,
  CURSOS,
  NIVEIS_ACADEMICOS,
  CATEGORIAS_DOCENTES,
  CATEGORIAS_CTAA,
  LISTA_FUNCOES,
} from "../../constants/formOptions";
import { EFETIVO_GERAL_DATA } from "../../constants/colaboradoresList";
import {
  toTitleCase,
  toSentenceCase,
  classifyTipo,
  generateCollaboratorId,
} from "../../lib/utils";
import { getRoles } from "../../lib/auth";
import { printElementById } from "../../lib/printUtils";


const InputGroup = ({ label, value, onChange, placeholder, type = "text", required, className, disabled, maxLength }: any) => (
  <div className={`flex flex-col gap-1 w-full ${className || ""}`}>
    {label && (
      <label className={`text-[11px] font-black tracking-tight mb-0.5 ${required ? "text-red-600" : "text-slate-800"}`}>
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`bg-white border border-slate-200 rounded-[14px] px-4 py-3 text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition-all w-full font-bold placeholder:font-normal placeholder:text-slate-300 disabled:opacity-50`}
    />
  </div>
);

const SelectGroup = ({ label, value, onChange, options, placeholder, required, className, textClassName, borderClassName }: any) => (
  <div className={`flex flex-col gap-1 w-full ${className || ""}`}>
    {label && (
      <label className={`text-[11px] font-black tracking-tight mb-0.5 ${required ? "text-red-600" : "text-slate-800"}`}>
        {label}
      </label>
    )}
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        className={`appearance-none bg-white border ${borderClassName || "border-slate-200"} rounded-[14px] px-4 py-3 text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition-all w-full pr-10 font-black ${textClassName || ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt: any, idx: number) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={`${val}-${idx}`} value={val} className="text-slate-800">
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  </div>
);

export default function RegistarFuncionarioForm({
  onCancel,
  onSubmit,
  initialData,
  user,
  allDocentes = EFETIVO_GERAL_DATA,
}: {
  onCancel: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  user?: any;
  allDocentes?: any[];
}) {
  const roles = getRoles(user?.title || user?.cargo || user?.cargoChefia || "");
  const isDCC = roles.isDCC;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fields and State Variables matching the requested images:
  const [foto, setFoto] = useState<string>(initialData?.foto || "");
  const [numeroProcesso, setNumeroProcesso] = useState<string>(
    initialData?.numeroProcesso || initialData?.id || ""
  );
  const [nome, setNome] = useState<string>(initialData?.nome || "");
  const [genero, setGenero] = useState<string>(initialData?.genero || "");
  const [nuit, setNuit] = useState<string>(initialData?.nuit || "");
  const [email, setEmail] = useState<string>(initialData?.email || "");
  const [telefone, setTelefone] = useState<string>(initialData?.telefone || "");
  
  // Gerar ID automaticamente em tempo real para todos os utilizadores (existentes e novos) baseado em Nome e NUIT
  useEffect(() => {
    const generatedId = generateCollaboratorId(nome, nuit);
    if (generatedId) {
      setNumeroProcesso(generatedId);
    } else if (!initialData) {
      setNumeroProcesso("");
    }
  }, [nome, nuit]);

  const [estadoCivil, setEstadoCivil] = useState<string>(initialData?.estadoCivil || "");
  const [nomePai, setNomePai] = useState<string>(initialData?.nomePai || "");
  const [nomeMae, setNomeMae] = useState<string>(initialData?.nomeMae || "");
  const [numeroBI, setNumeroBI] = useState<string>(initialData?.numeroBI || "");
  const [emitidoEm, setEmitidoEm] = useState<string>(initialData?.emitidoEm || "");
  const [dataEmissaoBI, setDataEmissaoBI] = useState<string>(initialData?.dataEmissaoBI || "");

  // Local de Nascimento
  const [nacionalidade, setNacionalidade] = useState<string>(
    initialData?.localNascimento?.pais || initialData?.nacionalidade || "Moçambicana"
  );
  const [provincia, setProvincia] = useState<string>(
    initialData?.localNascimento?.provincia || initialData?.provincia || ""
  );
  const [distrito, setDistrito] = useState<string>(
    initialData?.localNascimento?.distrito || initialData?.distrito || ""
  );
  const [dataNascimento, setDataNascimento] = useState<string>(
    initialData?.dataNascimento || ""
  );
  const [morada, setMorada] = useState<string>(initialData?.morada || "");
  const [bairro, setBairro] = useState<string>(initialData?.bairro || "");
  const [distritoResidencia, setDistritoResidencia] = useState<string>(
    initialData?.distritoResidencia || ""
  );
  const [celula, setCelula] = useState<string>(initialData?.celula || "");
  const [quarteiraoNo, setQuarteiraoNo] = useState<string>(initialData?.quarteiraoNo || "");
  const [casaNo, setCasaNo] = useState<string>(initialData?.casaNo || "");
  const [numeroFilhos, setNumeroFilhos] = useState<number>(
    initialData?.numeroFilhos !== undefined ? Number(initialData.numeroFilhos) : 0
  );

  // Dados Profissionais & Formação Académica
  const [carreira, setCarreira] = useState<string>(
    initialData?.carreira || (initialData?.tipo === "Docente" ? "Docente" : "CTA")
  );
  const [categoria, setCategoria] = useState<string>(initialData?.categoria || "");
  const [funcao, setFuncao] = useState<string>(initialData?.funcao || "");
  const [efetivo, setEfetivo] = useState<string>(
    initialData?.efetivo === true ? "Sim" : initialData?.efetivo === false ? "Não" : "Sim"
  );
  const [tipoContrato, setTipoContrato] = useState<string>(initialData?.tipoContrato || "");
  const [vinculoContractual, setVinculoContractual] = useState<string>(
    initialData?.vinculoContractual || ""
  );
  const [dataAdmissao, setDataAdmissao] = useState<string>(initialData?.dataAdmissao || "");
  const [nivelAcademico, setNivelAcademico] = useState<string>(initialData?.nivelAcademico || "");
  const [areaFormacao, setAreaFormacao] = useState<string>(initialData?.areaFormacao || "");
  const [disciplinas, setDisciplinas] = useState<string[]>(
    initialData?.disciplinas || ["", "", "", ""]
  );

  // Alocação Institucional / Cargo de Chefia e Confianças
  const [unidade, setUnidade] = useState<string>(
    initialData?.unidade || initialData?.userArea?.unidade || ""
  );
  const [direcao, setDirecao] = useState<string>(
    initialData?.direcao || initialData?.userArea?.direcao || ""
  );
  const [departamento, setDepartamento] = useState<string>(
    initialData?.departamento || initialData?.userArea?.departamento || ""
  );
  const [reparticao, setReparticao] = useState<string>(
    initialData?.reparticao || initialData?.userArea?.reparticao || ""
  );
  const [sector, setSector] = useState<string>(
    initialData?.sector || initialData?.userArea?.setor || ""
  );
  const [cargo, setCargo] = useState<string>(initialData?.cargo || "");
  const [dataNomeacao, setDataNomeacao] = useState<string>(initialData?.dataNomeacao || "");
  const [dataDesnomeacao, setDataDesnomeacao] = useState<string>(initialData?.dataDesnomeacao || "");
  const [estadoMandato, setEstadoMandato] = useState<string>(
    initialData?.estadoMandato || "Em Actividade"
  );
  const [estado, setEstado] = useState<string>(initialData?.estado || "Ativo");

  // Multi-tenant: Lista de instituições registadas
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [instituicaoId, setInstituicaoId] = useState<string>(initialData?.instituicaoId || "");
  const [instituicaoNome, setInstituicaoNome] = useState<string>(initialData?.instituicaoNome || "");
  const [instituicaoLogo, setInstituicaoLogo] = useState<string>(initialData?.instituicaoLogo || "");

  // Estrutura organizacional canónica da Gestão das Instituições (Órgão -> Direção -> Departamento -> Repartição)
  const { orgaosNomes, getDirecoes, getDepartamentos, getReparticoes } = useInstituicaoEstrutura(instituicaoId);

  useEffect(() => {
    const unsub = firestoreService.instituicoes.subscribe((data) => {
      setInstituicoes(data || []);
      // Auto-selecionar se houver apenas uma instituição
      if (data && data.length === 1 && !instituicaoId) {
        setInstituicaoId(data[0].id);
        setInstituicaoNome(data[0].nome);
        setInstituicaoLogo(data[0].logo || "");
      }
    });
    return () => unsub();
  }, [instituicaoId]);

  // Search logic for pre-populating existing staff (highly productive features must be preserved)
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(
    initialData?.id || null
  );

  // Sync / Draft system for persistent storage in browser or cloud
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const FORM_ID = "registar_funcionario_form_new";
  let currentUser: any = {};
  try {
    currentUser = JSON.parse(
      localStorage.getItem("sigep_logged_in_user") || "{}",
    );
  } catch (e) {
    console.warn("Erro ao ler utilizador do localStorage:", e);
  }

  useEffect(() => {
    const checkDraft = async () => {
      if (!currentUser?.id || initialData) {
        setIsDraftLoaded(true);
        return;
      }
      try {
        const cloudDraft = await firestoreService.drafts.getByUserAndForm(
          currentUser.id,
          FORM_ID
        );
        if (cloudDraft) {
          setShowDraftModal(true);
        } else {
          setIsDraftLoaded(true);
        }
      } catch (err) {
        setIsDraftLoaded(true);
      }
    };
    checkDraft();
  }, [currentUser?.id, initialData]);

  useEffect(() => {
    if (isDraftLoaded && !initialData && currentUser?.id) {
      const draftData = {
        foto,
        numeroProcesso,
        nome,
        genero,
        nuit,
        email,
        telefone,
        estadoCivil,
        nomePai,
        nomeMae,
        numeroBI,
        emitidoEm,
        dataEmissaoBI,
        nacionalidade,
        provincia,
        distrito,
        dataNascimento,
        morada,
        bairro,
        distritoResidencia,
        celula,
        quarteiraoNo,
        casaNo,
        numeroFilhos,
        carreira,
        categoria,
        funcao,
        efetivo,
        tipoContrato,
        vinculoContractual,
        dataAdmissao,
        nivelAcademico,
        areaFormacao,
        disciplinas,
        unidade,
        direcao,
        departamento,
        reparticao,
        sector,
        cargo,
        dataNomeacao,
        dataDesnomeacao,
        estadoMandato,
        estado,
        lastSync: new Date().toISOString(),
      };
      const timer = setTimeout(() => {
        setIsSyncing(true);
        firestoreService.drafts
          .save(currentUser.id, FORM_ID, draftData)
          .finally(() => setIsSyncing(false));
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [
    isDraftLoaded,
    foto,
    numeroProcesso,
    nome,
    genero,
    nuit,
    email,
    telefone,
    estadoCivil,
    nomePai,
    nomeMae,
    numeroBI,
    emitidoEm,
    dataEmissaoBI,
    nacionalidade,
    provincia,
    distrito,
    dataNascimento,
    morada,
    bairro,
    distritoResidencia,
    celula,
    quarteiraoNo,
    casaNo,
    numeroFilhos,
    carreira,
    categoria,
    funcao,
    efetivo,
    tipoContrato,
    vinculoContractual,
    dataAdmissao,
    nivelAcademico,
    areaFormacao,
    disciplinas,
    unidade,
    direcao,
    departamento,
    reparticao,
    sector,
    cargo,
    dataNomeacao,
    dataDesnomeacao,
    estadoMandato,
    estado,
    currentUser?.id,
    initialData,
  ]);

  const recoverDraft = async () => {
    setShowDraftModal(false);
    try {
      const draft: any = await firestoreService.drafts.getByUserAndForm(
        currentUser.id,
        FORM_ID
      );
      if (draft) {
        if (draft.foto) setFoto(draft.foto);
        if (draft.numeroProcesso) setNumeroProcesso(draft.numeroProcesso);
        if (draft.nome) setNome(draft.nome);
        if (draft.genero) setGenero(draft.genero);
        if (draft.nuit) setNuit(draft.nuit);
        if (draft.email) setEmail(draft.email);
        if (draft.telefone) setTelefone(draft.telefone);
        if (draft.estadoCivil) setEstadoCivil(draft.estadoCivil);
        if (draft.nomePai) setNomePai(draft.nomePai);
        if (draft.nomeMae) setNomeMae(draft.nomeMae);
        if (draft.numeroBI) setNumeroBI(draft.numeroBI);
        if (draft.emitidoEm) setEmitidoEm(draft.emitidoEm);
        if (draft.dataEmissaoBI) setDataEmissaoBI(draft.dataEmissaoBI);
        if (draft.nacionalidade) setNacionalidade(draft.nacionalidade);
        if (draft.provincia) setProvincia(draft.provincia);
        if (draft.distrito) setDistrito(draft.distrito);
        if (draft.dataNascimento) setDataNascimento(draft.dataNascimento);
        if (draft.morada) setMorada(draft.morada);
        if (draft.bairro) setBairro(draft.bairro);
        if (draft.distritoResidencia) setDistritoResidencia(draft.distritoResidencia);
        if (draft.celula) setCelula(draft.celula);
        if (draft.quarteiraoNo) setQuarteiraoNo(draft.quarteiraoNo);
        if (draft.casaNo) setCasaNo(draft.casaNo);
        if (draft.numeroFilhos !== undefined) setNumeroFilhos(Number(draft.numeroFilhos));
        if (draft.carreira) setCarreira(draft.carreira);
        if (draft.categoria) setCategoria(draft.categoria);
        if (draft.funcao) setFuncao(draft.funcao);
        if (draft.efetivo) setEfetivo(draft.efetivo);
        if (draft.tipoContrato) setTipoContrato(draft.tipoContrato);
        if (draft.vinculoContractual) setVinculoContractual(draft.vinculoContractual);
        if (draft.dataAdmissao) setDataAdmissao(draft.dataAdmissao);
        if (draft.nivelAcademico) setNivelAcademico(draft.nivelAcademico);
        if (draft.areaFormacao) setAreaFormacao(draft.areaFormacao);
        if (draft.disciplinas) setDisciplinas(draft.disciplinas);
        if (draft.unidade) setUnidade(draft.unidade);
        if (draft.direcao) setDirecao(draft.direcao);
        if (draft.departamento) setDepartamento(draft.departamento);
        if (draft.reparticao) setReparticao(draft.reparticao);
        if (draft.sector) setSector(draft.sector);
        if (draft.cargo) setCargo(draft.cargo);
        if (draft.dataNomeacao) setDataNomeacao(draft.dataNomeacao);
        if (draft.dataDesnomeacao) setDataDesnomeacao(draft.dataDesnomeacao);
        if (draft.estadoMandato) setEstadoMandato(draft.estadoMandato);
        if (draft.estado) setEstado(draft.estado);
      }
    } catch (e) {
      console.error("Erro ao recuperar rascunho:", e);
    }
    setIsDraftLoaded(true);
  };

  const discardDraft = async () => {
    if (currentUser?.id) {
      await firestoreService.drafts.deleteByUserAndForm(
        currentUser.id,
        FORM_ID
      );
    }
    setIsDraftLoaded(true);
    setShowDraftModal(false);
  };

  const handleSelectDocente = (docente: any) => {
    setSelectedExistingId(docente.id || null);
    if (docente.foto) setFoto(docente.foto);
    setNome(docente.nome || "");
    setGenero(docente.genero || "");
    setNuit(docente.nuit || "");
    setEmail(docente.email || "");
    setTelefone(docente.telefone || "");
    setEstadoCivil(docente.estadoCivil || "");
    setNomePai(docente.nomePai || "");
    setNomeMae(docente.nomeMae || "");
    setNumeroBI(docente.numeroBI || "");
    setEmitidoEm(docente.emitidoEm || "");
    setDataEmissaoBI(docente.dataEmissaoBI || "");

    setNacionalidade(
      docente.localNascimento?.pais || docente.nacionalidade || "Moçambicana"
    );
    setProvincia(docente.localNascimento?.provincia || docente.provincia || "");
    setDistrito(docente.localNascimento?.distrito || docente.distrito || "");
    setDataNascimento(docente.dataNascimento || "");
    setMorada(docente.morada || "");
    setBairro(docente.bairro || "");
    setDistritoResidencia(docente.distritoResidencia || "");
    setCelula(docente.celula || "");
    setQuarteiraoNo(docente.quarteiraoNo || "");
    setCasaNo(docente.casaNo || "");
    setNumeroFilhos(docente.numeroFilhos !== undefined ? Number(docente.numeroFilhos) : 0);

    setCarreira(
      docente.carreira || (docente.tipo === "Docente" ? "Docente" : "CTA")
    );
    setCategoria(docente.categoria || "");
    setFuncao(docente.funcao || "");
    setEfetivo(docente.efetivo === true || docente.efetivo === "Sim" ? "Sim" : "Não");
    setTipoContrato(docente.tipoContrato || "");
    setVinculoContractual(docente.vinculoContractual || "");
    setDataAdmissao(docente.dataAdmissao || "");
    setNivelAcademico(docente.nivelAcademico || "");
    setAreaFormacao(docente.areaFormacao || "");
    setDisciplinas(docente.disciplinas || ["", "", "", ""]);

    setUnidade(docente.unidade || "");
    setDirecao(docente.direcao || "");
    setDepartamento(docente.departamento || "");
    setReparticao(docente.reparticao || "");
    setSector(docente.sector || "");
    setCargo(docente.cargo || "");
    setDataNomeacao(docente.dataNomeacao || "");
    setDataDesnomeacao(docente.dataDesnomeacao || "");
    setEstadoMandato(docente.estadoMandato || "Em Actividade");
    setEstado(docente.estado || "Ativo");

    setSearchTerm(docente.nome);
    setShowSearchResults(false);
    if (docente.numeroProcesso || docente.id) {
      setNumeroProcesso(docente.numeroProcesso || docente.id);
    }
  };



  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert("Por favor, introduza o Nome Completo.");
      return;
    }
    if (!genero) {
      alert("Por favor, selecione o Género.");
      return;
    }
    if (!unidade) {
      alert("Por favor, selecione o Órgão de Alocação Institucional.");
      return;
    }

    setIsSubmitting(true);
    try {
      const computedId =
        selectedExistingId ||
        initialData?.id ||
        numeroProcesso ||
        generateCollaboratorId(nome, nuit) ||
        `COLAB-${Date.now()}`;

      const finalData = {
        ...initialData,
        id: computedId,
        numeroProcesso: numeroProcesso || computedId,
        foto,
        nome: toTitleCase(nome),
        genero,
        nuit,
        email,
        telefone,
        estadoCivil,
        nomePai: toTitleCase(nomePai),
        nomeMae: toTitleCase(nomeMae),
        numeroBI,
        emitidoEm: toTitleCase(emitidoEm),
        dataEmissaoBI,
        localNascimento: {
          pais: toTitleCase(nacionalidade),
          provincia: toTitleCase(provincia),
          distrito: toTitleCase(distrito),
        },
        nacionalidade: toTitleCase(nacionalidade),
        provincia: toTitleCase(provincia),
        distrito: toTitleCase(distrito),
        dataNascimento,
        morada: toTitleCase(morada),
        bairro: toTitleCase(bairro),
        distritoResidencia: toTitleCase(distritoResidencia),
        celula,
        quarteiraoNo,
        casaNo,
        numeroFilhos: Number(numeroFilhos) || 0,
        carreira,
        categoria: toTitleCase(categoria),
        funcao: toTitleCase(funcao),
        efetivo: efetivo === "Sim",
        tipoContrato,
        vinculoContractual,
        dataAdmissao,
        nivelAcademico,
        areaFormacao: toTitleCase(areaFormacao),
        disciplinas: disciplinas.map((d) => toTitleCase(d)),
        unidade,
        direcao,
        departamento,
        reparticao,
        sector,
        instituicaoId,
        instituicaoNome,
        instituicaoLogo,
        cargo: toSentenceCase(cargo || carreira),
        dataNomeacao,
        dataDesnomeacao,
        estadoMandato,
        estado,
        status: (direcao || departamento || reparticao || sector) ? "Afetado" : estado,
        tipo: carreira,
        areaDeAfetacao: (() => {
          if (sector && sector !== "Nenhum" && sector !== "-")
            return toTitleCase(sector);
          if (reparticao && reparticao !== "Nenhum" && reparticao !== "-")
            return toTitleCase(reparticao);
          if (departamento && departamento !== "Nenhum" && departamento !== "-")
            return toTitleCase(departamento);
          if (direcao && direcao !== "Nenhum" && direcao !== "-")
            return toTitleCase(direcao);
          return toTitleCase(unidade || "");
        })(),
      };

      await onSubmit(finalData);

      if (currentUser?.id) {
        await firestoreService.drafts.deleteByUserAndForm(currentUser.id, FORM_ID);
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error("Erro ao guardar o funcionário:", err);
      alert("Ocorreu um erro ao guardar o registo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CARGOS_CHEFIA_LIST = [
    "Diretor-Geral",
    "Diretor",
    "Diretor da Divisão",
    "Adjunto Pedagógico",
    "Diretor Central",
    "Diretor de curso",
    "Chefe do Departamento",
    "Chefe de Repartição",
    "Nenhum",
    "Utilizador",
    "Administrador de sistema",
    "Proprietário do sistema",
  ];



  return (
    <div className="relative min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <DraftModal
        show={showDraftModal}
        onRecover={recoverDraft}
        onDiscard={discardDraft}
      />

      <SyncIndicator
        isSyncing={isSyncing}
        className="fixed top-4 right-4 z-50"
      />

      {/* Success Notification Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">
              Registo Efetuado!
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              O colaborador <span className="font-extrabold text-slate-900">{nome}</span> foi registado com sucesso no sistema.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => printElementById("print-area")}
                className="w-full bg-[#00b0f0] text-white py-4 rounded-xl font-bold tracking-widest hover:bg-[#0090c0] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Imprimir Ficha de Cadastro
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
              >
                Voltar ao Menu
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Single Screen Layout Container with top blue accent line */}
      <div className="w-full max-w-5xl mx-auto bg-white rounded-t-[32px] rounded-b-[32px] shadow-2xl border-t-[8px] border-blue-600 overflow-hidden relative pb-16">
        
        {/* Banner header to upload photo as shown in the screenshots */}
        <div className="p-8 border-b border-slate-100 flex flex-col items-center text-center">
          
          {/* Circular file input trigger for the employee picture */}
          <div className="relative mb-4">
            <input
              type="file"
              accept="image/*"
              id="employee-photo-upload"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <label
              htmlFor="employee-photo-upload"
              className="w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/70 hover:border-blue-400 transition-all gap-1 overflow-hidden group shadow-sm"
              title="Clique para carregar fotografia"
            >
              {foto ? (
                <>
                  <img
                    src={foto}
                    alt="Foto do Funcionário"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Camera size={16} /> Alterar
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <UserPlus size={20} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 group-hover:text-blue-500 transition-all">
                    Adicionar Foto
                  </span>
                </>
              )}
            </label>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif mb-1">
            Novo Registo
          </h2>
          <div className="flex items-center gap-3 w-full justify-center max-w-xs mx-auto">
            <div className="h-[1px] bg-slate-200 flex-grow"></div>
            <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-medium font-serif">
              Formulário de Ingressão
            </span>
            <div className="h-[1px] bg-slate-200 flex-grow"></div>
          </div>
        </div>

        {/* Existing Search pre-filler to help with loading standard records quickly */}
        <div className="mx-8 mt-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60">
          <label className="block text-[10px] font-black text-blue-600 tracking-widest uppercase mb-1.5">
            Pesquisar Registo de Apoio para Pré-carregamento
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Digite o nome completo do docente/funcionário para puxar dados antigos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none transition-all"
            />
            {showSearchResults && searchTerm.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-48 overflow-y-auto">
                {allDocentes
                  .filter((d) => d.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((doc) => (
                    <button
                      key={doc.id || Math.random()}
                      type="button"
                      onClick={() => handleSelectDocente(doc)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                    >
                      <span className="font-bold text-slate-800 text-xs">{doc.nome}</span>
                      <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">Selecionar</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Form elements mapped exactly as requested in screenshots */}
        <form onSubmit={handleLocalSubmit} className="p-8 space-y-10">

          {/* SECTION 1: Dados Pessoais */}
          <div className="relative border border-slate-900 rounded-[24px] p-6 pt-10 bg-white">
            <div className="absolute -top-3 left-6 bg-white px-2 flex items-center gap-2">
              <div className="w-[4px] h-[16px] bg-blue-600 rounded-full"></div>
              <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">
                Dados Pessoais
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[11px] font-black tracking-tight text-red-500">
                    Nº Processo / ID Único
                  </label>
                  <input
                    type="text"
                    value={numeroProcesso}
                    readOnly
                    disabled
                    tabIndex={-1}
                    placeholder="Auto-gerado..."
                    className="bg-red-50/50 border border-red-200 rounded-[14px] px-4 py-3 text-red-700 text-sm focus:outline-none transition-all w-full font-black cursor-not-allowed select-none opacity-85"
                  />
                </div>
              </div>

              <InputGroup
                label="Nome Completo"
                value={nome}
                onChange={(e: any) => setNome(e.target.value)}
                placeholder="Digite o nome completo"
                className="md:col-span-3"
                required
              />

              <SelectGroup
                label="Género"
                value={genero}
                onChange={(e: any) => setGenero(e.target.value)}
                placeholder="Seleciona..."
                options={[
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Feminino" },
                ]}
                required
              />

              <InputGroup
                label="NUIT"
                value={nuit}
                onChange={(e: any) => setNuit(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="EX: 123456789"
                maxLength={9}
              />

              <InputGroup
                label="Email Pessoal"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="EX: joao@gmail.com"
                type="email"
              />

              <InputGroup
                label="Telefone"
                value={telefone}
                onChange={(e: any) => setTelefone(e.target.value)}
                placeholder="EX: +258 84 123 4567"
              />

              <SelectGroup
                label="Estado Civil"
                value={estadoCivil}
                onChange={(e: any) => setEstadoCivil(e.target.value)}
                placeholder="Selecione..."
                options={[
                  { value: "Solteiro/a", label: "Solteiro/a" },
                  { value: "Casado/a", label: "Casado/a" },
                  { value: "Divorciado/a", label: "Divorciado/a" },
                  { value: "Viúvo/a", label: "Viúvo/a" },
                ]}
              />

              <InputGroup
                label="Nome do Pai"
                value={nomePai}
                onChange={(e: any) => setNomePai(e.target.value)}
                placeholder="Nome completo do pai"
                className="md:col-span-1.5"
              />

              <InputGroup
                label="Nome da Mãe"
                value={nomeMae}
                onChange={(e: any) => setNomeMae(e.target.value)}
                placeholder="Nome completo da mãe"
                className="md:col-span-1.5"
              />

              <InputGroup
                label="BI /"
                value={numeroBI}
                onChange={(e: any) => setNumeroBI(e.target.value)}
                placeholder="EX: 120101920192A"
              />

              <InputGroup
                label="Emitido em:"
                value={emitidoEm}
                onChange={(e: any) => setEmitidoEm(e.target.value)}
                placeholder="EX: Maputo"
              />

              <InputGroup
                label="Data de Emissão (BI)"
                value={dataEmissaoBI}
                onChange={(e: any) => setDataEmissaoBI(e.target.value)}
                type="date"
              />
            </div>
          </div>


          {/* SECTION 2: Local de Nascimento */}
          <div className="relative border border-slate-900 rounded-[24px] p-6 pt-10 bg-white">
            <div className="absolute -top-3 left-6 bg-white px-2 flex items-center gap-2">
              <div className="w-[4px] h-[16px] bg-blue-600 rounded-full"></div>
              <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">
                Local de Nascimento
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <InputGroup
                label="Nacionalidade"
                value={nacionalidade}
                onChange={(e: any) => setNacionalidade(e.target.value)}
                placeholder="EX: Moçambicana"
              />

              <SelectGroup
                label="Província de Nascimento"
                value={provincia}
                onChange={(e: any) => {
                  setProvincia(e.target.value);
                  setDistrito("");
                }}
                placeholder="Selecione..."
                options={Object.keys(PROVINCIAS_DISTRITOS)}
              />

              <SelectGroup
                label="Distrito"
                value={distrito}
                onChange={(e: any) => setDistrito(e.target.value)}
                placeholder="Selecione..."
                options={provincia ? (PROVINCIAS_DISTRITOS[provincia] || []) : []}
                disabled={!provincia}
              />

              <InputGroup
                label="Data de Nascimento"
                value={dataNascimento}
                onChange={(e: any) => setDataNascimento(e.target.value)}
                type="date"
              />

              <InputGroup
                label="Morada (Província, Distrito, Bairro)"
                value={morada}
                onChange={(e: any) => setMorada(e.target.value)}
                placeholder="Morada atual do colaborador"
                className="md:col-span-2"
              />

              <InputGroup
                label="Bairro"
                value={bairro}
                onChange={(e: any) => setBairro(e.target.value)}
                placeholder="Bairro residencial"
              />

              <InputGroup
                label="Distrito (Residência)"
                value={distritoResidencia}
                onChange={(e: any) => setDistritoResidencia(e.target.value)}
                placeholder="Distrito de residência"
              />

              <InputGroup
                label="Célula"
                value={celula}
                onChange={(e: any) => setCelula(e.target.value)}
                placeholder="Célula"
              />

              <InputGroup
                label="Quarteirão No"
                value={quarteiraoNo}
                onChange={(e: any) => setQuarteiraoNo(e.target.value)}
                placeholder="EX: 12"
              />

              <InputGroup
                label="Casa No"
                value={casaNo}
                onChange={(e: any) => setCasaNo(e.target.value)}
                placeholder="EX: 45"
              />

              <InputGroup
                label="Nº de Filhos"
                value={numeroFilhos}
                onChange={(e: any) => setNumeroFilhos(Number(e.target.value))}
                type="number"
              />
            </div>
          </div>


          {/* SECTION 3: Dados Profissionais & Formação Académica */}
          <div className="relative border border-slate-900 rounded-[24px] p-6 pt-10 bg-white">
            <div className="absolute -top-3 left-6 bg-white px-2 flex items-center gap-2">
              <div className="w-[4px] h-[16px] bg-blue-600 rounded-full"></div>
              <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">
                Dados Profissionais & Formação Académica
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SelectGroup
                label="Carreira"
                value={carreira}
                onChange={(e: any) => {
                  setCarreira(e.target.value);
                  setCategoria("");
                }}
                placeholder="Selecione..."
                options={[
                  { value: "Docente", label: "Docente" },
                  { value: "CTA", label: "CTA" },
                  { value: "Investigador", label: "Investigador" },
                ]}
                className="md:col-span-1.3"
              />

              <SelectGroup
                label="Categoria"
                value={categoria}
                onChange={(e: any) => setCategoria(e.target.value)}
                placeholder="Selecione..."
                options={
                  carreira === "Docente"
                    ? CATEGORIAS_DOCENTES
                    : carreira === "CTA"
                    ? CATEGORIAS_CTAA
                    : [...CATEGORIAS_DOCENTES, ...CATEGORIAS_CTAA]
                }
                className="md:col-span-1.3"
              />

              <SelectGroup
                label="Função"
                value={funcao}
                onChange={(e: any) => setFuncao(e.target.value)}
                placeholder="Selecione..."
                options={LISTA_FUNCOES}
                className="md:col-span-1.4"
              />

              <SelectGroup
                label="Efetivo"
                value={efetivo}
                onChange={(e: any) => setEfetivo(e.target.value)}
                placeholder="Selecione..."
                options={[
                  { value: "Sim", label: "Sim" },
                  { value: "Não", label: "Não" },
                ]}
              />

              <SelectGroup
                label="Tipo de Contrato"
                value={tipoContrato}
                onChange={(e: any) => setTipoContrato(e.target.value)}
                placeholder="Selecione..."
                options={[
                  { value: "Tempo inteiro", label: "Tempo inteiro" },
                  { value: "Tempo Parcial", label: "Tempo Parcial" },
                ]}
              />

              <SelectGroup
                label="Vínculo Contratual"
                value={vinculoContractual}
                onChange={(e: any) => setVinculoContractual(e.target.value)}
                placeholder="Selecione..."
                options={[
                  { value: "Pertence ao quadro", label: "Pertence ao quadro" },
                  { value: "Não pertence ao quadro", label: "Não pertence ao quadro" },
                ]}
              />

              <InputGroup
                label="Data de Admissão"
                value={dataAdmissao}
                onChange={(e: any) => setDataAdmissao(e.target.value)}
                type="date"
              />

              <SelectGroup
                label="Nível Académico"
                value={nivelAcademico}
                onChange={(e: any) => setNivelAcademico(e.target.value)}
                placeholder="Selecione..."
                options={NIVEIS_ACADEMICOS}
                className="md:col-span-2"
              />

              <InputGroup
                label="Área de Formação"
                value={areaFormacao}
                onChange={(e: any) => setAreaFormacao(e.target.value)}
                placeholder="Digite a área de formação"
                className="md:col-span-2"
              />

              {/* Disciplinas sub-section - apenas visível para Docentes */}
              {(carreira === "Docente" || (carreira !== "CTA" && initialData?.tipo === "Docente")) && (
                <div className="md:col-span-4 mt-2">
                  <span className="text-[10px] font-black text-blue-900 tracking-wider uppercase block mb-3">
                    Disciplinas Leccionadas (Até 4)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <InputGroup
                        key={idx}
                        label={`Disciplina ${idx + 1}`}
                        value={disciplinas[idx] || ""}
                        onChange={(e: any) => {
                          const newD = [...disciplinas];
                          newD[idx] = e.target.value;
                          setDisciplinas(newD);
                        }}
                        placeholder={`Disciplina ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* SECTION 4: Alocação Institucional / Cargo de Chefia e Confianças */}
          <div className="relative border border-slate-900 rounded-[24px] p-6 pt-10 bg-white">
            <div className="absolute -top-3 left-6 bg-white px-2 flex items-center gap-2">
              <div className="w-[4px] h-[16px] bg-blue-600 rounded-full"></div>
              <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">
                Alocação Institucional / Cargo de Chefia e Confianças
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {instituicoes.length > 0 && (
                <div className="md:col-span-3 pb-2 border-b border-gray-100">
                  <SelectGroup
                    label="Instituição de Afiliação"
                    value={instituicaoId}
                    onChange={(e: any) => {
                      const selectedId = e.target.value;
                      setInstituicaoId(selectedId);
                      const inst = instituicoes.find((i) => i.id === selectedId);
                      if (inst) {
                        setInstituicaoNome(inst.nome);
                        setInstituicaoLogo(inst.logo || "");
                      } else {
                        setInstituicaoNome("");
                        setInstituicaoLogo("");
                      }
                    }}
                    placeholder="Selecione a Instituição..."
                    options={instituicoes.map((i) => ({ label: i.nome, value: i.id }))}
                    required
                  />
                </div>
              )}

              <SelectGroup
                label="Órgão"
                value={unidade}
                onChange={(e: any) => {
                  setUnidade(e.target.value);
                  setDirecao("");
                  setDepartamento("");
                  setReparticao("");
                  setSector("");
                }}
                placeholder="Selecione..."
                options={orgaosNomes.length > 0 ? orgaosNomes : UNIDADES_ORGANICAS_SISTEMA.map((u) => u.nome)}
                required
              />

              <SelectGroup
                label="Direção"
                value={direcao}
                onChange={(e: any) => {
                  setDirecao(e.target.value);
                  setDepartamento("");
                  setReparticao("");
                  setSector("");
                }}
                placeholder="Selecione..."
                options={unidade ? getDirecoes(unidade) : []}
                disabled={!unidade}
              />

              <SelectGroup
                label="Departamento"
                value={departamento}
                onChange={(e: any) => {
                  setDepartamento(e.target.value);
                  setReparticao("");
                  setSector("");
                }}
                placeholder="Selecione..."
                options={direcao ? getDepartamentos(direcao) : []}
                disabled={!direcao}
              />

              <SelectGroup
                label="Repartição"
                value={reparticao}
                onChange={(e: any) => {
                  setReparticao(e.target.value);
                  setSector("");
                }}
                placeholder="Selecione..."
                options={departamento ? getReparticoes(departamento) : []}
                disabled={!departamento}
              />

              <SelectGroup
                label="Setor"
                value={sector}
                onChange={(e: any) => setSector(e.target.value)}
                placeholder="Selecione..."
                options={
                  reparticao
                    ? (SETORES[reparticao] || []).filter(
                        (s) =>
                          s &&
                          s.toLowerCase() !== "único" &&
                          s.toLowerCase() !== "unico",
                      )
                    : (departamento && SETORES[departamento]
                        ? SETORES[departamento]
                        : [])
                }
                disabled={!reparticao && (!departamento || !SETORES[departamento])}
              />

              <SelectGroup
                label="Cargo"
                value={cargo}
                onChange={(e: any) => setCargo(e.target.value)}
                placeholder="Selecione..."
                options={CARGOS_CHEFIA_LIST}
              />

              <InputGroup
                label="Data da Nomeação"
                value={dataNomeacao}
                onChange={(e: any) => setDataNomeacao(e.target.value)}
                type="date"
              />

              <InputGroup
                label="Data da Desnomeação"
                value={dataDesnomeacao}
                onChange={(e: any) => setDataDesnomeacao(e.target.value)}
                type="date"
              />

              {/* Status selectors custom styled matching the images colors */}
              <SelectGroup
                label="Estado do Mandato"
                value={estadoMandato}
                onChange={(e: any) => setEstadoMandato(e.target.value)}
                placeholder="Selecione..."
                options={[
                  { value: "Em Actividade", label: "Em Atividade" },
                  { value: "Cessado", label: "Cessado" },
                  { value: "Despromovido", label: "Despromovido" },
                ]}
                borderClassName="border-red-400"
                textClassName="text-red-600 font-extrabold"
              />

              <SelectGroup
                label="Estado do Colaborador"
                value={estado}
                onChange={(e: any) => setEstado(e.target.value)}
                placeholder="Selecione..."
                options={[
                  { value: "Ativo", label: "Ativo" },
                  { value: "Em Formação", label: "Em Formação" },
                  { value: "Inativo", label: "Inativo" },
                  { value: "Aposentado", label: "Aposentado" },
                  { value: "Licença", label: "Licença" },
                  { value: "Reformado", label: "Reformado" },
                  { value: "Transferido", label: "Transferido" },
                  { value: "Falecido", label: "Falecido" },
                ]}
                borderClassName="border-emerald-400"
                textClassName="text-emerald-600 font-extrabold"
              />
            </div>
          </div>


          {/* Footer Action Buttons exactly matching the layout and labels in the image */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-8 py-3 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
