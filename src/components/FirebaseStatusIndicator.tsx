import React, { useState, useEffect, useCallback } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "../lib/firebase";

export const FirebaseStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<"online" | "offline" | "syncing">(() => 
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "online"
  );

  const checkFirebaseConnection = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
      return;
    }

    try {
      if (!db) {
        setStatus("offline");
        return;
      }
      // Pinging Firestore server directly with getDocFromServer
      await getDocFromServer(doc(db, "_system_status", "ping"));
      setStatus("online");
    } catch (error: any) {
      const msg = error?.message || "";
      const code = error?.code || "";
      if (
        msg.includes("client is offline") ||
        msg.includes("Failed to get document because the client is offline") ||
        code === "unavailable" ||
        code === "failed-precondition"
      ) {
        setStatus("offline");
      } else {
        // Any other response (such as permission-denied or doc not found) proves the server was contacted successfully
        setStatus("online");
      }
    }
  }, []);

  useEffect(() => {
    // Initial verification
    checkFirebaseConnection();

    const handleOnline = () => {
      checkFirebaseConnection();
    };

    const handleOffline = () => {
      setStatus("offline");
    };

    const handleSyncStart = () => {
      setStatus("syncing");
    };

    const handleSyncEnd = () => {
      checkFirebaseConnection();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("firestore-sync-start", handleSyncStart);
    window.addEventListener("firestore-sync-end", handleSyncEnd);

    // Periodic heartbeat verification every 30 seconds
    const interval = setInterval(checkFirebaseConnection, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("firestore-sync-start", handleSyncStart);
      window.removeEventListener("firestore-sync-end", handleSyncEnd);
      clearInterval(interval);
    };
  }, [checkFirebaseConnection]);

  const isOnline = status === "online";
  const isSyncing = status === "syncing";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all duration-300 border select-none ${
        isOnline
          ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
          : isSyncing
          ? "bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
          : "bg-rose-950/60 border-rose-500/50 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.25)]"
      }`}
      title={
        isOnline
          ? "Firebase Firestore: Conexão ativa em tempo real (Online)"
          : isSyncing
          ? "Firebase Firestore: Sincronizando dados com a nuvem..."
          : "Firebase Firestore: Desconectado / Modo Offline"
      }
    >
      <span className="relative flex h-2 w-2">
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
          </>
        ) : isSyncing ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]"></span>
          </>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]"></span>
          </>
        )}
      </span>
      <span>{isOnline ? "Online" : isSyncing ? "Sync" : "Offline"}</span>
    </div>
  );
};

export default FirebaseStatusIndicator;
