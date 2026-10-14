import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { firestoreService } from "../lib/firestoreService";
import { Colaborador } from "../types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const DashboardRH: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  useEffect(() => {
    const unsub = firestoreService.colaboradores.subscribe((data: Colaborador[]) => {
      setColaboradores(data);
    });
    return unsub;
  }, []);

  // Agregação de dados
  const cargosData = colaboradores.reduce((acc, colab) => {
    const cargo = colab.cargo || "Não definido";
    acc[cargo] = (acc[cargo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cargosChartData = Object.entries(cargosData).map(([name, value]) => ({
    name,
    value,
  }));

  const academicLevelData = colaboradores.reduce((acc, colab) => {
    const nivel = colab.nivelAcademico || "Não definido";
    acc[nivel] = (acc[nivel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const academicChartData = Object.entries(academicLevelData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Indicadores Estratégicos de Gestão de Pessoal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Distribuição por Cargo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cargosChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {cargosChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Distribuição por Nível Académico</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={academicChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Colaboradores" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardRH;
