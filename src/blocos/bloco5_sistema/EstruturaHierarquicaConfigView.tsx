import React, { useState, useEffect } from 'react';
import { Network, Save, Loader2, Users, Building, ShieldCheck } from 'lucide-react';
import { firestoreService } from '../../lib/firestoreService';
import { getOrgaosFromGestaoInstituicoes } from '../../lib/instituicaoEstruturaService';

export const EstruturaHierarquicaConfigView: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const orgaos = getOrgaosFromGestaoInstituicoes();
      setHierarchy(orgaos);
      
      // Load user links and user list (simplified for now)
      const links = await firestoreService.hierarchy_user_links.get();
      setUserLinks(links || []);
      
      const allUsers = await firestoreService.users.get();
      setUsers(allUsers || []);
      
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLinkUser = async (userId: string, nodePath: string) => {
    setSaving(true);
    const linkId = `link_${userId}_${Date.now()}`;
    await firestoreService.hierarchy_user_links.set(linkId, {
      userId,
      nodePath,
      updatedAt: new Date().toISOString()
    });
    setUserLinks(prev => [...prev.filter(l => l.userId !== userId), { userId, nodePath }]);
    setSaving(false);
  };

  if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Network className="text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Configuração da Estrutura Hierárquica</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Árvore de Reporte</h3>
          {/* Visual representation of hierarchy */}
          {hierarchy.map((org: any) => (
            <div key={org.nome} className="ml-2 mb-4 border-l border-white/10 pl-4">
              <div className="font-bold text-blue-400">{org.nome}</div>
              {org.direcoes.map((dir: any) => (
                <div key={dir.nome} className="ml-4 text-white/80">
                  <div className="font-semibold">{dir.nome}</div>
                  {dir.departamentos.map((dept: any) => (
                    <div key={dept.nome} className="ml-4 text-white/60">
                      {dept.nome}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Vincular Utilizadores</h3>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                <span className="text-white">{user.name || user.email}</span>
                <select 
                  className="bg-slate-800 text-white p-1 rounded"
                  onChange={(e) => handleLinkUser(user.id, e.target.value)}
                  value={userLinks.find(l => l.userId === user.id)?.nodePath || ''}
                >
                  <option value="">Sem vínculo</option>
                  {hierarchy.flatMap(o => o.direcoes.flatMap(d => d.departamentos.map(dep => `${o.nome}/${d.nome}/${dep.nome}`))).map(path => (
                    <option key={path} value={path}>{path}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
