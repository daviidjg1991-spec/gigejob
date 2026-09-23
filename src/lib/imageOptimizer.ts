/**
 * Utilidad de optimización de imágenes en cliente/servidor.
 * Convierte automáticamente cualquier archivo de imagen (JPEG, PNG, HEIC, etc.)
 * al formato WebP comprimido antes de guardarlo o enviarlo a la base de datos/storage.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0 (default 0.82)
}

/**
 * Convierte un File de imagen a un Blob/File en formato WebP comprimido
 */
export async function convertToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.82 } = options;

  // Si ya es webp y su tamaño es pequeño, podemos retornarlo directamente
  if (file.type === 'image/webp' && file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error leyendo el archivo de imagen"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error cargando la imagen"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular escalado manteniendo relación de aspecto
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback si canvas no está disponible
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const webpFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
