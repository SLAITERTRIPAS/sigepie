/**
 * Utilitário de Processamento de Imagens e Remoção de Fundo em Canvas
 * Algoritmo de filtragem e luminância para extração de assinaturas em papel.
 */

export interface RemoveBackgroundOptions {
  threshold?: number; // Limiar de luminância (0-255) para considerar fundo. Padrão: 195
  boostInk?: boolean; // Se true, escurece e nitidifica a tinta da assinatura
  inkColor?: "black" | "blue" | "original"; // Cor desejada para a tinta
}

export function removeSignatureBackground(
  dataUrl: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const { threshold = 195, boostInk = true, inkColor = "original" } = options;

  return new Promise((resolve, reject) => {
    if (!dataUrl) {
      resolve("");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a === 0) continue;

          // Luminância (fórmula de percepção humana NTSC/PAL)
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          // Distância Euclidiana em relação ao branco puro (255, 255, 255)
          const distFromWhite = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);

          // Se a luminância for alta (papel/sombras claras), torna transparente
          if (luminance >= threshold || distFromWhite < (255 - threshold) * 1.4) {
            const diff = 255 - luminance;
            if (diff < 40) {
              data[i + 3] = 0; // Transparente total
            } else {
              // Suavização das bordas (Anti-aliasing)
              data[i + 3] = Math.min(255, Math.floor((diff / 40) * a));
            }
          } else if (boostInk) {
            // Fortalecer e nitidificar os traços da tinta
            const inkFactor = 1 - luminance / threshold;

            if (inkColor === "black") {
              // Tinta Preta Executiva #0f172a
              data[i] = Math.floor(15 * (1 - inkFactor));
              data[i + 1] = Math.floor(23 * (1 - inkFactor));
              data[i + 2] = Math.floor(42 * (1 - inkFactor));
            } else if (inkColor === "blue") {
              // Tinta Azul Caneta #1e3a8a
              data[i] = Math.floor(30 * (1 - inkFactor));
              data[i + 1] = Math.floor(58 * (1 - inkFactor));
              data[i + 2] = Math.floor(138 + 117 * inkFactor);
            } else {
              // Preservar tom original escurecendo papéis e fundos
              data[i] = Math.max(0, Math.floor(r * 0.8));
              data[i + 1] = Math.max(0, Math.floor(g * 0.8));
              data[i + 2] = Math.max(0, Math.floor(b * 0.85));
            }

            // Aumentar opacidade do traço
            data[i + 3] = Math.min(255, Math.floor(a * 1.2));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Erro no processamento do canvas da assinatura:", err);
        resolve(dataUrl);
      }
    };

    img.onerror = (err) => {
      console.warn("Erro ao carregar imagem para remoção de fundo:", err);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
