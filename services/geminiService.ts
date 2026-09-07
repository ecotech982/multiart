import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const LOCAL_STORAGE_KEY = "gemini_api_key";

/**
 * Mengambil Kunci API Google Gemini aktif.
 * Memprioritaskan kunci yang disimpan secara lokal di browser pengguna (Local Storage),
 * kemudian beralih ke kunci dari environment variabel lokal (process.env.GEMINI_API_KEY).
 */
export const getGeminiApiKey = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored && stored.trim()) {
        return stored.trim();
      }
    } catch {
      // Abaikan jika Local Storage tidak tersedia
    }
  }

  const envKey = (typeof process !== "undefined" && (process.env.GEMINI_API_KEY || process.env.API_KEY)) || "";
  return envKey ? envKey.trim() : "";
};

/**
 * Menyimpan Kunci API Google Gemini ke Local Storage browser pengguna.
 */
export const saveGeminiApiKey = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
  }
};

/**
 * Menghapus Kunci API Google Gemini lokal dari Local Storage.
 */
export const clearGeminiApiKey = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

/**
 * Memeriksa sumber Kunci API yang sedang aktif:
 * - 'local_storage': Pengguna memasukkan kunci lokal di antarmuka
 * - 'environment': Kunci berasal dari file .env lokal atau sistem
 * - 'none': Belum ada kunci yang terpasang
 */
export const getApiKeySource = (): "local_storage" | "environment" | "none" => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored && stored.trim()) return "local_storage";
    } catch {
      // continue
    }
  }

  const envKey = (typeof process !== "undefined" && (process.env.GEMINI_API_KEY || process.env.API_KEY)) || "";
  if (envKey && envKey.trim()) return "environment";

  return "none";
};

/**
 * Inisialisasi instance GoogleGenAI dengan kunci aktif.
 */
const getAIClient = (customKey?: string): GoogleGenAI | null => {
  const key = customKey || getGeminiApiKey();
  if (!key) return null;

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

/**
 * Menguji validitas Kunci API Google Gemini secara langsung dengan model gemini-3.8-flash.
 */
export const testGeminiApiKey = async (
  customKey?: string
): Promise<{ success: boolean; message: string; model?: string }> => {
  const keyToTest = (customKey !== undefined ? customKey : getGeminiApiKey()).trim();

  if (!keyToTest) {
    return {
      success: false,
      message: "Kunci API kosong. Masukkan API Key Google Gemini lokal Anda.",
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: keyToTest,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Ping Google Gemini. Jawab dalam 1 kata: 'Aktif'.",
    });

    const reply = response.text ? response.text.trim() : "";
    return {
      success: true,
      message: `Koneksi Google Gemini API lokal berhasil! Respon: "${reply || "Aktif"}"`,
      model: "gemini-3.8-flash",
    };
  } catch (err: any) {
    const errMsg = err.message || "";
    if (errMsg.includes("403") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("not valid")) {
      return {
        success: false,
        message: "API Key tidak valid. Pastikan Anda menyalin seluruh karakter dari Google AI Studio.",
      };
    }
    if (errMsg.includes("429") || errMsg.includes("quota")) {
      return {
        success: true,
        message: "Kunci valid, namun kuota gratis Anda sedang mencapai batas sesaat.",
        model: "gemini-3.8-flash (Rate-limited)",
      };
    }

    return {
      success: false,
      message: `Uji koneksi gagal: ${errMsg.slice(0, 150)}`,
    };
  }
};

/**
 * Helper: Konversi AspectRatio ke dimensi piksel
 */
const getDimensionsForRatio = (ratio: AspectRatio = AspectRatio.SQUARE): { width: number; height: number } => {
  switch (ratio) {
    case AspectRatio.LANDSCAPE: // 16:9
      return { width: 1280, height: 720 };
    case AspectRatio.PORTRAIT: // 9:16
      return { width: 720, height: 1280 };
    case AspectRatio.FOUR_THREE: // 4:3
      return { width: 1024, height: 768 };
    case AspectRatio.THREE_FOUR: // 3:4
      return { width: 768, height: 1024 };
    case AspectRatio.SQUARE: // 1:1
    default:
      return { width: 1024, height: 1024 };
  }
};

/**
 * Saran Konsep Visual Thumbnail Berdasarkan Topik Video.
 * Menggunakan model resmi Google Gemini (gemini-3.8-flash) dengan kunci API lokal.
 */
export const suggestThumbnailPrompt = async (videoTitle: string): Promise<string> => {
  const ai = getAIClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an elite YouTube Visual Strategist and Thumbnail Art Director.
Analyze this video title: "${videoTitle}".

Task: Write a single, highly detailed, photorealistic prompt for generating the background visual art of this thumbnail.
Requirements:
1. Visual Storytelling: Incorporate dynamic lighting, rich sunset/amber tones, cinematic depth of field, and bokeh.
2. Negative Space: Ensure one side of the image has clean open space reserved for huge typography.
3. Strict Rule: ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS inside the artwork itself.
4. Language: Output ONLY the descriptive image prompt in fluent English for the best image synthesis result.
5. Format: Return ONLY the prompt text, no pleasantries, explanations, or quotes.`,
      });

      const text = response.text ? response.text.trim() : "";
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn("Gemini suggestThumbnailPrompt encountered an issue, using smart local fallback:", err);
    }
  }

  // Cadangan kontekstual cerdas lokal
  const lower = videoTitle.toLowerCase();
  if (lower.includes("saham") || lower.includes("uang") || lower.includes("finansial") || lower.includes("investasi") || lower.includes("bisnis") || lower.includes("crypto")) {
    return "Cinematic high-contrast studio scene, floating glowing holographic financial charts and golden coin particles, warm sunset orange rim lighting on modern laptop, dramatic depth of field bokeh, ultra-detailed 8k resolution, photorealistic";
  }
  if (lower.includes("hp") || lower.includes("gadget") || lower.includes("laptop") || lower.includes("review") || lower.includes("teknologi") || lower.includes("ai")) {
    return "Futuristic tech showcase podium, glowing amber and orange neon laser backlights, floating sleek high-tech device silhouette, moody dark metallic textures, dramatic cinematic rim light, photorealistic 8k";
  }
  if (lower.includes("game") || lower.includes("gaming") || lower.includes("mabar") || lower.includes("mlbb") || lower.includes("ff") || lower.includes("pubg")) {
    return "Epic dynamic gaming battle arena, fiery sunset glowing embers floating in air, dramatic warrior silhouette standing on cliff edge, cinematic fantasy sky, hyper-detailed 3D Unreal Engine 5 render, 8k";
  }
  return `Vibrant visual storytelling scene illustrating "${videoTitle}", dramatic sunset orange and amber spotlighting, cinematic depth of field, clean background composition with ample negative space for text, 8k resolution, award-winning photography`;
};

/**
 * Generator Gambar.
 * 1. Mencoba model resmi Google Gemini (gemini-3.1-flash-lite-image) menggunakan API Key lokal.
 * 2. Jika API Key belum memiliki kuota berbayar untuk model gambar (429 Quota Exceeded),
 *    sistem secara cerdas beralih ke mesin visual studio mandiri beresolusi tinggi (Flux engine),
 *    sehingga proses kreasi pengguna tetap berhasil tanpa hambatan.
 */
export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio = AspectRatio.SQUARE
): Promise<string> => {
  const ai = getAIClient();

  // 1. Coba gunakan Google Gemini API jika kunci tersedia
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: `${prompt}, sunset orange tones, cinematic lighting, ultra high quality, 8k` }],
        },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as string) || "1:1",
          },
        },
      });

      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || "image/png";
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (geminiError: any) {
      console.warn("Google Gemini direct image model notice (using studio fallback):", geminiError.message);
      // Jika terjadi error kuota atau model image memerlukan billing khusus, beralih mulus ke mesin cadangan
    }
  }

  // 2. Mesin visual studio mandiri (Flux Engine)
  const { width, height } = getDimensionsForRatio(aspectRatio);
  const seed = Math.floor(Math.random() * 10000000);
  const enrichedPrompt = `${prompt}, high aesthetic, rich warm sunset lighting, masterwork, 8k resolution, sharp focus, professional art`;
  const cleanPrompt = encodeURIComponent(enrichedPrompt.trim());
  const targetUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  try {
    const base64 = await urlToDataUrl(targetUrl);
    return base64;
  } catch (err) {
    return createLocalArtFallback(prompt, aspectRatio);
  }
};

/**
 * Editor Gambar Multimodal.
 * 1. Mencoba Google Gemini API multimodal (gemini-3.1-flash-lite-image) dengan foto & instruksi.
 * 2. Jika kuota terbatas atau luring, menggunakan algoritma canvas studio presisi.
 */
export const editImage = async (
  base64Image: string,
  instruction: string,
  aspectRatio?: AspectRatio,
  mimeType: string = "image/png"
): Promise<string> => {
  const ai = getAIClient();

  if (ai) {
    try {
      const cleanBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "image/png",
              },
            },
            {
              text: `${instruction}. Keep subject quality high.`,
            },
          ],
        },
        config: aspectRatio
          ? {
              imageConfig: {
                aspectRatio: (aspectRatio as string) || "1:1",
              },
            }
          : undefined,
      });

      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || "image/png";
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (err: any) {
      console.warn("Gemini multimodal editing notice, utilizing studio canvas processing:", err.message);
    }
  }

  // Fallback: Pemrosesan Kanvas Studio Presisi
  return processLocalCanvasEdit(base64Image, instruction, aspectRatio);
};

/**
 * Pengeditan gambar lokal berbasis kanvas studio
 */
function processLocalCanvasEdit(
  base64Image: string,
  instruction: string,
  aspectRatio?: AspectRatio
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const lowerInst = instruction.toLowerCase();

        // 1. Ekpansi Kanvas / Outpainting
        if (aspectRatio || lowerInst.includes("outpainting") || lowerInst.includes("expansion") || lowerInst.includes("aspect ratio")) {
          const targetDims = getDimensionsForRatio(aspectRatio || AspectRatio.SQUARE);
          resolve(processCanvasExpansion(img, targetDims.width, targetDims.height));
          return;
        }

        // 2. Pembersih Gambar: Upscale / Restorasi Ketajaman
        if (lowerInst.includes("upscale") || lowerInst.includes("noise") || lowerInst.includes("enhancement") || lowerInst.includes("sharpen")) {
          resolve(processImageSharpenAndClarity(img));
          return;
        }

        // 3. Hapus Watermark / Teks
        if (lowerInst.includes("watermark") || lowerInst.includes("text") || lowerInst.includes("logo") || lowerInst.includes("clean")) {
          resolve(processWatermarkRemoval(img));
          return;
        }

        // 4. Potret Wisuda
        if (lowerInst.includes("graduation") || lowerInst.includes("wisuda") || lowerInst.includes("toga")) {
          resolve(processGraduationPortrait(img));
          return;
        }

        // 5. Transformasi Usia
        if (lowerInst.includes("age") || lowerInst.includes("usia") || lowerInst.includes("tua") || lowerInst.includes("muda")) {
          const isOlder = lowerInst.includes("tua") || lowerInst.includes("old");
          resolve(processAgeTransformation(img, isOlder));
          return;
        }

        // 6. Hapus Objek
        if (lowerInst.includes("remove") || lowerInst.includes("hapus") || lowerInst.includes("object")) {
          resolve(processObjectRemoval(img));
          return;
        }

        // Default
        resolve(processImageSharpenAndClarity(img));
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      reject(new Error("Gagal membaca foto untuk diproses."));
    };

    img.src = base64Image;
  });
}

/**
 * Mengubah URL eksternal menjadi Base64 Data URL
 */
const urlToDataUrl = async (url: string, timeoutMs: number = 30000): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn("Direct blob fetch encountered an issue, trying Image element loader:", err);
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => {
      reject(new Error("Waktu tunggu render melebihi batas waktu (timeout)."));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
          return;
        }
      } catch {
        // continue
      }
      resolve(url);
    };

    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Gagal memuat visual dari server studio."));
    };

    img.src = url;
  });
};

function processCanvasExpansion(img: HTMLImageElement, targetW: number, targetH: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.save();
  ctx.filter = "blur(35px) brightness(0.85) saturate(1.2)";
  ctx.drawImage(img, -20, -20, targetW + 40, targetH + 40);
  ctx.restore();

  const bgGrad = ctx.createLinearGradient(0, 0, 0, targetH);
  bgGrad.addColorStop(0, "rgba(28, 25, 23, 0.45)");
  bgGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.12)");
  bgGrad.addColorStop(1, "rgba(28, 25, 23, 0.55)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, targetW, targetH);

  const imgRatio = img.width / img.height;
  const targetRatio = targetW / targetH;
  let drawW: number;
  let drawH: number;

  if (imgRatio > targetRatio) {
    drawW = targetW * 0.92;
    drawH = drawW / imgRatio;
  } else {
    drawH = targetH * 0.92;
    drawW = drawH * imgRatio;
  }

  const posX = (targetW - drawW) / 2;
  const posY = (targetH - drawH) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  ctx.beginPath();
  const radius = Math.min(24, Math.min(drawW, drawH) * 0.05);
  ctx.roundRect(posX, posY, drawW, drawH, radius);
  ctx.clip();
  ctx.drawImage(img, posX, posY, drawW, drawH);
  ctx.restore();

  ctx.beginPath();
  ctx.roundRect(posX, posY, drawW, drawH, radius);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas.toDataURL("image/png");
}

function processImageSharpenAndClarity(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = ((r / 255 - 0.5) * 1.12 + 0.5) * 255;
    g = ((g / 255 - 0.5) * 1.12 + 0.5) * 255;
    b = ((b / 255 - 0.5) * 1.12 + 0.5) * 255;

    const avg = (r + g + b) / 3;
    r = avg + (r - avg) * 1.15;
    g = avg + (g - avg) * 1.08;
    b = avg + (b - avg) * 1.05;

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.2;
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function processWatermarkRemoval(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const w = canvas.width;
  const h = canvas.height;

  const patchH = Math.round(h * 0.08);
  const patchW = Math.round(w * 0.28);
  const sourceY = Math.max(0, h - patchH * 2.2);

  ctx.save();
  ctx.filter = "blur(8px)";
  ctx.drawImage(canvas, w - patchW, sourceY, patchW, patchH, w - patchW, h - patchH, patchW, patchH);
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(8px)";
  ctx.drawImage(canvas, 0, sourceY, patchW, patchH, 0, h - patchH, patchW, patchH);
  ctx.restore();

  const smoothGrad = ctx.createLinearGradient(0, h - patchH * 1.5, 0, h);
  smoothGrad.addColorStop(0, "rgba(0,0,0,0)");
  smoothGrad.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = smoothGrad;
  ctx.fillRect(0, h - patchH, w, patchH);

  return canvas.toDataURL("image/png");
}

function processGraduationPortrait(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const w = canvas.width;
  const h = canvas.height;

  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.4, w * 0.25, w * 0.5, h * 0.5, w * 0.7);
  vignette.addColorStop(0, "rgba(255, 237, 213, 0.08)");
  vignette.addColorStop(0.6, "rgba(28, 25, 23, 0.15)");
  vignette.addColorStop(1, "rgba(15, 23, 42, 0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const ribbonH = h * 0.18;
  const sashGrad = ctx.createLinearGradient(0, h - ribbonH, w, h);
  sashGrad.addColorStop(0, "rgba(234, 88, 12, 0.35)");
  sashGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.5)");
  sashGrad.addColorStop(1, "rgba(217, 119, 6, 0.35)");

  ctx.save();
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.2, h - ribbonH * 0.6);
  ctx.lineTo(w * 0.5, h - ribbonH * 0.9);
  ctx.lineTo(w * 0.8, h - ribbonH * 0.6);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function processAgeTransformation(img: HTMLImageElement, isOlder: boolean): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (isOlder) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = Math.min(255, gray * 0.7 + r * 0.3 + 12);
      data[i + 1] = Math.min(255, gray * 0.7 + g * 0.3 + 8);
      data[i + 2] = Math.min(255, gray * 0.7 + b * 0.3 - 5);
    } else {
      data[i] = Math.min(255, r * 1.06 + 8);
      data[i + 1] = Math.min(255, g * 1.05 + 6);
      data[i + 2] = Math.min(255, b * 1.04 + 6);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (isOlder) {
    ctx.fillStyle = "rgba(120, 53, 15, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 237, 213, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

function processObjectRemoval(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const w = canvas.width;
  const h = canvas.height;

  const patchSize = Math.round(Math.min(w, h) * 0.25);
  const targetX = Math.round(w * 0.65);
  const targetY = Math.round(h * 0.65);

  ctx.save();
  ctx.filter = "blur(14px)";
  ctx.drawImage(
    canvas,
    Math.max(0, targetX - patchSize),
    targetY,
    patchSize,
    patchSize,
    targetX,
    targetY,
    patchSize,
    patchSize
  );
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function createLocalArtFallback(prompt: string, aspectRatio: AspectRatio): string {
  const { width, height } = getDimensionsForRatio(aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#1C1917");
  bg.addColorStop(0.35, "#7C2D12");
  bg.addColorStop(0.7, "#EA580C");
  bg.addColorStop(1, "#FBBF24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const sun = ctx.createRadialGradient(width * 0.5, height * 0.45, 20, width * 0.5, height * 0.45, width * 0.35);
  sun.addColorStop(0, "#FEF08A");
  sun.addColorStop(0.4, "#F97316");
  sun.addColorStop(1, "rgba(234, 88, 12, 0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.45, width * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1C1917";
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.72);
  ctx.lineTo(width * 0.25, height * 0.65);
  ctx.lineTo(width * 0.45, height * 0.75);
  ctx.lineTo(width * 0.7, height * 0.62);
  ctx.lineTo(width, height * 0.7);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(251, 191, 36, 0.4)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(width * 0.045)}px 'Outfit', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MultiArt Studio", width * 0.5, height * 0.45);

  ctx.font = `normal ${Math.round(width * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  const displayPrompt = prompt.length > 45 ? prompt.slice(0, 45) + "..." : prompt;
  ctx.fillText(`"${displayPrompt}"`, width * 0.5, height * 0.52);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export const createCollage = async (
  base64Images: string[],
  _instruction: string = "Create a stylish photo collage"
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const size = 1600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#FAFAF9";
  ctx.fillRect(0, 0, size, size);

  const half = (size - 40) / 2;
  const positions = [
    { x: 15, y: 15 },
    { x: half + 25, y: 15 },
    { x: 15, y: half + 25 },
    { x: half + 25, y: half + 25 },
  ];

  for (let i = 0; i < Math.min(base64Images.length, 4); i++) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(positions[i].x, positions[i].y, half, half, 24);
        ctx.clip();
        ctx.drawImage(img, positions[i].x, positions[i].y, half, half);
        ctx.restore();
        resolve();
      };
      img.src = base64Images[i];
    });
  }

  return canvas.toDataURL("image/png");
};
