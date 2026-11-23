declare module 'subset-font' {
  type AxisRange = number | { min: number; max: number; default?: number };

  interface SubsetFontOptions {
    targetFormat?: 'sfnt' | 'truetype' | 'woff' | 'woff2';
    preserveNameIds?: number[];
    variationAxes?: Record<string, AxisRange>;
    noLayoutClosure?: boolean;
    noHinting?: boolean;
    dropTables?: string[];
  }

  export default function subsetFont(
    buffer: Buffer,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
