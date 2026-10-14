import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Package, 
  Building, 
  GraduationCap, 
  Users, 
  Box, 
  FileText, 
  Briefcase,
  MapPin,
  BookOpen,
  Calendar,
  X,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import { firestoreService } from "../../lib/firestoreService";
import { countInstitutionalAdmins } from "../../lib/auth";

interface RegistrationOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  formType: string;
}

const REGISTRATION_OPTIONS: RegistrationOption[] = [
  {
    id: "admin_instituicao",
    title: "Administrador da Instituição",
    description: "Registar o administrador responsável pela gestão do organograma da instituição.",
    icon: ShieldCheck,
    color: "bg-red-600",
    formType: "admin_instituicao"
  },
  {
    id: "user",
    title: "Utilizador / Colaborador",
    description: "Registar novo funcionário ou conta de acesso ao sistema.",
    icon: UserPlus,
    color: "bg-blue-600",
    formType: "user"
  },
  {
    id: "graduado",
    title: "Graduado",
    description: "Registar novo graduado e seu trabalho de fim de curso.",
    icon: GraduationCap,
    color: "bg-emerald-600",
    formType: "graduado"
  },
  {
    id: "material",
    title: "Material / Património",
    description: "Registar bens móveis, imóveis ou materiais de consumo.",
    icon: Box,
    color: "bg-amber-600",
    formType: "material"
  },
  {
    id: "espaco",
    title: "Espaço Físico",
    description: "Registar salas, laboratórios ou outros recintos.",
    icon: MapPin,
    color: "bg-purple-600",
    formType: "espaco"
  },
  {
    id: "disciplina",
    title: "Disciplina Académica",
    description: "Registar nova cadeira ou disciplina curricular.",
    icon: BookOpen,
    color: "bg-indigo-600",
    formType: "disciplina"
  },
  {
    id: "efetivo",
    title: "Efetivo Escolar",
    description: "Registar dados estatísticos de estudantes por curso.",
    icon: Users,
    color: "bg-rose-600",
    formType: "efetivo"
  },
  {
    id: "produto",
    title: "Produto / Preço",
    description: "Registar novo item no catálogo de produtos e preços.",
    icon: Package,
    color: "bg-cyan-600",
    formType: "produto"
  },
  {
    id: "fornecedor",
    title: "Fornecedor",
    description: "Registar nova entidade fornecedora de bens ou serviços.",
    icon: Building,
    color: "bg-slate-600",
    formType: "fornecedor"
  }
];

export default function UniversalRegistrationPicker({
  onSelect,
  onClose,
  contextHint,
  currentUser,
  instituicaoId
}: {
  onSelect: (formType: string) => void;
  onClose?: () => void;
  contextHint?: string;
  currentUser?: any;
  instituicaoId?: string;
}) {
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    const unsubUsers = firestoreService.users.subscribe((data) => {
      setUsersList(data || []);
    });
    return () => unsubUsers();
  }, []);

  const targetInstId = currentUser?.instituicaoId || instituicaoId;
  const adminCount = countInstitutionalAdmins(usersList, targetInstId);
  const isMaxAdminsReached = adminCount >= 2;

  // Sort options to put contextHint at the top if provided
  const sortedOptions = [...REGISTRATION_OPTIONS].sort((a, b) => {
    if (contextHint && a.id === contextHint) return -1;
    if (contextHint && b.id === contextHint) return 1;
    return 0;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto scrollbar">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-blue-900 tracking-tight">
            Centro de Registos
          </h2>
          <p className="text-gray-500 font-medium">
            Selecione o tipo de formulário que deseja preencher agora.
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOptions.map((opt) => {
          const isOptionDisabled = opt.id === "admin_instituicao" && isMaxAdminsReached;

          return (
            <motion.button
              key={opt.id}
              whileHover={isOptionDisabled ? {} : { y: -4, scale: 1.02 }}
              whileTap={isOptionDisabled ? {} : { scale: 0.98 }}
              onClick={() => {
                if (isOptionDisabled) {
                  alert("Esta instituição já possui o número máximo de 2 administradores da instituição registados.");
                  return;
                }
                onSelect(opt.formType);
              }}
              className={`flex flex-col text-left p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${
                isOptionDisabled ? "opacity-60 grayscale-[15%] cursor-not-allowed bg-slate-50/50 hover:shadow-none" : ""
              } ${
                contextHint === opt.id && !isOptionDisabled ? "ring-2 ring-blue-600 border-transparent bg-blue-50/30" : ""
              }`}
            >
              {isOptionDisabled ? (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase">
                  Limite Atingido (2/2)
                </div>
              ) : contextHint === opt.id ? (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase">
                  Recomendado
                </div>
              ) : null}
              <div className={`${isOptionDisabled ? "bg-slate-400" : opt.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <opt.icon size={28} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">
                {opt.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {isOptionDisabled
                  ? "O limite de 2 administradores da instituição já foi atingido. Não é possível registar novos administradores."
                  : opt.description}
              </p>
              <div className="mt-6 flex items-center gap-2 text-blue-600 text-[10px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{isOptionDisabled ? "Campo Inacessível" : "Abrir Formulário"}</span>
                {!isOptionDisabled && <ArrowRight size={14} className="animate-pulse" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-12 bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl font-black mb-4 tracking-tight">
              Precisa de ajuda com os formulários?
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Todos os registos são sincronizados em tempo real com a base de dados central do SIGEP. Certifique-se de ter os documentos necessários antes de iniciar o preenchimento.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-blue-400">12+</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Módulos</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400">100%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Seguro</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </div>
    </div>
  );
}
