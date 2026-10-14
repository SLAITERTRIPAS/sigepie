
import React, { useState, useEffect } from "react";
import { firestoreService } from "../../lib/firestoreService";
import { baseMenuItems } from "../../constants/menuHierarchy";
import { Save, CheckCircle2 } from "lucide-react";

export default function MenuAccessManager({ institutionId }: { institutionId: string }) {
  const [disabledMenus, setDisabledMenus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadConfig = async () => {
      const config = await firestoreService.sector_menu_configs.getById(institutionId);
      if (config) {
        setDisabledMenus(config.disabledMenus || []);
      }
    };
    loadConfig();
  }, [institutionId]);

  const toggleMenu = (menuTitle: string) => {
    setDisabledMenus(prev => 
      prev.includes(menuTitle) ? prev.filter(t => t !== menuTitle) : [...prev, menuTitle]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await firestoreService.sector_menu_configs.set(institutionId, {
        disabledMenus,
        institutionId
      });
      setMessage("Configurações salvas com sucesso!");
    } catch (e) {
      setMessage("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Gestão de Menus para Instituição: {institutionId}</h2>
      {message && <div className="mb-4 p-2 bg-blue-900 rounded flex items-center gap-2"><CheckCircle2 /> {message}</div>}
      <div className="grid grid-cols-2 gap-4">
        {baseMenuItems.map((item: any) => (
          <div key={item.title} className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={!disabledMenus.includes(item.title)} 
              onChange={() => toggleMenu(item.title)}
            />
            <label>{item.title}</label>
          </div>
        ))}
      </div>
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="mt-6 px-4 py-2 bg-blue-600 rounded text-white flex items-center gap-2"
      >
        <Save /> Salvar Configurações
      </button>
    </div>
  );
}
