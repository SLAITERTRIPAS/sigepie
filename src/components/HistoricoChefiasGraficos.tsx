import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from "recharts";
import {
  MapPin,
  PieChart as PieIcon,
  BarChart3,
  Globe,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  X,
  Layers,
  Sparkles,
} from "lucide-react";

export interface SetorMandato {
  id?: string;
  cargo: string;
  setor?: string;
  dataNomeacao: string;
  dataCessacao?: string;
  emExercicio?: boolean;
  despacho?: string;
  observacoes?: string;
}

export interface HistoricoItem {
  id?: string;
  colaboradorId?: string;
  idMecanografico?: string;
  nomeCompleto?: string;
  nome?: string;
  naturalidade?: string;
  cargoQueOcupou?: string;
  cargo?: string;
  unidadeDirecao?: string;
  departamento?: string;
  dataNomeacao?: string;
  dataCessacao?: string;
  fim?: string;
  emExercicio?: boolean;
  status?: string;
  despacho?: string;
  observacoes?: string;
  setoresDirigidos?: SetorMandato[];
  [key: string]: any;
}

// Cálculo do Tempo de Mandato (desde o dia da nomeação até à cessação ou data atual se em exercício)
export function calcularTempoMandato(
  dataInicioRaw?: string,
  dataFimRaw?: string,
  emExercicio: boolean = false
): string {
  if (!dataInicioRaw || dataInicioRaw.trim() === "" || dataInicioRaw === "N/D") {
    return "-";
  }

  const inicio = new Date(dataInicioRaw);
  if (isNaN(inicio.getTime())) {
    return "-";
  }

  let fim: Date;
  if (
    emExercicio ||
    !dataFimRaw ||
    dataFimRaw.trim() === "" ||
    dataFimRaw.toLowerCase() === "em exercício" ||
    dataFimRaw.toLowerCase() === "atual"
  ) {
    fim = new Date();
  } else {
    fim = new Date(dataFimRaw);
    if (isNaN(fim.getTime())) {
      fim = new Date();
    }
  }

  if (fim < inicio) {
    return "Data Inválida";
  }

  let anos = fim.getFullYear() - inicio.getFullYear();
  let meses = fim.getMonth() - inicio.getMonth();
  let dias = fim.getDate() - inicio.getDate();

  if (dias < 0) {
    meses -= 1;
    const prevMonth = new Date(fim.getFullYear(), fim.getMonth(), 0);
    dias += prevMonth.getDate();
  }

  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  const partes: string[] = [];
  if (anos > 0) {
    partes.push(`${anos} ${anos === 1 ? "Ano" : "Anos"}`);
  }
  if (meses > 0) {
    partes.push(`${meses} ${meses === 1 ? "Mês" : "Meses"}`);
  }
  if (dias > 0 || partes.length === 0) {
    partes.push(`${dias} ${dias === 1 ? "Dia" : "Dias"}`);
  }

  return partes.join(", ");
}

// Extrai a lista de setores e cargos dirigidos
export function extrairSetoresDirigidos(item: any): SetorMandato[] {
  if (Array.isArray(item.setoresDirigidos) && item.setoresDirigidos.length > 0) {
    return item.setoresDirigidos;
  }
  if (Array.isArray(item.setores) && item.setores.length > 0) {
    return item.setores;
  }

  const cargo = item.cargoQueOcupou || item.cargo || "Titular de Cargo de Chefia";
  const setor = item.unidadeDirecao || item.departamento || item.unidade || "";
  const dataNomeacao = item.dataNomeacao || item.inicio || "";
  const dataCessacao = item.dataCessacao || item.fim || "";
  const emExercicio = Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado"));

  return [
    {
      id: "1",
      cargo: cargo,
      setor: setor,
      dataNomeacao: dataNomeacao,
      dataCessacao: dataCessacao,
      emExercicio: emExercicio,
      despacho: item.despacho || "",
    },
  ];
}

export interface HistoricoChefiasGraficosProps {
  historico: HistoricoItem[];
  selectedRegiao: string | null;
  selectedProvincia: string | null;
  onSelectRegiao: (regiao: string | null) => void;
  onSelectProvincia: (provincia: string | null) => void;
}

// Províncias e Regiões Oficiais de Moçambique
export const REGIOES_MOCAMBIQUE = {
  Norte: ["Cabo Delgado", "Niassa", "Nampula"],
  Centro: ["Zambézia", "Tete", "Manica", "Sofala"],
  Sul: ["Inhambane", "Gaza", "Maputo Província", "Maputo Cidade", "Maputo"],
};

export const TODAS_PROVINCIAS = [
  "Niassa",
  "Cabo Delgado",
  "Nampula",
  "Zambézia",
  "Tete",
  "Manica",
  "Sofala",
  "Inhambane",
  "Gaza",
  "Maputo Cidade",
  "Maputo Província",
];

// Parser inteligente de Naturalidade -> Província e Região
export function parseRegiaoEProvincia(naturalidadeRaw?: string): {
  provincia: string;
  regiao: "Norte" | "Centro" | "Sul" | "Outros";
} {
  if (!naturalidadeRaw || typeof naturalidadeRaw !== "string" || !naturalidadeRaw.trim()) {
    return { provincia: "Não Especificada", regiao: "Outros" };
  }

  const text = naturalidadeRaw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // 1. Região Norte
  if (
    text.includes("niassa") ||
    text.includes("lichinga") ||
    text.includes("cuamba") ||
    text.includes("lago") ||
    text.includes("mandimba")
  ) {
    return { provincia: "Niassa", regiao: "Norte" };
  }
  if (
    text.includes("cabo delgado") ||
    text.includes("pemba") ||
    text.includes("montepuez") ||
    text.includes("mocimboa") ||
    text.includes("palma") ||
    text.includes("mueda") ||
    text.includes("chiure")
  ) {
    return { provincia: "Cabo Delgado", regiao: "Norte" };
  }
  if (
    text.includes("nampula") ||
    text.includes("nacala") ||
    text.includes("angoche") ||
    text.includes("monapo") ||
    text.includes("ilha de mocambique") ||
    text.includes("mocambique") && !text.includes("republica") ||
    text.includes("ribaué") ||
    text.includes("ribáue") ||
    text.includes("meconta")
  ) {
    return { provincia: "Nampula", regiao: "Norte" };
  }

  // 2. Região Centro
  if (
    text.includes("zambezia") ||
    text.includes("quelimane") ||
    text.includes("mocuba") ||
    text.includes("gurue") ||
    text.includes("alto molocue") ||
    text.includes("milange") ||
    text.includes("nicoadala") ||
    text.includes("maganja")
  ) {
    return { provincia: "Zambézia", regiao: "Centro" };
  }
  if (
    text.includes("tete") ||
    text.includes("moatize") ||
    text.includes("cahora bassa") ||
    text.includes("songo") ||
    text.includes("changara") ||
    text.includes("angulo") ||
    text.includes("mutarara")
  ) {
    return { provincia: "Tete", regiao: "Centro" };
  }
  if (
    text.includes("manica") ||
    text.includes("chimoio") ||
    text.includes("gondola") ||
    text.includes("mossurize") ||
    text.includes("sussundenga") ||
    text.includes("barue")
  ) {
    return { provincia: "Manica", regiao: "Centro" };
  }
  if (
    text.includes("sofala") ||
    text.includes("beira") ||
    text.includes("dondo") ||
    text.includes("nhamatanda") ||
    text.includes("buzi") ||
    text.includes("gorongosa") ||
    text.includes("marromeu") ||
    text.includes("caia")
  ) {
    return { provincia: "Sofala", regiao: "Centro" };
  }

  // 3. Região Sul
  if (
    text.includes("inhambane") ||
    text.includes("maxixe") ||
    text.includes("vilankulo") ||
    text.includes("vilanculos") ||
    text.includes("massinga") ||
    text.includes("inharrime") ||
    text.includes("morrumbene") ||
    text.includes("zavala") ||
    text.includes("panda")
  ) {
    return { provincia: "Inhambane", regiao: "Sul" };
  }
  if (
    text.includes("gaza") ||
    text.includes("xai-xai") ||
    text.includes("xai xai") ||
    text.includes("chokwe") ||
    text.includes("bilene") ||
    text.includes("mandlakazi") ||
    text.includes("chibuto") ||
    text.includes("guija") ||
    text.includes("mabalane") ||
    text.includes("massingir")
  ) {
    return { provincia: "Gaza", regiao: "Sul" };
  }
  if (
    text.includes("maputo cidade") ||
    text.includes("ka mpfumo") ||
    text.includes("kamaxakeni") ||
    text.includes("chamanculo") ||
    text.includes("maxaquene") ||
    text.includes("polana") ||
    text.includes("sommerschield") ||
    text.includes("malhangalene") ||
    text.includes("inhaca")
  ) {
    return { provincia: "Maputo Cidade", regiao: "Sul" };
  }
  if (
    text.includes("maputo provincia") ||
    text.includes("matola") ||
    text.includes("boane") ||
    text.includes("marracuene") ||
    text.includes("manhica") ||
    text.includes("manhiça") ||
    text.includes("namaacha") ||
    text.includes("moamba") ||
    text.includes("magude")
  ) {
    return { provincia: "Maputo Província", regiao: "Sul" };
  }
  if (text.includes("maputo") || text.includes("lourenco marques")) {
    return { provincia: "Maputo Província", regiao: "Sul" };
  }

  // 4. Teste direto por nomes padrão
  for (const prov of TODAS_PROVINCIAS) {
    const provNorm = prov.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (text.includes(provNorm)) {
      if (REGIOES_MOCAMBIQUE.Norte.includes(prov)) return { provincia: prov, regiao: "Norte" };
      if (REGIOES_MOCAMBIQUE.Centro.includes(prov)) return { provincia: prov, regiao: "Centro" };
      return { provincia: prov, regiao: "Sul" };
    }
  }

  // Fallback limpo
  return { provincia: naturalidadeRaw.split(/[,-]/)[0].trim() || "Outra / Não Ind.", regiao: "Outros" };
}

// Cores para as Regiões
const CORES_REGIAO: Record<string, { main: string; light: string; border: string; hover: string }> = {
  Norte: { main: "#2563eb", light: "#eff6ff", border: "#93c5fd", hover: "#1d4ed8" }, // Azul
  Centro: { main: "#d97706", light: "#fffbeb", border: "#fde68a", hover: "#b45309" }, // Âmbar / Laranja
  Sul: { main: "#059669", light: "#ecfdf5", border: "#a7f3d0", hover: "#047857" }, // Esmeralda / Verde
  Outros: { main: "#64748b", light: "#f8fafc", border: "#cbd5e1", hover: "#475569" }, // Slate
};

export function HistoricoChefiasGraficos({
  historico,
  selectedRegiao,
  selectedProvincia,
  onSelectRegiao,
  onSelectProvincia,
}: HistoricoChefiasGraficosProps) {
  const [viewMode, setViewMode] = useState<"todos" | "provincia" | "regiao">("todos");

  // Processamento e Agregação de Dados
  const { dadosProvincia, dadosRegiao, dadosRegiaoStatus, estatisticas } = useMemo(() => {
    const contagemProv: Record<string, { total: number; emExercicio: number; cessados: number; regiao: string }> = {};
    const contagemReg: Record<string, { total: number; emExercicio: number; cessados: number }> = {
      Norte: { total: 0, emExercicio: 0, cessados: 0 },
      Centro: { total: 0, emExercicio: 0, cessados: 0 },
      Sul: { total: 0, emExercicio: 0, cessados: 0 },
      Outros: { total: 0, emExercicio: 0, cessados: 0 },
    };

    // Inicializar províncias padrão para manter consistência visual no gráfico
    TODAS_PROVINCIAS.forEach((p) => {
      let r = "Sul";
      if (REGIOES_MOCAMBIQUE.Norte.includes(p)) r = "Norte";
      else if (REGIOES_MOCAMBIQUE.Centro.includes(p)) r = "Centro";
      contagemProv[p] = { total: 0, emExercicio: 0, cessados: 0, regiao: r };
    });

    historico.forEach((item) => {
      const { provincia, regiao } = parseRegiaoEProvincia(item.naturalidade);
      const isCessado = Boolean(item.dataCessacao || item.fim || (!item.emExercicio && item.status === "Cessado"));
      const isEmExercicio = Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado"));

      // Agregação por Província
      if (!contagemProv[provincia]) {
        contagemProv[provincia] = { total: 0, emExercicio: 0, cessados: 0, regiao };
      }
      contagemProv[provincia].total++;
      if (isEmExercicio) contagemProv[provincia].emExercicio++;
      if (isCessado) contagemProv[provincia].cessados++;

      // Agregação por Região
      if (contagemReg[regiao]) {
        contagemReg[regiao].total++;
        if (isEmExercicio) contagemReg[regiao].emExercicio++;
        if (isCessado) contagemReg[regiao].cessados++;
      } else {
        contagemReg.Outros.total++;
        if (isEmExercicio) contagemReg.Outros.emExercicio++;
        if (isCessado) contagemReg.Outros.cessados++;
      }
    });

    // Formatar array de Províncias ordenado
    const arrayProv = Object.entries(contagemProv)
      .map(([nome, dados]) => ({
        provincia: nome,
        total: dados.total,
        emExercicio: dados.emExercicio,
        cessados: dados.cessados,
        regiao: dados.regiao,
        cor: CORES_REGIAO[dados.regiao]?.main || "#64748b",
      }))
      .filter((d) => d.total > 0 || TODAS_PROVINCIAS.includes(d.provincia))
      .sort((a, b) => b.total - a.total);

    // Formatar array de Regiões para PieChart
    const totalChefias = historico.length || 1;
    const arrayReg = Object.entries(contagemReg)
      .filter(([_, dados]) => dados.total > 0)
      .map(([nome, dados]) => ({
        name: `Região ${nome}`,
        regiao: nome,
        value: dados.total,
        percent: ((dados.total / totalChefias) * 100).toFixed(1),
        emExercicio: dados.emExercicio,
        cessados: dados.cessados,
        fill: CORES_REGIAO[nome]?.main || "#64748b",
      }));

    // Formatar array para gráfico de barras empilhadas/comparativas de Região
    const arrayRegStatus = ["Norte", "Centro", "Sul", "Outros"]
      .filter((r) => contagemReg[r]?.total > 0 || ["Norte", "Centro", "Sul"].includes(r))
      .map((r) => ({
        regiao: r,
        nome: `Região ${r}`,
        total: contagemReg[r]?.total || 0,
        "Em Exercício": contagemReg[r]?.emExercicio || 0,
        "Cessados": contagemReg[r]?.cessados || 0,
      }));

    // Estatísticas de destaque
    const regiaoLider = arrayReg.length > 0
      ? [...arrayReg].sort((a, b) => b.value - a.value)[0]
      : null;

    const provLider = arrayProv.length > 0 && arrayProv[0].total > 0
      ? arrayProv[0]
      : null;

    const provsComRepresentacao = arrayProv.filter((p) => p.total > 0).length;

    return {
      dadosProvincia: arrayProv,
      dadosRegiao: arrayReg,
      dadosRegiaoStatus: arrayRegStatus,
      estatisticas: {
        regiaoLider,
        provLider,
        provsComRepresentacao,
        totalGeral: historico.length,
      },
    };
  }, [historico]);

  // Tooltip customizado elegante
  const CustomTooltipProvincia = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.cor }}
            />
            <span className="font-black text-sm">{data.provincia}</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Região: <strong className="text-white">{data.regiao}</strong>
          </p>
          <div className="pt-1 border-t border-slate-800 flex justify-between gap-4 font-semibold">
            <span>Total de Chefias:</span>
            <span className="font-black text-amber-400">{data.total}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>• Em Exercício:</span>
            <span className="font-bold">{data.emExercicio}</span>
          </div>
          <div className="flex justify-between gap-4 text-amber-300">
            <span>• Mandatos Cessados:</span>
            <span className="font-bold">{data.cessados}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipRegiao = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            <span className="font-black text-sm">{data.name}</span>
          </div>
          <div className="pt-1 border-t border-slate-800 flex justify-between gap-4 font-semibold">
            <span>Total de Chefias:</span>
            <span className="font-black text-amber-400">{data.value} ({data.percent}%)</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>• Em Exercício:</span>
            <span className="font-bold">{data.emExercicio}</span>
          </div>
          <div className="flex justify-between gap-4 text-amber-300">
            <span>• Cessados:</span>
            <span className="font-bold">{data.cessados}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 space-y-6">
      {/* 1. CABEÇALHO DO PAINEL GRÁFICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-900">
            <Globe className="text-amber-500" size={20} />
            <h3 className="text-base font-black uppercase tracking-wider">
              Análise e Comparação Geográfica de Titulares de Chefia
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Distribuição demográfica e representatividade institucional por Província de Naturalidade e Região Geográfica (Norte, Centro, Sul).
          </p>
        </div>

        {/* Controles de Vista & Filtro Ativo */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tag de Filtro Ativo */}
          {(selectedRegiao || selectedProvincia) && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1 rounded-xl text-xs font-bold animate-in fade-in">
              <Filter size={12} className="text-blue-600" />
              <span>
                Filtro: {selectedProvincia ? `Prov. ${selectedProvincia}` : `Região ${selectedRegiao}`}
              </span>
              <button
                onClick={() => {
                  onSelectRegiao(null);
                  onSelectProvincia(null);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 text-blue-700 ml-1 cursor-pointer transition"
                title="Limpar filtro geográfico"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Seletor de Modo de Visualização */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode("todos")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "todos"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Layers size={14} /> Panorama Geral
            </button>
            <button
              onClick={() => setViewMode("provincia")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "provincia"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <BarChart3 size={14} /> Por Província
            </button>
            <button
              onClick={() => setViewMode("regiao")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "regiao"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <PieIcon size={14} /> Por Região
            </button>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE DESTAQUE E INDICADORES GEOGRÁFICOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Região Líder */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Região Predominante</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">
              {estatisticas.regiaoLider ? `${estatisticas.regiaoLider.name}` : "N/D"}
            </h4>
            <p className="text-[11px] font-semibold text-blue-700">
              {estatisticas.regiaoLider ? `${estatisticas.regiaoLider.value} chefias (${estatisticas.regiaoLider.percent}%)` : "Sem registos"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Globe size={20} />
          </div>
        </div>

        {/* Província Líder */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Província com Maior Representação</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">
              {estatisticas.provLider ? estatisticas.provLider.provincia : "N/D"}
            </h4>
            <p className="text-[11px] font-semibold text-amber-800">
              {estatisticas.provLider ? `${estatisticas.provLider.total} titular(es)` : "Sem registos"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <MapPin size={20} />
          </div>
        </div>

        {/* Cobertura Territorial */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Cobertura Territorial</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">
              {estatisticas.provsComRepresentacao} de 11 Províncias
            </h4>
            <p className="text-[11px] font-semibold text-emerald-800">
              {((estatisticas.provsComRepresentacao / 11) * 100).toFixed(0)}% do território nacional
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Award size={20} />
          </div>
        </div>

        {/* Legenda Rápida Interativa */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-center gap-1.5 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filtrar por Região:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectRegiao(selectedRegiao === "Norte" ? null : "Norte")}
              className={`flex-1 py-1 px-1.5 rounded-lg text-center font-bold text-[10px] transition cursor-pointer border ${
                selectedRegiao === "Norte"
                  ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                  : "bg-white text-blue-800 border-blue-200 hover:bg-blue-50"
              }`}
            >
              Norte
            </button>
            <button
              onClick={() => onSelectRegiao(selectedRegiao === "Centro" ? null : "Centro")}
              className={`flex-1 py-1 px-1.5 rounded-lg text-center font-bold text-[10px] transition cursor-pointer border ${
                selectedRegiao === "Centro"
                  ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                  : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
              }`}
            >
              Centro
            </button>
            <button
              onClick={() => onSelectRegiao(selectedRegiao === "Sul" ? null : "Sul")}
              className={`flex-1 py-1 px-1.5 rounded-lg text-center font-bold text-[10px] transition cursor-pointer border ${
                selectedRegiao === "Sul"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                  : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              Sul
            </button>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICOS DINÂMICOS CONFORME A VISUALIZAÇÃO SELECIONADA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* GRÁFICO 1: DISTRIBUIÇÃO COMPARATIVA POR PROVÍNCIA (Barras Horizontais / Verticais) */}
        {(viewMode === "todos" || viewMode === "provincia") && (
          <div
            className={`${
              viewMode === "todos" ? "lg:col-span-7" : "lg:col-span-12"
            } bg-slate-50/70 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-700" />
                <h4 className="text-sm font-black text-slate-900">
                  Comparação por Província de Origem
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Clique numa barra para filtrar
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosProvincia}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="provincia"
                    tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                    interval={0}
                    angle={-40}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <Tooltip content={<CustomTooltipProvincia />} />
                  <Bar
                    dataKey="total"
                    name="Titulares de Chefia"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={(data: any) => {
                      if (data && data.provincia) {
                        onSelectProvincia(
                          selectedProvincia === data.provincia ? null : data.provincia
                        );
                      }
                    }}
                  >
                    {dadosProvincia.map((entry, index) => {
                      const isSelected = selectedProvincia === entry.provincia;
                      return (
                        <Cell
                          key={`cell-prov-${index}`}
                          fill={isSelected ? "#0f172a" : entry.cor}
                          opacity={
                            selectedProvincia
                              ? isSelected
                                ? 1
                                : 0.35
                              : 0.9
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda de cores por região */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-200 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>Norte (Cabo Delgado, Niassa, Nampula)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-600" />
                <span>Centro (Zambézia, Tete, Manica, Sofala)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>Sul (Inhambane, Gaza, Maputo)</span>
              </div>
            </div>
          </div>
        )}

        {/* GRÁFICO 2: DISTRIBUIÇÃO REGIONAL (PIE / DONUT E STATUS) */}
        {(viewMode === "todos" || viewMode === "regiao") && (
          <div
            className={`${
              viewMode === "todos" ? "lg:col-span-5" : "lg:col-span-12"
            } bg-slate-50/70 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon size={18} className="text-amber-600" />
                <h4 className="text-sm font-black text-slate-900">
                  Participação por Região Geográfica
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Norte vs Centro vs Sul
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Gráfico Circular Donut */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltipRegiao />} />
                    <Pie
                      data={dadosRegiao}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      cursor="pointer"
                      onClick={(entry: any) => {
                        if (entry && entry.regiao) {
                          onSelectRegiao(
                            selectedRegiao === entry.regiao ? null : entry.regiao
                          );
                        }
                      }}
                    >
                      {dadosRegiao.map((entry, index) => {
                        const isSelected = selectedRegiao === entry.regiao;
                        return (
                          <Cell
                            key={`cell-reg-${index}`}
                            fill={entry.fill}
                            stroke={isSelected ? "#0f172a" : "#ffffff"}
                            strokeWidth={isSelected ? 3 : 1}
                            opacity={
                              selectedRegiao
                                ? isSelected
                                  ? 1
                                  : 0.35
                                : 0.9
                            }
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Lista Detalhada com Percentagens e Status */}
              <div className="space-y-3">
                {dadosRegiao.map((item) => {
                  const isSelected = selectedRegiao === item.regiao;
                  return (
                    <div
                      key={item.regiao}
                      onClick={() =>
                        onSelectRegiao(selectedRegiao === item.regiao ? null : item.regiao)
                      }
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className={`text-xs font-black ${isSelected ? "text-amber-400" : "text-slate-900"}`}>
                          {item.value} ({item.percent}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-semibold">
                        <span className={isSelected ? "text-emerald-300" : "text-emerald-700"}>
                          Ativos: {item.emExercicio}
                        </span>
                        <span className={isSelected ? "text-amber-300" : "text-amber-700"}>
                          Cessados: {item.cessados}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparativo de Mandatos por Região */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosRegiaoStatus}
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="regiao" tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                      iconSize={10}
                    />
                    <Bar dataKey="Em Exercício" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cessados" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
