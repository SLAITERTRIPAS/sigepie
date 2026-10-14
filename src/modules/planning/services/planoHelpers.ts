import React from "react";
import {
  getDirectionAbbreviation,
  getDepartmentAbbreviation,
  getActivityInitials,
  cn,
} from "../../../lib/utils";
import { getRoles, isSuperBossUser } from "../../../lib/auth";

export const getDirectionPriority = (dir: string): number => {
  const d = String(dir || "").toUpperCase();
  if (
    d.includes("GABINETE DO DIRETOR-GERAL") ||
    d.includes("GABINETE DO DIRETOR GERAL") ||
    d.includes("GABINETE") ||
    d.includes("DIRETOR-GERAL") ||
    d.includes("DIRETOR GERAL")
  )
    return 1;
  if (
    d.includes("ENGENHARIA") ||
    d.includes("DIVISÃO DE ENGENHARIA") ||
    d.includes("DIVISAO DE ENGENHARIA")
  )
    return 2;
  if (
    d.includes("INCUBAÇÃO") ||
    d.includes("INCUBACAO") ||
    d.includes("CENTRO DE INCUBAÇÃO") ||
    d.includes("CENTRO DE INCUBACAO") ||
    d.includes("CIE")
  )
    return 3;
  if (
    d.includes("DICOSAFA") ||
    d.includes("ADMINISTRAÇÃO") ||
    d.includes("ADMINISTRACAO")
  )
    return 4;
  if (
    d.includes("DICOSSER") ||
    d.includes("ACADÉMICOS") ||
    d.includes("ACADEMICOS")
  )
    return 5;
  return 100;
};

export const compareDirections = (a: string, b: string): number => {
  const prioA = getDirectionPriority(a);
  const prioB = getDirectionPriority(b);
  if (prioA !== prioB) return prioA - prioB;
  return String(a || "").localeCompare(String(b || ""));
};

export function getActMonthIndex(act: any): number {
  if (!act) return 13;
  const monthOrder: Record<string, number> = {
    Janeiro: 1,
    Fevereiro: 2,
    Março: 3,
    Abril: 4,
    Maio: 5,
    Junho: 6,
    Julho: 7,
    Agosto: 8,
    Setembro: 9,
    Outubro: 10,
    Novembro: 11,
    Dezembro: 12,
  };
  const months = Array.isArray(act.mesesRealizacao)
    ? act.mesesRealizacao
    : [act.mesRealizacao || act.mes].filter(Boolean);
  if (months.length > 0) {
    const indices = months
      .map((m: string) => monthOrder[m] || 13)
      .sort((a: number, b: number) => a - b);
    if (indices[0] <= 12) return indices[0];
  }
  const trimestres = Array.isArray(act.trimestres)
    ? act.trimestres
    : [act.trimestre].filter(Boolean);
  if (trimestres.includes("I") || trimestres.includes("1º Trimestre"))
    return 1;
  if (trimestres.includes("II") || trimestres.includes("2º Trimestre"))
    return 4;
  if (trimestres.includes("III") || trimestres.includes("3º Trimestre"))
    return 7;
  if (trimestres.includes("IV") || trimestres.includes("4º Trimestre"))
    return 10;
  return 13;
}

export const compareActivitiesNumericOrder = (a: any, b: any): number => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const monthA = getActMonthIndex(a);
  const monthB = getActMonthIndex(b);
  if (monthA !== monthB) {
    return monthA - monthB;
  }

  const getNumericSeq = (x: any): number => {
    const directVals = [x.no, x.numeroActividade, x.nActividade, x.ordem, x.numeroDirecao];
    for (const v of directVals) {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        const parsed = parseInt(String(v).replace(/[^\d]/g, ""), 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }

    const ref = String(x.codigoActividade || x.referencia || "");
    const matchSlash = ref.match(/\/(\d+)(\/|$)/);
    if (matchSlash) {
      const parsed = parseInt(matchSlash[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const matchN = ref.match(/N(\d+)/i);
    if (matchN) {
      const parsed = parseInt(matchN[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const matchEnd = ref.match(/(\d+)$/);
    if (matchEnd) {
      const parsed = parseInt(matchEnd[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    return 999999;
  };

  const numA = getNumericSeq(a);
  const numB = getNumericSeq(b);

  if (numA !== numB) {
    return numA - numB;
  }

  const strNoA = String(a.no ?? a.numeroActividade ?? a.nActividade ?? a.numeroDirecao ?? "");
  const strNoB = String(b.no ?? b.numeroActividade ?? b.nActividade ?? b.numeroDirecao ?? "");
  if (strNoA && strNoB && strNoA !== strNoB) {
    const compNo = strNoA.localeCompare(strNoB, undefined, { numeric: true });
    if (compNo !== 0) return compNo;
  }

  const dateA = new Date(a.createdAt || a.dataEnvio || 0).getTime();
  const dateB = new Date(b.createdAt || b.dataEnvio || 0).getTime();
  if (dateA !== dateB) return dateA - dateB;

  return String(a.titulo || a.nomeActividade || "").localeCompare(
    String(b.titulo || b.nomeActividade || "")
  );
};
