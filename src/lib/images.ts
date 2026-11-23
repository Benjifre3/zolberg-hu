/**
 * A munkák képei az aktív tartalomkönyvtárból (@content/works, D-011). Csak az Astro/Vite
 * buildben használható (import.meta.glob); a Node-os szkriptek a fájlnevekkel dolgoznak.
 */
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '@content/works/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

export function workImage(fileName: string): ImageMetadata {
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/works/${fileName}`));
  if (!hit) throw new Error(`Hiányzó kép a works/ mappában: ${fileName}`);
  return hit[1].default;
}
