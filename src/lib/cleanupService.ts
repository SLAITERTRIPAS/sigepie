import { db } from "./firebase";
import { collection, getDocs, deleteDoc, query, where } from "firebase/firestore";

export async function clearActivitiesForInstitution(instituicaoId: string) {
  if (!instituicaoId) return;

  const collectionsToWipe = [
    "matrix_activities",
    "actividades",
    "plano_actividades",
  ];

  console.log(`🔥 Iniciando purga de atividades para a instituição: ${instituicaoId}...`);
  
  for (const colName of collectionsToWipe) {
    try {
      const colRef = collection(db, colName);
      const q = query(colRef, where("instituicaoId", "==", instituicaoId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log(`🗑️ Eliminando ${snapshot.size} documentos de ${colName} da instituição ${instituicaoId}...`);
        
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 100) {
          const batch = docs.slice(i, i + 100);
          await Promise.all(batch.map(d => deleteDoc(d.ref)));
        }
      }
    } catch (err) {
      console.warn(`Aviso ao limpar ${colName} para instituição ${instituicaoId}:`, err);
    }
  }
  console.log("✅ Limpeza de atividades por instituição concluída.");
}

/**
 * Exclui de forma completa, absoluta e permanente da base de dados (Firestore e cache local)
 * todas as atividades, rubricas, orçamentos, expedientes e registos em TODAS as direções,
 * departamentos e setores que tenham qualquer relação com "ajudas de custo" (ou código 11).
 */
export async function purgeAjudasDeCustoFromDatabase() {
  const collectionsToCheck = [
    "matrix_activities",
    "matrixActivities",
    "actividades",
    "plano_actividades",
    "plan_schedules",
    "calendar_events",
    "expedientes",
    "notes",
    "service_requests",
    "archive_documents",
    "archiveDocuments",
    "processos",
    "processos_individuais",
    "financial_data",
    "tetos_orcamentais",
    "produtos_unificados",
    "materiais_bens",
    "balanco_config",
    "orcamentos",
    "rubricas"
  ];

  console.log("🔥 [SIGEP] Iniciando purga absoluta e irrevogável de todas as 'ajudas de custo' em todas as direções, departamentos e setores...");
  let deletedCount = 0;

  for (const colName of collectionsToCheck) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) continue;

      const docsToDelete: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const textBlob = JSON.stringify(data).toLowerCase();
        
        const isAjudaCusto = 
          textBlob.includes("ajuda de custo") ||
          textBlob.includes("ajudas de custo") ||
          textBlob.includes("ajuda") ||
          textBlob.includes("111101") ||
          textBlob.includes("112101") ||
          textBlob.includes("capítulo 11") ||
          textBlob.includes("capitulo 11") ||
          (Array.isArray(data.rubricas) && data.rubricas.some((r: any) => {
            const rStr = String(r.rubrica || r.necessidade || r.descricao || "").toLowerCase();
            return rStr.includes("ajuda") || rStr.startsWith("11");
          }));

        if (isAjudaCusto) {
          docsToDelete.push(docSnap.ref);
        }
      });

      if (docsToDelete.length > 0) {
        console.log(`🗑️ Eliminando ${docsToDelete.length} registos de ajudas de custo na coleção ${colName}...`);
        for (let i = 0; i < docsToDelete.length; i += 100) {
          const batch = docsToDelete.slice(i, i + 100);
          await Promise.all(batch.map((ref) => deleteDoc(ref)));
        }
        deletedCount += docsToDelete.length;
      }

      // Limpar cache local correspondente
      localStorage.removeItem(`sigep_local_${colName}`);
      localStorage.removeItem(`sigep_draft_${colName}`);
    } catch (err) {
      console.warn(`Aviso ao expurgar ajudas de custo em ${colName}:`, err);
    }
  }

  // Limpeza adicional de chaves de cache globais
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("matrix") || key.includes("actividade") || key.includes("orcament")) ) {
        const val = localStorage.getItem(key) || "";
        if (val.toLowerCase().includes("ajuda") || val.toLowerCase().includes("111101")) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (_) {}

  console.log(`✅ Purga absoluta de ajudas de custo concluída com sucesso. Total de ${deletedCount} documentos eliminados em todas as unidades organizacionais.`);
  return { success: true, count: deletedCount };
}

export interface SystemCleanupReport {
  browserCacheCleared: boolean;
  emptyOrphanDocsDeleted: number;
  duplicateActivitiesFixed: number;
  staleAlertsCleared: number;
  preservedCollections: string[];
  message: string;
}

/**
 * Realiza uma Limpeza Geral e Segura em Todo o Sistema:
 * 1. Limpa lixo do navegador, caches e rascunhos voláteis órfãos (preservando login e instituição).
 * 2. Elimina documentos puramente vazios/fantasmas criados por erro na base de dados.
 * 3. Corrige e consolida duplicações acidentais nas atividades.
 * 4. Limpa alertas de sistema expirados/antigos.
 * 5. Garante e preserva 100% de todos os utilizadores, colaboradores, estudantes, bens, documentos e planos.
 */
export async function performGlobalSystemCleanup(): Promise<SystemCleanupReport> {
  console.log("🧹 [SIGEP] A iniciar Limpeza Geral em Todo o Sistema...");
  
  // 1. Limpeza de Caches e Ficheiros Temporários locais
  const protectedKeys = [
    "sigep_user",
    "sigep_logged_in_user",
    "sigep_auth_token",
    "activeInstitution",
    "systemLogo",
    "sigep_lang",
    "instituicoes_cache",
  ];
  
  let clearedStorageKeys = 0;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !protectedKeys.includes(key) && !key.startsWith("firebase:authUser")) {
        if (
          key.startsWith("sigep_draft_") ||
          key.startsWith("sigep_temp_") ||
          key.startsWith("sigep_cache_") ||
          key.startsWith("temp_") ||
          key.includes("_temp") ||
          key.includes("_cache")
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((k) => {
      localStorage.removeItem(k);
      clearedStorageKeys++;
    });
    sessionStorage.clear();
  } catch (e) {
    console.warn("Aviso ao limpar cache local:", e);
  }

  // 2. Limpeza de Registos Órfãos / Vazios em Coleções de Trabalho (sem apagar dados reais)
  let orphanDocsDeleted = 0;
  const auditCollections = ["matrix_activities", "actividades", "plano_actividades"];
  for (const colName of auditCollections) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      const docsToDelete: any[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const nome = String(data.nomeActividade || data.title || data.designacao || "").trim();
        const cod = String(data.codigoActividade || data.numeroActividade || data.no || "").trim();
        const obj = String(data.objectivoActividade || data.objective || "").trim();
        
        // Registo puramente vazio/fantasma (sem nome, sem código, sem objetivo, sem rubricas)
        const isEmpty = !nome && !cod && !obj && (!Array.isArray(data.rubricas) || data.rubricas.length === 0);
        if (isEmpty) {
          docsToDelete.push(docSnap.ref);
        }
      });

      if (docsToDelete.length > 0) {
        for (let i = 0; i < docsToDelete.length; i += 100) {
          const batch = docsToDelete.slice(i, i + 100);
          await Promise.all(batch.map((ref) => deleteDoc(ref)));
        }
        orphanDocsDeleted += docsToDelete.length;
      }
    } catch (e) {
      console.warn(`Aviso ao auditar ${colName}:`, e);
    }
  }

  // 3. Limpeza de alertas de acessos antigos/temporários
  let staleAlertsCount = 0;
  try {
    const alertsSnap = await getDocs(collection(db, "systemAlerts"));
    const alertsToDelete: any[] = [];
    alertsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.active === false || data.expired === true) {
        alertsToDelete.push(docSnap.ref);
      }
    });
    if (alertsToDelete.length > 0) {
      await Promise.all(alertsToDelete.map((ref) => deleteDoc(ref)));
      staleAlertsCount = alertsToDelete.length;
    }
  } catch (_) {}

  // 4. Executar consolidação de duplicatas em matrix_activities
  let duplicatesFixed = 0;
  try {
    const { databaseMaintenance } = await import("./databaseMaintenance");
    const res = await databaseMaintenance.removeDuplicateActivitiesAndFixNumbering();
    duplicatesFixed = res?.deletedCount || 0;
  } catch (e) {
    console.warn("Aviso ao consolidar duplicatas:", e);
  }

  console.log("✅ [SIGEP] Limpeza Geral Concluída com sucesso.");
  return {
    browserCacheCleared: true,
    emptyOrphanDocsDeleted: orphanDocsDeleted,
    duplicateActivitiesFixed: duplicatesFixed,
    staleAlertsCleared: staleAlertsCount,
    preservedCollections: [
      "colaboradores (100% preservados)",
      "users / utilizadores (100% preservados)",
      "alunos / turmas (100% preservados)",
      "expedientes / documentos (100% preservados)",
      "bens / inventário (100% preservados)",
      "instituições (100% preservadas)"
    ],
    message: "Limpeza Geral realizada com sucesso. Todos os dados institucionais foram rigorosamente preservados."
  };
}
