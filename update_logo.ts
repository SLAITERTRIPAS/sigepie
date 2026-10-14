import { doc, setDoc } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function updateLogo() {
  try {
    const configRef = doc(db, "config", "main_config");
    await setDoc(configRef, {
      systemLogo: "/image.png"
    }, { merge: true });
    console.log("Logótipo do sistema atualizado para /image.png no Firestore.");
  } catch (error) {
    console.error("Erro ao atualizar logótipo do sistema:", error);
  }
}

updateLogo();
