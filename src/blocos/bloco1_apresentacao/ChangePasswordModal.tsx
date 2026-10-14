import React, { useState } from "react";
import { X, Key, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Globe } from "lucide-react";
import { firestoreService } from "../../lib/firestoreService";
import { safeJSONStringify } from "../../lib/utils";
import { setLanguagePreference, getCurrentLanguage, Language } from "../../lib/i18n";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ChangePasswordModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => user?.idioma || getCurrentLanguage());
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Guardar preferência de idioma imediatamente
    setLanguagePreference(selectedLanguage);
    if (user) {
      user.idioma = selectedLanguage;
      try {
        localStorage.setItem("sigep_logged_in_user", safeJSONStringify(user));
        if (user.id) {
          await setDoc(doc(db, "users", user.id), { idioma: selectedLanguage }, { merge: true });
        }
      } catch (err) {}
    }

    if (!currentPassword && !newPassword) {
      setSuccess("Preferência de idioma atualizada com sucesso!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
      return;
    }

    const enteredCurrent = currentPassword.trim();
    if (!enteredCurrent) {
      setError("É obrigatório introduzir a sua palavra-passe atual para alterar a senha.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 4) {
      setError("A nova palavra-passe deve ter pelo menos 4 caracteres.");
      return;
    }

    if (newPassword === enteredCurrent) {
      setError("A nova palavra-passe deve ser diferente da palavra-passe atual.");
      return;
    }

    setLoading(true);
    try {
      // 1. Validar obrigatoriamente a senha atual antes de alterar
      let registeredPassword = String(user?.password || "").trim();
      let registeredPasswordHash = user?.passwordHash || "";

      if (user?.id) {
        try {
          const userDocSnap = await getDoc(doc(db, "users", user.id));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data?.password) registeredPassword = String(data.password).trim();
            if (data?.passwordHash) registeredPasswordHash = data.passwordHash;
          }
        } catch (e) {
          console.warn("Aviso ao buscar senha no Firestore:", e);
        }
      }

      if (!registeredPassword && (user?.email || user?.nuit)) {
        try {
          const usersRef = collection(db, "users");
          if (user?.email) {
            const qEmail = query(
              usersRef,
              where("email", "==", String(user.email).toLowerCase().trim())
            );
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
              const data = snapEmail.docs[0].data();
              if (data?.password) registeredPassword = String(data.password).trim();
              if (data?.passwordHash) registeredPasswordHash = data.passwordHash;
            }
          }
          if (!registeredPassword && user?.nuit) {
            const qNuit = query(usersRef, where("nuit", "==", String(user.nuit).trim()));
            const snapNuit = await getDocs(qNuit);
            if (!snapNuit.empty) {
              const data = snapNuit.docs[0].data();
              if (data?.password) registeredPassword = String(data.password).trim();
              if (data?.passwordHash) registeredPasswordHash = data.passwordHash;
            }
          }
        } catch (e) {
          console.warn("Aviso ao buscar senha por identificadores:", e);
        }
      }

      if (!registeredPassword) {
        try {
          const storedUser = localStorage.getItem("sigep_logged_in_user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed?.password) registeredPassword = String(parsed.password).trim();
            if (parsed?.passwordHash) registeredPasswordHash = parsed.passwordHash;
          }
        } catch (e) {
          console.warn("Aviso ao ler local storage:", e);
        }
      }

      const enteredCurrentHash = firestoreService.hashPassword(enteredCurrent);

      let isCurrentValid = false;
      if (registeredPassword && enteredCurrent === registeredPassword) {
        isCurrentValid = true;
      } else if (registeredPassword && enteredCurrentHash === registeredPassword) {
        isCurrentValid = true;
      } else if (registeredPasswordHash && enteredCurrentHash === registeredPasswordHash) {
        isCurrentValid = true;
      } else if (
        (!registeredPassword || ["1234", "123456", "admin"].includes(registeredPassword)) &&
        !user?.senhaPadraoBloqueada &&
        (enteredCurrent === "1234" || enteredCurrent === "123456" || enteredCurrent === "admin")
      ) {
        isCurrentValid = true;
      }

      if (!isCurrentValid) {
        setError("A palavra-passe atual está incorreta. Verifique e tente novamente.");
        setLoading(false);
        return;
      }

      if (user?.id) {
        const usersRef = collection(db, "users");
        const uniqueDocIds = new Set<string>();
        uniqueDocIds.add(user.id);

        if (user.email) {
          try {
            const qEmail = query(
              usersRef,
              where("email", "==", String(user.email).toLowerCase().trim()),
            );
            const snapEmail = await getDocs(qEmail);
            snapEmail.forEach((docSnap) => uniqueDocIds.add(docSnap.id));
          } catch (e) {
            console.warn("Erro ao buscar docs por email:", e);
          }
        }

        if (user.nuit) {
          try {
            const qNuit = query(
              usersRef,
              where("nuit", "==", String(user.nuit).trim()),
            );
            const snapNuit = await getDocs(qNuit);
            snapNuit.forEach((docSnap) => uniqueDocIds.add(docSnap.id));

            const numericNuit = Number(user.nuit);
            if (!isNaN(numericNuit)) {
              const qNuitNum = query(
                usersRef,
                where("nuit", "==", numericNuit),
              );
              const snapNuitNum = await getDocs(qNuitNum);
              snapNuitNum.forEach((docSnap) => uniqueDocIds.add(docSnap.id));
            }
          } catch (e) {
            console.warn("Erro ao buscar docs por nuit:", e);
          }
        }

        // Aplicar o fluxo de atualização de palavra-passe e criação de nova sessão
        const passwordHash = firestoreService.hashPassword(newPassword);
        user.passwordHash = passwordHash;
        user.passwordExpired = false;
        user.mustChangePassword = false;
        user.isFirstAccess = false;
        user.senhaPadraoBloqueada = true;

        console.log(`[Diagnostic] Alterando senha para ${uniqueDocIds.size} documentos em 'users'.`);
        // Atualizar todos os documentos identificados em paralelo na coleção 'users'
        await Promise.all(
          Array.from(uniqueDocIds).map((docId) => {
            console.log(`[Diagnostic] Atualizando doc ${docId}: mustChangePassword: false`);
            return updateDoc(doc(db, "users", docId), {
              password: newPassword,
              passwordHash: passwordHash,
              passwordExpired: false,
              mustChangePassword: false,
              isFirstAccess: false,
              senhaPadraoBloqueada: true,
              updatedAt: new Date().toISOString(),
            }).catch((err) =>
              console.warn(`Erro ao atualizar doc ${docId}:`, err),
            );
          }),
        );

        // Invalida sessão antiga
        await firestoreService.invalidateSession(user.id);

        // Cria nova sessão
        await firestoreService.createSession(user.id);

        // Atualizar também na coleção 'colaboradores' para manter consistência
        if (user.email || user.nuit) {
          try {
            const colRef = collection(db, "colaboradores");
            const emailStr = String(user.email || "")
              .toLowerCase()
              .trim();
            const nuitStr = String(user.nuit || "").trim();
            const [snapColE, snapColN] = await Promise.all([
              emailStr
                ? getDocs(query(colRef, where("email", "==", emailStr)))
                : Promise.resolve({ docs: [] }),
              nuitStr
                ? getDocs(query(colRef, where("nuit", "==", nuitStr)))
                : Promise.resolve({ docs: [] }),
            ]);
            const colIds = new Set<string>();
            [...snapColE.docs, ...snapColN.docs].forEach((d) =>
              colIds.add(d.id),
            );
            await Promise.all(
              Array.from(colIds).map((cId) =>
                updateDoc(doc(db, "colaboradores", cId), {
                  password: newPassword,
                  mustChangePassword: false,
                  isFirstAccess: false,
                  senhaPadraoBloqueada: true,
                }).catch((err) =>
                  console.warn("Erro ao atualizar colaborador password:", err),
                ),
              ),
            );
          } catch (e) {
            console.warn("Aviso ao atualizar colaboradores:", e);
          }
        }

        // Atualizar sigep_users_cache no localStorage
        try {
          const cache: any[] = JSON.parse(
            localStorage.getItem("sigep_users_cache") || "[]",
          );
          const updatedCache = cache.map((u: any) => {
            if (
              u.id === user.id ||
              (u.email &&
                u.email.toLowerCase() === (user.email || "").toLowerCase()) ||
              (u.nuit && u.nuit === user.nuit)
            ) {
              return {
                ...u,
                password: newPassword,
                mustChangePassword: false,
                isFirstAccess: false,
              };
            }
            return u;
          });
          localStorage.setItem(
            "sigep_users_cache",
            safeJSONStringify(updatedCache),
          );
        } catch (e) {
          console.warn("Erro ao atualizar cache local de utilizadores:", e);
        }

        // Update local storage if this is the currently logged in user
        const storedUser = localStorage.getItem("sigep_logged_in_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (
            parsed.id === user.id ||
            parsed.email === user.email ||
            parsed.nuit === user.nuit
          ) {
            const updatedUser = {
              ...parsed,
              password: newPassword,
              mustChangePassword: false,
              isFirstAccess: false,
            };
            localStorage.setItem(
              "sigep_logged_in_user",
              safeJSONStringify(updatedUser),
            );
          }
        }

        setSuccess("Senha alterada com sucesso!");
        setTimeout(() => {
          onClose();
          // Force reload to ensure all states are consistent with new password
          window.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="bg-[#121c60] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Key size={24} className="text-[#FFB800]" />
            <h2 className="text-xl font-bold tracking-tight">
              Alterar Palavra-passe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-green-700 text-sm">
              <CheckCircle2 size={24} />
              <p className="font-bold">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Seletor de Idioma Preferido */}
            <div className="space-y-2 pb-2 border-b border-gray-100">
              <label className="block text-xs font-bold text-gray-700 tracking-wider flex items-center gap-2">
                <Globe size={16} className="text-[#121c60]" />
                IDIOMA PREFERIDO / PREFERRED LANGUAGE
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="w-full p-3 bg-gray-50 rounded-xl text-sm border-2 border-gray-100 focus:outline-none focus:border-[#121c60] font-medium"
              >
                <option value="pt">Português</option>
                <option value="en">English (Inglês)</option>
              </select>
              <p className="text-[11px] text-gray-500 italic">
                A preferência linguística é aplicada automaticamente ao sistema e associada ao seu perfil institucional.
              </p>
            </div>

            {/* Palavra-passe Atual */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 tracking-wider">
                PALAVRA-PASSE ATUAL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Introduza a sua palavra-passe atual"
                  className="w-full p-4 pr-12 bg-gray-50 rounded-xl text-sm border-2 border-gray-100 focus:outline-none focus:border-[#121c60] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title={showCurrentPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 tracking-wider">
                NOVA PALAVRA-PASSE <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 4 caracteres"
                  className="w-full p-4 pr-12 bg-gray-50 rounded-xl text-sm border-2 border-gray-100 focus:outline-none focus:border-[#121c60] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title={showNewPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 tracking-wider">
                CONFIRMAR NOVA PALAVRA-PASSE <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova palavra-passe"
                  className="w-full p-4 pr-12 bg-gray-50 rounded-xl text-sm border-2 border-gray-100 focus:outline-none focus:border-[#121c60] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title={showConfirmPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#121c60] text-white py-4 px-8 rounded-xl font-bold hover:bg-[#1a2b70] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? "A Guardar..." : "Atualizar Palavra-passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
