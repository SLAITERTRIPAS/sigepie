/**
 * SIGEP - Firebase Cloud Function para Automação UGEA
 * Escuta a atualização de Planos Institucionais para o estado "aprovado",
 * processa os itens de aquisição e transfere-os para a coleção centralizada 'UGEA_Data'
 * com metadados de rastreabilidade e prevenção de duplicidade.
 */

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.processApprovedInstitutionalPlan = onDocumentUpdated(
  "institutional_plans/{planId}",
  async (event) => {
    const change = event.data;
    if (!change) {
      return null;
    }

    const beforeData = change.before.data();
    const afterData = change.after.data();
    const planId = event.params.planId;

    const previousStatus = beforeData.status || beforeData.estado;
    const newStatus = afterData.status || afterData.estado;

    // Verificar se o estado mudou para "aprovado"
    const isNowApproved = 
      (newStatus === "aprovado" || newStatus === "Aprovado") &&
      previousStatus !== "aprovado" &&
      previousStatus !== "Aprovado";

    if (!isNowApproved) {
      return null;
    }

    console.log(`[SIGEP UGEA Automation] Plano Institucional ${planId} foi aprovado. Iniciando processamento...`);

    // Verificar se já foi processado (flag processed ou duplicidade na coleção UGEA_Data)
    const existingUgeaQuery = await db.collection("UGEA_Data")
      .where("originPlanId", "==", planId)
      .get();

    if (!existingUgeaQuery.empty || afterData.ugeaProcessed === true) {
      console.log(`[SIGEP UGEA Automation] O plano ${planId} já foi processado anteriormente na UGEA.`);
      return null;
    }

    const items = afterData.activities || afterData.items || [];
    
    // Filtrar apenas itens elegíveis de aquisição (bens, materiais, serviços ou com custo)
    const acquisitionItems = items.filter((item) => {
      const text = JSON.stringify(item).toLowerCase();
      return (
        text.includes("aquisição") ||
        text.includes("aquisicao") ||
        text.includes("bens") ||
        text.includes("material") ||
        text.includes("serviço") ||
        text.includes("servico") ||
        (item.cost && item.cost > 0) ||
        (item.custo && item.custo > 0)
      );
    });

    if (acquisitionItems.length === 0 && items.length > 0) {
      // Se não houver itens específicos filtrados, considera todos os itens do plano aprovado
      acquisitionItems.push(...items);
    }

    const batch = db.batch();
    const timestamp = FieldValue.serverTimestamp();

    for (const item of acquisitionItems) {
      const ugeaRef = db.collection("UGEA_Data").doc();
      batch.set(ugeaRef, {
        ...item,
        originPlanId: planId,
        originPlanTitle: afterData.title || afterData.name || `Plano Institucional ${planId}`,
        department: afterData.department || afterData.setor || "Geral",
        processed: true,
        processedAt: timestamp,
        createdAt: timestamp,
        status: "pendente_contratacao"
      });
    }

    // Marcar o plano institucional como processado para evitar reprocessamentos
    const planRef = db.collection("institutional_plans").doc(planId);
    batch.update(planRef, {
      ugeaProcessed: true,
      ugeaProcessedAt: timestamp
    });

    await batch.commit();
    console.log(`[SIGEP UGEA Automation] Sucesso! ${acquisitionItems.length} itens transferidos para UGEA_Data para o plano ${planId}.`);

    return { success: true, processedCount: acquisitionItems.length };
  }
);
