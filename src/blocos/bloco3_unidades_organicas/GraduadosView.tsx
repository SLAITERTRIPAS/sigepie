import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import RegistarGraduadoForm from "../bloco8_gerais/RegistarGraduadoForm";
import { firestoreService } from "../../lib/firestoreService";

interface Graduado {
  id: string;
  nome: string;
  genero: string;
  idade: number | string;
  anoIngresso: number | string;
  anoGraduacao: number | string;
  mediaFinal: number | string;
  tituloTfc?: string;
  tfc?: string;
}

export default function GraduadosView() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [graduados, setGraduados] = useState<Graduado[]>([]);

  useEffect(() => {
    const unsub = firestoreService.graduados.subscribe((data: any[]) => {
      setGraduados(data || []);
    });
    return () => unsub();
  }, []);

  const handleFormSubmit = async (formData: any) => {
    try {
      await firestoreService.graduados.add({
        ...formData,
        createdAt: new Date().toISOString(),
      });
      setShowForm(false);
    } catch (err) {
      console.error("Erro ao registar graduado:", err);
      alert("Erro ao registar graduado no Firebase.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem a certeza que deseja eliminar este graduado?")) {
      try {
        await firestoreService.graduados.delete(id);
      } catch (err) {
        console.error("Erro ao eliminar graduado:", err);
      }
    }
  };

  if (showForm) {
    return (
      <RegistarGraduadoForm
        onCancel={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
      />
    );
  }

  const filteredGraduados = graduados.filter((g) => {
    const nomeMatch = g.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const tfcText = g.tituloTfc || g.tfc || "";
    const tfcMatch = tfcText.toLowerCase().includes(searchTerm.toLowerCase());
    return nomeMatch || tfcMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <GraduationCap size={28} />
            Lista de Graduados
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie o registo individual de todos os graduados do curso.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
          Registar Novo Graduado
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar por nome ou TFC..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs tracking-widest font-bold">
              <tr>
                <th className="p-4 border-b border-gray-100">Graduado</th>
                <th className="p-4 border-b border-gray-100">Género</th>
                <th className="p-4 border-b border-gray-100">Idade</th>
                <th className="p-4 border-b border-gray-100">
                  Ingresso/Graduação
                </th>
                <th className="p-4 border-b border-gray-100">Média</th>
                <th className="p-4 border-b border-gray-100">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {filteredGraduados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                    Nenhum graduado encontrado no sistema.
                  </td>
                </tr>
              ) : (
                filteredGraduados.map((g) => {
                  const tfcText = g.tituloTfc || g.tfc || "Sem Trabalho de Fim de Curso";
                  const mediaVal = typeof g.mediaFinal === "number" ? g.mediaFinal : parseFloat(g.mediaFinal || "0");
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                            {g.nome?.charAt(0) || "G"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{g.nome}</p>
                            <p
                              className="text-xs text-gray-400 truncate max-w-[200px]"
                              title={tfcText}
                            >
                              {tfcText}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            g.genero === "Mulher" || g.genero === "Feminino"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {g.genero}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        {g.idade} anos
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            Ingresso: {g.anoIngresso}
                          </span>
                          <span className="text-xs font-medium">
                            Graduação: {g.anoGraduacao}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <span className="font-bold text-gray-900">
                          {mediaVal.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
