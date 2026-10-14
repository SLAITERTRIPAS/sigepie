import React, { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Loader2, 
  Camera,
  Globe,
  FileText,
  Target,
  Shield,
  Palette,
  Briefcase
} from "lucide-react";
import { firestoreService } from "../../lib/firestoreService";
import { optimizeImageForFirestore, removeImageBackground } from "../../lib/imageUtils";
import { PROVINCIAS_LIST } from "../../constants/formOptions";
import { extractDominantColorsFromImage } from "../../lib/utils";

interface InstitutionalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  instituicao: any;
  onUpdate?: (updatedData: any) => void;
}

export const InstitutionalProfileModal: React.FC<InstitutionalProfileModalProps> = ({
  isOpen,
  onClose,
  instituicao,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    abreviatura: "",
    sigla: "",
    logo: "",
    email: "",
    telefone: "",
    provincia: "",
    distrito: "",
    tipoInstituicao: "",
    missao: "",
    visao: "",
    valores: "",
    primaryColor: "#050b38",
    secondaryColor: "#0d1b54",
    accentColor: "#FFB800",
    headerColor: "",
    sidebarColor: "",
    footerColor: "",
    logoPalette: [] as string[]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);

  useEffect(() => {
    if (instituicao) {
      setFormData({
        nome: instituicao.nome || "",
        abreviatura: instituicao.abreviatura || instituicao.sigla || "",
        sigla: instituicao.sigla || instituicao.abreviatura || "",
        logo: instituicao.logo || "",
        email: instituicao.email || "",
        telefone: instituicao.telefone || "",
        provincia: instituicao.provincia || "",
        distrito: instituicao.distrito || "",
        tipoInstituicao: instituicao.tipoInstituicao || "",
        missao: instituicao.missao || "",
        visao: instituicao.visao || "",
        valores: instituicao.valores || "",
        primaryColor: instituicao.primaryColor || "#050b38",
        secondaryColor: instituicao.secondaryColor || "#0d1b54",
        accentColor: instituicao.accentColor || "#FFB800",
        headerColor: instituicao.headerColor || "",
        sidebarColor: instituicao.sidebarColor || "",
        footerColor: instituicao.footerColor || "",
        logoPalette: instituicao.logoPalette || []
      });
    }
  }, [instituicao, isOpen]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingLogo(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result as string;
          
          // 1. Remover fundo do logotipo
          const cleanLogo = await removeImageBackground(result);
          
          // 2. Otimizar para Firestore
          const optimizedLogo = await optimizeImageForFirestore(cleanLogo, 300, 300, 100 * 1024);
          
          // 3. Extrair cores dominantes
          const colors = await extractDominantColorsFromImage(optimizedLogo);
          
          setFormData(prev => ({
            ...prev,
            logo: optimizedLogo,
            primaryColor: colors.primaryColor,
            secondaryColor: colors.secondaryColor,
            accentColor: colors.accentColor,
            logoPalette: colors.allColors || [],
            headerColor: colors.primaryColor,
            sidebarColor: colors.secondaryColor,
            footerColor: colors.primaryColor
          }));
          
          setIsProcessingLogo(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Erro ao processar logotipo:", err);
        setIsProcessingLogo(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        sigla: formData.abreviatura || formData.sigla, // Garantir sincronia
        updatedAt: new Date().toISOString()
      };

      if (instituicao?.id) {
        await firestoreService.instituicoes.update(instituicao.id, payload);
        
        // Notificar sistema sobre a atualização
        window.dispatchEvent(new CustomEvent("instituicao_updated", { detail: payload }));
        window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
        
        if (onUpdate) onUpdate(payload);
      }

      onClose();
    } catch (err) {
      console.error("Erro ao guardar perfil institucional:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-900 rounded-2xl">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Perfil da Instituição</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gerencie a identidade, marca e contatos oficiais</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Logo e Marca (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest w-full">Logotipo Oficial</label>
                <div className="relative group w-full aspect-square max-w-[280px] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors shadow-inner">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-6" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Camera size={48} />
                      <span className="text-[10px] font-black uppercase">Carregar Logo</span>
                    </div>
                  )}
                  {isProcessingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ou insira URL do Logotipo</label>
                  <input 
                    type="text"
                    value={formData.logo}
                    onChange={e => setFormData({...formData, logo: e.target.value})}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
                  <Palette size={14} className="text-blue-500" /> Identidade Visual
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <input 
                      type="color" 
                      value={formData.primaryColor}
                      onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                      className="w-full h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                    />
                    <span className="text-[8px] font-bold text-slate-500 uppercase text-center block">Principal</span>
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="color" 
                      value={formData.secondaryColor}
                      onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                      className="w-full h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                    />
                    <span className="text-[8px] font-bold text-slate-500 uppercase text-center block">Secundária</span>
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="color" 
                      value={formData.accentColor}
                      onChange={e => setFormData({...formData, accentColor: e.target.value})}
                      className="w-full h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                    />
                    <span className="text-[8px] font-bold text-slate-500 uppercase text-center block">Destaque</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Oficiais (Col 8) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={14} className="text-blue-500" /> Nome Completo da Instituição
                  </label>
                  <input 
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Instituto Superior Politécnico de Songo"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} className="text-blue-500" /> Sigla / Abreviatura
                  </label>
                  <input 
                    type="text"
                    value={formData.abreviatura}
                    onChange={e => setFormData({...formData, abreviatura: e.target.value, sigla: e.target.value})}
                    placeholder="Ex: ISPS"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={14} className="text-blue-500" /> Natureza / Tipo
                  </label>
                  <input 
                    type="text"
                    value={formData.tipoInstituicao}
                    onChange={e => setFormData({...formData, tipoInstituicao: e.target.value})}
                    placeholder="Ex: Ensino Superior"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={14} className="text-blue-500" /> Email Oficial
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="geral@instituicao.ac.mz"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={14} className="text-blue-500" /> Telefone / Contacto
                  </label>
                  <input 
                    type="text"
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    placeholder="+258 8X XXX XXXX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" /> Província
                  </label>
                  <select 
                    value={formData.provincia}
                    onChange={e => setFormData({...formData, provincia: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Selecione a Província...</option>
                    {PROVINCIAS_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" /> Distrito / Sede
                  </label>
                  <input 
                    type="text"
                    value={formData.distrito}
                    onChange={e => setFormData({...formData, distrito: e.target.value})}
                    placeholder="Ex: Cahora Bassa"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> Missão Institucional
                  </label>
                  <textarea 
                    value={formData.missao}
                    onChange={e => setFormData({...formData, missao: e.target.value})}
                    rows={3}
                    placeholder="Descreva a missão fundamental da sua instituição..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Target size={14} className="text-blue-500" /> Visão
                    </label>
                    <textarea 
                      value={formData.visao}
                      onChange={e => setFormData({...formData, visao: e.target.value})}
                      rows={3}
                      placeholder="Onde a instituição pretende chegar..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Shield size={14} className="text-blue-500" /> Valores
                    </label>
                    <textarea 
                      value={formData.valores}
                      onChange={e => setFormData({...formData, valores: e.target.value})}
                      rows={3}
                      placeholder="Princípios e valores fundamentais..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-200 rounded-xl transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !formData.nome.trim()}
            className="px-8 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>A Guardar...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Atualizar Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalProfileModal;
