/**
 * Utilitário de compressão e otimização de imagens client-side.
 * Garante que imagens salvas no Firestore (como logotipos de sistema e avatares)
 * fiquem estritamente abaixo de ~200 KB, prevenindo o erro de limite de 1 MiB por documento.
 */

export async function removeImageBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Detectar a cor de fundo (pixel no canto superior esquerdo)
      const r_bg = data[0];
      const g_bg = data[1];
      const b_bg = data[2];

      const threshold = 45; // Sensibilidade para detecção de fundo

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Tornar transparente se for muito próximo do branco OU da cor do canto superior esquerdo
        const isWhite = r > 240 && g > 240 && b > 240;
        const isBgColor = 
          Math.abs(r - r_bg) < threshold && 
          Math.abs(g - g_bg) < threshold && 
          Math.abs(b - b_bg) < threshold;

        if (isWhite || isBgColor) {
          data[i + 3] = 0; // Alpha = 0 (Transparente)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function optimizeImageForFirestore(
  source: File | string,
  maxWidth = 320,
  maxHeight = 320,
  maxSizeBytes = 200 * 1024 // Limite estrito de 200 KB em base64
): Promise<string> {
  // Se for arquivo SVG
  if (typeof source !== "string" && source.type === "image/svg+xml") {
    try {
      const text = await source.text();
      // Se o SVG for conciso (< 150KB), pode ser salvo como dataURL direto
      if (text.length <= maxSizeBytes) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(source);
        });
      }
    } catch (_) {}
  }

  // Obter dataURL inicial
  const dataUrl = await new Promise<string>((resolve, reject) => {
    if (typeof source === "string") {
      resolve(source);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let targetW = img.width;
      let targetH = img.height;

      // Manter proporção original
      if (targetW > maxWidth || targetH > maxHeight) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxWidth) / targetW);
          targetW = maxWidth;
        } else {
          targetW = Math.round((targetW * maxHeight) / targetH);
          targetH = maxHeight;
        }
      }

      targetW = Math.max(1, targetW);
      targetH = Math.max(1, targetH);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(dataUrl.length <= maxSizeBytes ? dataUrl : "");
        return;
      }

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Tentar WebP com 80% de qualidade
      let result = canvas.toDataURL("image/webp", 0.8);

      // Se ainda exceder ou se o navegador não gerou WebP
      if (result.length > maxSizeBytes || !result.startsWith("data:image/webp")) {
        // Tentar PNG se for pequeno ou JPEG
        const pngResult = canvas.toDataURL("image/png");
        if (pngResult.length <= maxSizeBytes) {
          result = pngResult;
        } else {
          result = canvas.toDataURL("image/jpeg", 0.8);
        }
      }

      // Se ainda for maior que maxSizeBytes, reduzir escala progressivamente
      let scale = 0.8;
      let quality = 0.75;
      while (result.length > maxSizeBytes && scale >= 0.25) {
        const curW = Math.max(1, Math.round(targetW * scale));
        const curH = Math.max(1, Math.round(targetH * scale));
        canvas.width = curW;
        canvas.height = curH;
        ctx.clearRect(0, 0, curW, curH);
        ctx.drawImage(img, 0, 0, curW, curH);

        result = canvas.toDataURL("image/webp", quality);
        if (result.length > maxSizeBytes) {
          result = canvas.toDataURL("image/jpeg", quality);
        }

        scale -= 0.15;
        quality -= 0.1;
      }

      resolve(result);
    };

    img.onerror = () => {
      // Se falhar o carregamento como imagem, usar fallback com limite de segurança
      if (dataUrl.length <= maxSizeBytes) {
        resolve(dataUrl);
      } else {
        console.warn("Imagem excessivamente grande para armazenamento no Firestore.");
        resolve("");
      }
    };

    img.src = dataUrl;
  });
}
