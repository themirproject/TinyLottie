import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Increase max payload size to handle base64 images within Lottie JSON
export const maxDuration = 60; // 60 seconds

function getImageFormatFromDataURI(dataURI: string): string | null {
  const regex = /^data:image\/(png|jpeg|jpg|gif|tiff|TIFF);base64,/;
  const match = dataURI.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

async function convertImageToWebp(base64image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64image, 'base64');
  const webpBuffer = await sharp(imageBuffer, { failOn: 'none' })
    .toFormat('webp', { quality: 80, effort: 6 })
    .toBuffer();
  return webpBuffer.toString('base64');
}

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const supportedFormats = ['png', 'jpeg', 'jpg', 'gif', 'tiff', 'TIFF'];
    const assets = data.assets || [];

    // Process assets sequentially to prevent Out-Of-Memory (OOM) / DOS attacks 
    // from Sharp spawning too many Node threads on massively inflated Lottie arrays.
    for (const asset of assets) {
      if (!asset.p) continue;
      
      if (typeof asset.p === 'string' && asset.p.startsWith('data:image')) {
        const format = getImageFormatFromDataURI(asset.p);
        if (format && supportedFormats.includes(format)) {
          const base64Data = asset.p.split(',')[1];
          if (base64Data) {
            // Extract original dimensions using Sharp to maintain exact structural metadata
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const meta = await sharp(imageBuffer).metadata();
            if (meta.width) asset.w = meta.width;
            if (meta.height) asset.h = meta.height;

            const webpBuffer = await sharp(imageBuffer, { failOn: 'none' })
              .toFormat('webp', { quality: 80, effort: 6 })
              .toBuffer();
            const base64Webp = webpBuffer.toString('base64');
            
            asset.p = `data:image/webp;base64,${base64Webp}`;
          }
        }
      }
    }

    return NextResponse.json({ optimizedData: data });
  } catch (error) {
    console.error('Optimization API Error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize Lottie file' },
      { status: 500 }
    );
  }
}
