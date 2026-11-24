import { Platform } from 'react-native';

const MAX_RAW_FILE_BYTES = 12 * 1024 * 1024; // 12 MB máximo al seleccionar archivo
const DEFAULT_MAX_DIMENSION = 1080;
const DEFAULT_QUALITY = 0.7;
const TARGET_MAX_BYTES = 300 * 1024; // Objetivo < 300 KB para cuidar Supabase Free Tier

export interface CompressedChatImage {
  blob: Blob | null;
  dataUrl: string;
  mimeType: 'image/webp' | 'image/jpeg';
  extension: 'webp' | 'jpg';
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
  fileName: string;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo convertir la imagen comprimida.'));
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo imagen comprimida.'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: 'image/webp' | 'image/jpeg',
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo decodificar la imagen seleccionada.'));
    img.src = src;
  });
}

/**
 * Comprime obligatoriamente una imagen en cliente (HTML5 Canvas en Web):
 * - Redimensiona a máximo 1080px en su lado mayor manteniendo proporción.
 * - Exporta preferiblemente en image/webp (fallback automático a image/jpeg) con calidad 0.7.
 * - Ajusta de forma adaptativa la calidad/escala si supera 300 KB.
 */
export async function compressImageForWeb(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    targetMaxBytes?: number;
  }
): Promise<CompressedChatImage> {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('La compresión HTML5 Canvas solo está disponible en entorno web.');
  }

  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const initialQuality = options?.quality ?? DEFAULT_QUALITY;
  const targetMaxBytes = options?.targetMaxBytes ?? TARGET_MAX_BYTES;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadHtmlImage(objectUrl);

    const drawScaled = (maxSide: number) => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxSide || height > maxSide) {
        const ratio = Math.min(maxSide / width, maxSide / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo inicializar el contexto de compresión.');
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      return { canvas, width, height };
    };

    let { canvas, width, height } = drawScaled(maxDimension);

    // Probar WebP primero; algunos navegadores (ej. Safari antiguo) caen a JPEG
    let chosenMime: 'image/webp' | 'image/jpeg' = 'image/webp';
    let blob = await canvasToBlob(canvas, 'image/webp', initialQuality);

    if (!blob || blob.type !== 'image/webp') {
      chosenMime = 'image/jpeg';
      blob = await canvasToBlob(canvas, 'image/jpeg', initialQuality);
    }

    if (!blob) {
      throw new Error('No se pudo generar la imagen comprimida.');
    }

    // Ajuste adaptativo si supera el objetivo (< 300 KB)
    const fallbackQualities = [0.6, 0.5, 0.42];
    for (const q of fallbackQualities) {
      if (blob.size <= targetMaxBytes) break;
      const nextBlob = await canvasToBlob(canvas, chosenMime, q);
      if (nextBlob) blob = nextBlob;
    }

    // Último ajuste de resolución (840px) si aún supera 300 KB
    if (blob.size > targetMaxBytes && Math.max(width, height) > 840) {
      const smaller = drawScaled(840);
      canvas = smaller.canvas;
      width = smaller.width;
      height = smaller.height;
      const smallerBlob = await canvasToBlob(canvas, chosenMime, 0.62);
      if (smallerBlob) blob = smallerBlob;
    }

    const dataUrl = await blobToDataUrl(blob);
    const extension: 'webp' | 'jpg' = chosenMime === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '').slice(0, 48) || 'foto';

    return {
      blob,
      dataUrl,
      mimeType: chosenMime,
      extension,
      width,
      height,
      sizeBytes: blob.size,
      originalSizeBytes: file.size,
      fileName: `${baseName}.${extension}`,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Abre el selector de imágenes compatible con navegadores móviles y escritorio en Vercel
 * y devuelve la imagen ya comprimida y lista para subir a Supabase Storage.
 */
export function pickAndCompressChatImage(): Promise<{
  image: CompressedChatImage | null;
  error?: string;
}> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.resolve({
      image: null,
      error: 'La subida de fotos está optimizada para el navegador web.',
    });
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/*';
    input.style.display = 'none';

    let settled = false;
    const finish = (result: { image: CompressedChatImage | null; error?: string }) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(result);
    };

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        finish({ image: null });
        return;
      }

      if (!file.type.startsWith('image/')) {
        finish({ image: null, error: 'Selecciona un archivo de imagen válido (JPG, PNG o WebP).' });
        return;
      }

      if (file.size > MAX_RAW_FILE_BYTES) {
        finish({ image: null, error: 'La imagen supera los 12 MB máximos permitidos.' });
        return;
      }

      try {
        const compressed = await compressImageForWeb(file);
        finish({ image: compressed });
      } catch (err: any) {
        finish({
          image: null,
          error: err?.message || 'No se pudo comprimir la imagen seleccionada.',
        });
      }
    };

    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!input.files || input.files.length === 0) {
          finish({ image: null });
        }
      }, 450);
    };
    window.addEventListener('focus', onFocus);

    document.body.appendChild(input);
    input.click();
  });
}
