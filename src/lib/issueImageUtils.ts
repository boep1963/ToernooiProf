import sharp from 'sharp';

const MAX_STORAGE_BYTES = 280 * 1024; // ~280 KB per image so 3 images fit in 1MB doc
const ALLOWED_TYPES = /^image\/(jpeg|jpg|png|webp|gif)$/i;
export const SUPPORTED_FORMATS = 'JPG, PNG, WebP, GIF';
export const MAX_IMAGES_PER_ISSUE = 3;

export function isAllowedImageType(mime: string): boolean {
  return ALLOWED_TYPES.test(mime);
}

/**
 * Resize and compress image for storage in Firestore (data URL).
 * Target ~280 KB so multiple images fit within 1MB document limit.
 */
export async function processIssueImageToStorage(inputBuffer: Buffer): Promise<string> {
  const maxLongEdge = 1200;

  for (const quality of [75, 60, 45, 35]) {
    const out = await sharp(inputBuffer)
      .rotate()
      .resize(maxLongEdge, maxLongEdge, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (out.length <= MAX_STORAGE_BYTES) {
      return `data:image/jpeg;base64,${out.toString('base64')}`;
    }
  }

  const smaller = 800;
  const out = await sharp(inputBuffer)
    .rotate()
    .resize(smaller, smaller, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 50, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString('base64')}`;
}
