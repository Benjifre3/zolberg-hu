/**
 * Képek az aktív tartalomkönyvtárból (@content, D-011/D-026): munkák (works/) és a portré
 * (about/). Csak az Astro/Vite buildben használható (import.meta.glob).
 */
import type { ImageMetadata } from 'astro';

const works = import.meta.glob<{ default: ImageMetadata }>(
  '@content/works/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);
const about = import.meta.glob<{ default: ImageMetadata }>(
  '@content/about/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

function find(
  files: Record<string, { default: ImageMetadata }>,
  dir: string,
  fileName: string,
): ImageMetadata {
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${dir}/${fileName}`));
  if (!hit) throw new Error(`Hiányzó kép a ${dir}/ mappában: ${fileName}`);
  return hit[1].default;
}

export const workImage = (fileName: string) => find(works, 'works', fileName);
export const aboutImage = (fileName: string) => find(about, 'about', fileName);
