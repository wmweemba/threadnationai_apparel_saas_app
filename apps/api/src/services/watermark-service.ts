import sharp from "sharp";

const PREVIEW_WIDTH = 512;

function buildCenteredTextSvg(width: number, height: number): Buffer {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <text
      x="50%"
      y="92%"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      font-size="18"
      font-weight="bold"
      fill="rgba(255,255,255,0.75)"
      letter-spacing="1"
    >ThreadNation AI — Preview</text>
  </svg>`;
  return Buffer.from(svg);
}

function buildDiagonalWatermarkSvg(width: number, height: number): Buffer {
  // Tiled 200×80 tile with diagonal "PREVIEW" text
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="wm" x="0" y="0" width="200" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <text
          x="10"
          y="50"
          font-family="Arial, sans-serif"
          font-size="13"
          fill="rgba(255,255,255,0.18)"
          letter-spacing="2"
        >THREADNATION</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wm)"/>
  </svg>`;
  return Buffer.from(svg);
}

export async function createWatermarkedPreview(imageBuffer: Buffer): Promise<Buffer> {
  // Resize to PREVIEW_WIDTH, get metadata for overlay sizing
  const resized = await sharp(imageBuffer)
    .resize({ width: PREVIEW_WIDTH, withoutEnlargement: false })
    .jpeg({ quality: 82 })
    .toBuffer();

  const { width = PREVIEW_WIDTH, height = PREVIEW_WIDTH } = await sharp(resized).metadata();

  const centeredSvg = buildCenteredTextSvg(width, height);
  const diagonalSvg = buildDiagonalWatermarkSvg(width, height);

  return sharp(resized)
    .composite([
      { input: diagonalSvg, top: 0, left: 0 },
      { input: centeredSvg, top: 0, left: 0 },
    ])
    .jpeg({ quality: 80 })
    .toBuffer();
}
