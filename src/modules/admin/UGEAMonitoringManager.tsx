import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc, addDoc, updateDoc } from "firebase/firestore";
import { 
  Building2, RefreshCw, ShoppingCart, 
  Activity, DollarSign, ArrowRight, Search
} from "lucide-react";

interface UGEAMonitoringManagerProps {
  user?: any;
}

export const UGEAMonitoringManager: React.FC<UGEAMonitoringManagerProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"ugea_auto" | "produtos_precos" | "monitoria_central">("ugea_auto");
  const [institutionalPlans, setInstitutionalPlans] = useState<any[]>([]);
  const [ugeaPlans, setUgeaPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [monitoringActivities, setMonitoringActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // New product form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdCat, setNewProdCat] = useState("Bens de Consumo");
  const [newProdUnit, setNewProdUnit] = useState("Unidade");
  const [newProdPrice, setNewProdPrice] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const plansSnap = await getDocs(collection(db, "pesoe_documents"));
      const plans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInstitutionalPlans(plans);

      const ugeaSnap = await getDocs(collection(db, "ugea_acquisition_plans"));
      setUgeaPlans(ugeaSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const prodSnap = await getDocs(collection(db, "ugea_products_catalog"));
      if (prodSnap.empty) {
        const defaultProds = [
          { code: "PRD-001", name: "Papel A4 (Resma)", category: "Material de Escritório", unit: "Resma", refPrice: 350 },
          { code: "PRD-002", name: "Toner para Impressora HP", category: "Equipamentos e Acessórios", unit: "Unidade", refPrice: 4500 },
          { code: "PRD-003", name: "Manutenção de Viaturas (Serviço)", category: "Serviços de Terceiros", unit: "Serviço", refPrice: 15000 },
        ];
        for (const p of defaultProds) {
          await setDoc(doc(db, "ugea_products_catalog", p.code), { ...p, history: [], updatedAt: new Date().toISOString() });
        }
        const refetched = await getDocs(collection(db, "ugea_products_catalog"));
        setProducts(refetched.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      const monSnap = await getDocs(collection(db, "monitoring_activities"));
      setMonitoringActivities(monSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error("Erro ao carregar dados UGEA & Monitoria:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessInstitutionalPlan = async (plan: any) => {
    setLoading(true);
    try {
      // Evitar duplicidade no plano de aquisições e contratações
      const alreadyProcessed = ugeaPlans.some(up => up.originPlanId === plan.id);
      if (alreadyProcessed) {
        setMessage({ text: "Este Plano Institucional já foi processado e incluído na UGEA. Duplicidade impedida com sucesso.", type: "info" });
        setLoading(false);
        return;
      }

      const items = plan.activities || plan.items || [];
      const acquisitionItems = items.filter((item: any) => {
        const text = JSON.stringify(item).toLowerCase();
        return !text.includes("ajuda de custo") && !text.includes("subsídio") && !text.includes("diárias");
      });

      const ugeaRecord = {
        originPlanId: plan.id,
        planTitle: plan.title || "Plano Institucional Consolidado",
        processedAt: new Date().toISOString(),
        processedBy: user?.name || "Administrador UGEA",
        itemsCount: acquisitionItems.length,
        items: acquisitionItems,
        status: "Pronto para Concurso / Aquisição"
      };

      await addDoc(collection(db, "ugea_acquisition_plans"), ugeaRecord);

      for (const act of acquisitionItems) {
        const monitoringRecord = {
          activityName: act.name || act.designacao || "Atividade Institucional Aprovada",
          month: act.month || act.mes || "Janeiro",
          planningSector: act.sector || plan.sector || "Setor de Planificação",
          responsibleDirection: act.direction || plan.direction || "Direção Geral",
          totalCost: Number(act.cost || act.valorTotal || 0),
          fundingSource: act.funding || "Orçamento do Estado",
          expectedDate: act.date || act.dataPrevista || "2026",
          activityStatus: "Aprovado / Pendente de Execução",
          executionLevel: "0% (Não iniciado)",
          observations: "Transferido automaticamente do Plano Institucional aprovado para Monitoria com vínculo de origem.",
          originPlanId: plan.id,
          updatedAt: new Date().toISOString()
        };
        await addDoc(collection(db, "monitoring_activities"), monitoringRecord);
      }

      setMessage({ text: "Plano processado com sucesso para UGEA e encaminhado para a Monitoria (com vínculo e sem duplicidade)!", type: "success" });
      await loadData();
    } catch (err: any) {
      setMessage({ text: "Erro ao processar plano: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProductPrice = async (prodId: string, currentPrice: number, newPriceVal: string) => {
    const val = Number(newPriceVal);
    if (isNaN(val) || val < 0) return;

    try {
      const prodRef = doc(db, "ugea_products_catalog", prodId);
      const product = products.find(p => p.id === prodId || p.code === prodId);
      const oldPrice = product?.refPrice || 0;

      const historyEntry = {
        oldPrice,
        newPrice: val,
        date: new Date().toISOString(),
        user: user?.name || "UGEA Gestor"
      };

      const updatedHistory = [...(product?.history || []), historyEntry];

      await updateDoc(prodRef, {
        refPrice: val,
        history: updatedHistory,
        updatedAt: new Date().toISOString()
      });

      setMessage({ text: `Preço atualizado em tempo real para ${val} MZN. Histórico registado.`, type: "success" });
      await loadData();
    } catch (err: any) {
      setMessage({ text: "Erro ao atualizar preço: " + err.message, type: "error" });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdCode || !newProdPrice) return;

    try {
      const newProd = {
        code: newProdCode,
        name: newProdName,
        category: newProdCat,
        unit: newProdUnit,
        refPrice: Number(newProdPrice),
        history: [],
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "ugea_products_catalog", newProdCode), newProd);
      setNewProdName("");
      setNewProdCode("");
      setNewProdPrice("");
      setMessage({ text: "Produto registado com sucesso no catálogo UGEA!", type: "success" });
      await loadData();
    } catch (err: any) {
      setMessage({ text: "Erro ao criar produto: " + err.message, type: "error" });
    }
  };

  const filteredMonitoring = monitoringActivities.filter(m => 
    String(m.activityName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(m.planningSector || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(m.responsibleDirection || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen p-6 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 text-white"
         style={{ background: "#050b38" }}>
      
      {/* Industrial Background Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-950/80 p-6 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-lg">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400">
                <Building2 size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">GESTÃO INTEGRADA UGEA, PLANIFICAÇÃO & MONITORIA</h1>
                <p className="text-xs text-amber-300 font-medium tracking-wide">Plataforma Institucional SIGEP — Automatização de Aquisições, Preços e Acompanhamento</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Atualizar Dados
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between border ${message.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border-rose-500/50 text-rose-300'}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs underline hover:opacity-80">Fechar</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 border-b border-amber-500/20 pb-4">
          <button
            onClick={() => setActiveTab("ugea_auto")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs tracking-wider transition-all shadow-md ${activeTab === 'ugea_auto' ? 'bg-amber-500 text-blue-950 shadow-amber-500/20' : 'bg-blue-900/60 text-slate-300 hover:bg-blue-900 border border-amber-500/20'}`}
          >
            <ShoppingCart size={16} />
            Planos de Aquisição e Contratação UGEA
          </button>
          
          <button
            onClick={() => setActiveTab("produtos_precos")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs tracking-wider transition-all shadow-md ${activeTab === 'produtos_precos' ? 'bg-amber-500 text-blue-950 shadow-amber-500/20' : 'bg-blue-900/60 text-slate-300 hover:bg-blue-900 border border-amber-500/20'}`}
          >
            <DollarSign size={16} />
            Catálogo de Produtos & Preços UGEA
          </button>
          
          <button
            onClick={() => setActiveTab("monitoria_central")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs tracking-wider transition-all shadow-md ${activeTab === 'monitoria_central' ? 'bg-amber-500 text-blue-950 shadow-amber-500/20' : 'bg-blue-900/60 text-slate-300 hover:bg-blue-900 border border-amber-500/20'}`}
          >
            <Activity size={16} />
            Setor de Monitoria & Execução
          </button>
        </div>

        {/* TAB 1: UGEA Auto Processing */}
        {activeTab === "ugea_auto" && (
          <div className="space-y-6">
            <div className="bg-blue-950/60 border border-amber-500/30 p-6 rounded-2xl backdrop-blur-sm">
              <h2 className="text-lg font-black text-amber-400 mb-2">Processamento Automático do Plano Institucional para UGEA</h2>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                Após a aprovação do Plano Institucional, o SIGEP recolhe automaticamente produtos, serviços, quantidades e unidades de medida, preparando a base do Plano de Aquisição e Contratação sem intervenção manual.
              </p>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide">Planos Institucionais Aprovados Disponíveis para UGEA:</h3>
                {institutionalPlans.length === 0 ? (
                  <div className="p-8 text-center bg-blue-900/30 rounded-xl border border-amber-500/20 text-slate-400 text-xs">
                    Nenhum Plano Institucional aprovado encontrado no Firestore. Conclua o fluxo de aprovação no DPEP para gerar planos.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {institutionalPlans.map(plan => (
                      <div key={plan.id} className="bg-blue-900/40 border border-amber-500/30 p-5 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-amber-300 text-sm">{plan.title || "Plano Institucional"}</h4>
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md">Aprovado</span>
                        </div>
                        <p className="text-xs text-slate-300">Criado em: {new Date(plan.createdAt || Date.now()).toLocaleDateString()}</p>
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleProcessInstitutionalPlan(plan)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-lg transition-all shadow-md"
                          >
                            Processar para UGEA & Monitoria <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide">Planos de Aquisição UGEA Gerados:</h3>
                {ugeaPlans.length === 0 ? (
                  <div className="p-8 text-center bg-blue-900/30 rounded-xl border border-amber-500/20 text-slate-400 text-xs">
                    Nenhum plano de aquisição gerado ainda. Clique em "Processar para UGEA & Monitoria" num plano acima.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ugeaPlans.map(up => (
                      <div key={up.id} className="bg-blue-900/50 border border-amber-500/30 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="font-bold text-white text-sm">{up.planTitle}</p>
                          <p className="text-xs text-slate-400">Processado em: {new Date(up.processedAt).toLocaleString()} por {up.processedBy}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-blue-800/80 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
                            {up.itemsCount || 0} Itens de Aquisição
                          </span>
                          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
                            {up.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UGEA Products & Prices Catalog */}
        {activeTab === "produtos_precos" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Product Form */}
              <div className="bg-blue-950/60 border border-amber-500/30 p-6 rounded-2xl backdrop-blur-sm space-y-4">
                <h2 className="text-md font-black text-amber-400">Registar Novo Produto no Catálogo UGEA</h2>
                <form onSubmit={handleCreateProduct} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Código Único</label>
                    <input 
                      type="text" 
                      value={newProdCode} 
                      onChange={e => setNewProdCode(e.target.value)} 
                      placeholder="Ex: PRD-004" 
                      className="w-full mt-1 px-3 py-2 bg-blue-900/60 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Nome do Produto</label>
                    <input 
                      type="text" 
                      value={newProdName} 
                      onChange={e => setNewProdName(e.target.value)} 
                      placeholder="Ex: Computador Portátil i7" 
                      className="w-full mt-1 px-3 py-2 bg-blue-900/60 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Categoria</label>
                    <input 
                      type="text" 
                      value={newProdCat} 
                      onChange={e => setNewProdCat(e.target.value)} 
                      className="w-full mt-1 px-3 py-2 bg-blue-900/60 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Unidade de Medida</label>
                    <input 
                      type="text" 
                      value={newProdUnit} 
                      onChange={e => setNewProdUnit(e.target.value)} 
                      className="w-full mt-1 px-3 py-2 bg-blue-900/60 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Preço de Referência (MZN)</label>
                    <input 
                      type="number" 
                      value={newProdPrice} 
                      onChange={e => setNewProdPrice(e.target.value)} 
                      placeholder="Ex: 65000" 
                      className="w-full mt-1 px-3 py-2 bg-blue-900/60 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl transition-all shadow-md mt-2"
                  >
                    Registar Produto
                  </button>
                </form>
              </div>

              {/* Products List & Real-time Price Update */}
              <div className="lg:col-span-2 bg-blue-950/60 border border-amber-500/30 p-6 rounded-2xl backdrop-blur-sm space-y-4">
                <h2 className="text-md font-black text-amber-400">Catálogo de Preços & Atualização em Tempo Real</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-amber-500/20 text-amber-300">
                        <th className="py-3 px-3">Código</th>
                        <th className="py-3 px-3">Produto</th>
                        <th className="py-3 px-3">Categoria</th>
                        <th className="py-3 px-3">Unidade</th>
                        <th className="py-3 px-3">Preço Ref. (MZN)</th>
                        <th className="py-3 px-3">Atualizar Preço</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-500/10">
                      {products.map(p => (
                        <tr key={p.id || p.code} className="hover:bg-blue-900/30 transition-colors">
                          <td className="py-3 px-3 font-mono text-amber-400">{p.code}</td>
                          <td className="py-3 px-3 font-bold text-white">{p.name}</td>
                          <td className="py-3 px-3 text-slate-300">{p.category}</td>
                          <td className="py-3 px-3 text-slate-300">{p.unit}</td>
                          <td className="py-3 px-3 font-black text-amber-300">{p.refPrice?.toLocaleString()} MZN</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                defaultValue={p.refPrice} 
                                id={`price-input-${p.id || p.code}`} 
                                className="w-24 px-2 py-1 bg-blue-900/80 border border-amber-500/30 rounded-lg text-white text-xs"
                              />
                              <button 
                                onClick={() => {
                                  const inputEl = document.getElementById(`price-input-${p.id || p.code}`) as HTMLInputElement;
                                  if (inputEl) handleUpdateProductPrice(p.id || p.code, p.refPrice, inputEl.value);
                                }}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-lg text-[10px]"
                              >
                                Salvar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Monitoring Sector Central Area */}
        {activeTab === "monitoria_central" && (
          <div className="space-y-6">
            <div className="bg-blue-950/60 border border-amber-500/30 p-6 rounded-2xl backdrop-blur-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-amber-400">Setor de Monitoria — Atividades Institucionais Aprovadas</h2>
                  <p className="text-xs text-slate-300">Acompanhamento automático da execução, custos, fontes de financiamento e níveis de execução.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Pesquisar atividade ou setor..." 
                    className="w-full pl-9 pr-4 py-2 bg-blue-900/60 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {filteredMonitoring.length === 0 ? (
                <div className="p-12 text-center bg-blue-900/30 rounded-xl border border-amber-500/20 text-slate-400 text-xs">
                  Nenhuma atividade registada na Monitoria. Processe um Plano Institucional aprovado na aba UGEA para povoar a monitoria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-amber-500/20 text-amber-300">
                        <th className="py-3 px-3">Nome da Atividade</th>
                        <th className="py-3 px-3">Mês</th>
                        <th className="py-3 px-3">Setor Planificador</th>
                        <th className="py-3 px-3">Direção Responsável</th>
                        <th className="py-3 px-3">Custo Total</th>
                        <th className="py-3 px-3">Fonte</th>
                        <th className="py-3 px-3">Estado</th>
                        <th className="py-3 px-3">Nível de Execução</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-500/10">
                      {filteredMonitoring.map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-blue-900/30 transition-colors">
                          <td className="py-3 px-3 font-bold text-white">{m.activityName}</td>
                          <td className="py-3 px-3 text-slate-300">{m.month}</td>
                          <td className="py-3 px-3 text-amber-300">{m.planningSector}</td>
                          <td className="py-3 px-3 text-slate-300">{m.responsibleDirection}</td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">{Number(m.totalCost || 0).toLocaleString()} MZN</td>
                          <td className="py-3 px-3 text-slate-300">{m.fundingSource}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md">
                              {m.activityStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-300">{m.executionLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UGEAMonitoringManager;
