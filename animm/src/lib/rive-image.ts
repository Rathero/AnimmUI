import { FileAsset, decodeImage } from '@rive-app/react-webgl2';

export function getBaseNameFromPath(
  path: string | undefined | null
): string | null {
  if (!path) return null;
  const base = path.replace(/['"]/g, '').split('/').pop()?.split('.').shift();
  return base || null;
}

export async function replaceRiveImageFromUrl(
  assets: FileAsset[],
  baseName: string,
  imageUrl: string
): Promise<void> {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const decoded = await decodeImage(new Uint8Array(buffer));

  assets.forEach(asset => {
    if (asset && asset.name === baseName) {
      (asset as any).setRenderImage(decoded);
    }
  });
}
