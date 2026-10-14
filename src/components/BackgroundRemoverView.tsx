import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  Download, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Sliders,
  Image as ImageIcon,
  HelpCircle,
  Settings,
  AlertCircle,
  Loader2
} from "lucide-react";
import { firestoreService } from "../lib/firestoreService";
import { optimizeImageForFirestore } from "../lib/imageUtils";

interface BackgroundRemoverViewProps {
  user?: any;
  onLogoApplied?: (newLogo: string) => void;
}

export function BackgroundRemoverView({ user, onLogoApplied }: BackgroundRemoverViewProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threshold, setThreshold] = useState<number>(45);
  const [dragActive, setDragActive] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Algoritmo de remoção de fundo com sensibilidade ajustável
  const processImageBackground = (srcDataUrl: string, sens: number) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(srcDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Detectar a cor do canto superior esquerdo (fundo)
        const r_bg = data[0];
        const g_bg = data[1];
        const b_bg = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Sensibilidade em relação ao branco/claro
          const isWhite = r > (255 - sens) && g > (255 - sens) && b > (255 - sens);
          
          // Sensibilidade em relação à cor detectada de fundo
          const isBgColor = 
            Math.abs(r - r_bg) < sens && 
            Math.abs(g - g_bg) < sens && 
            Math.abs(b - b_bg) < sens;

          if (isWhite || isBgColor) {
            data[i + 3] = 0; // Canal Alpha para 0 (Transparente)
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(srcDataUrl);
      img.src = srcDataUrl;
    });
  };

  // Re-processar sempre que o threshold/sensibilidade mudar
  useEffect(() => {
    if (originalImage) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        processImageBackground(originalImage, threshold)
          .then((res) => {
            setProcessedImage(res);
            setIsProcessing(false);
          });
      }, 300); // Debounce curto para não travar a UI ao arrastar
      return () => clearTimeout(timer);
    }
  }, [originalImage, threshold]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOriginalImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOriginalImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "logotipo_transparente.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyToSystem = async () => {
    if (!processedImage) return;
    try {
      setIsProcessing(true);
      // Otimizar a imagem para não exceder limites do Firestore
      const optimized = await optimizeImageForFirestore(processedImage, 240, 240);
      
      // Salvar no main_config do Firestore
      await firestoreService.config.set("main_config", {
        systemLogo: optimized
      });

      // Salvar localmente e propagar evento
      localStorage.setItem("systemLogo", optimized);
      window.dispatchEvent(new CustomEvent("sigep_system_logo_updated", { detail: { logo: optimized } }));
      
      if (onLogoApplied) {
        onLogoApplied(optimized);
      }

      setSuccessMessage("Logótipo aplicado com sucesso como padrão de todo o sistema!");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      console.error("Erro ao aplicar logotipo:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setThreshold(45);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-[#0a0f2d]/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Removedor Inteligente de Fundo
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1 max-w-xl">
            Isola de forma automática logótipos e imagens removendo fundos brancos ou sólidos, entregando imagens com canal de transparência PNG limpo.
          </p>
        </div>
        {originalImage && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <Trash2 size={14} /> Limpar Imagem
          </button>
        )}
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 animate-in slide-in-from-top-2 duration-300">
          <div className="p-1 bg-emerald-500/25 rounded-lg">
            <Check size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">{successMessage}</span>
        </div>
      )}

      {!originalImage ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer select-none ${
            dragActive 
              ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
              : "border-white/10 hover:border-white/20 bg-black/10 hover:bg-black/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 mb-4 animate-bounce">
            <Upload size={28} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
            Selecione ou Arraste o seu Logótipo
          </h3>
          <p className="text-[11px] text-white/40 max-w-xs leading-relaxed uppercase tracking-wider">
            Suporta ficheiros JPG, JPEG, PNG, WEBP ou SVG (Máximo 5MB).
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Barra de Ajuste de Sensibilidade */}
          <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                <Sliders size={16} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Ajuste de Sensibilidade</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Aumente para remover cores de fundo semelhantes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-grow max-w-md">
              <input
                type="range"
                min="10"
                max="120"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs font-black text-blue-400 min-w-[24px] text-right">
                {threshold}
              </span>
            </div>
          </div>

          {/* Comparativo de Imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Imagem Original */}
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 text-left">Logótipo Original</span>
              <div className="flex-1 min-h-[300px] border border-white/10 rounded-2xl bg-black/30 p-4 flex items-center justify-center relative overflow-hidden">
                <img
                  src={originalImage}
                  alt="Original"
                  className="max-h-[260px] max-w-full object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* Coluna Direita - Imagem Processada Transparente */}
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 text-left">Resultado Sem Fundo (PNG)</span>
              <div 
                className="flex-1 min-h-[300px] border border-white/10 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: "radial-gradient(#1e293b 20%, transparent 20%), radial-gradient(#1e293b 20%, transparent 20%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                  backgroundColor: "#030712"
                }}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-blue-400 animate-spin" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Removendo Fundo...</span>
                  </div>
                ) : processedImage ? (
                  <img
                    src={processedImage}
                    alt="Processada"
                    className="max-h-[260px] max-w-full object-contain drop-shadow-lg"
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Ações Disponíveis */}
          <div className="flex flex-wrap justify-end gap-3 border-t border-white/5 pt-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-blue-900/20 active:scale-95"
            >
              <Download size={14} /> Fazer Download do PNG
            </button>
            <button
              onClick={handleApplyToSystem}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-900/20 active:scale-95"
            >
              <Check size={14} /> Aplicar ao Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackgroundRemoverView;
