import { Platform } from 'react-native';

/**
 * Abre la galería / selector de imágenes del dispositivo y devuelve un Data URL compacto
 * (redimensionado a máx 256px) listo para mostrar y almacenar en perfil y Supabase.
 */
export async function pickProfileImageFromGallery(): Promise<string | null> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        input.remove();
        resolve(value);
      };

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          finish(null);
          return;
        }

        const reader = new FileReader();
        reader.onerror = () => finish(null);
        reader.onload = () => {
          const rawDataUrl = typeof reader.result === 'string' ? reader.result : null;
          if (!rawDataUrl) {
            finish(null);
            return;
          }

          // Redimensionar suavemente en canvas para mantener el peso ligero
          const img = new window.Image();
          img.onerror = () => finish(rawDataUrl);
          img.onload = () => {
            try {
              const maxSize = 256;
              let { width, height } = img;
              if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                finish(rawDataUrl);
                return;
              }
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.82);
              finish(compressed);
            } catch {
              finish(rawDataUrl);
            }
          };
          img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
      };

      // Si el usuario cierra el diálogo sin seleccionar archivo
      const onFocus = () => {
        window.removeEventListener('focus', onFocus);
        setTimeout(() => {
          if (!input.files || input.files.length === 0) {
            finish(null);
          }
        }, 400);
      };
      window.addEventListener('focus', onFocus);

      document.body.appendChild(input);
      input.click();
    });
  }

  return null;
}
