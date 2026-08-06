import sharp from 'sharp';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Paths to generated images (copy from artifacts dir)
const ICON_SRC = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\bed47f2c-057f-4f0e-8bb1-1eb6fbb611e3\\app_icon_512_1785996370064.png';
const MASKABLE_SRC = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\bed47f2c-057f-4f0e-8bb1-1eb6fbb611e3\\app_icon_maskable_1785996386684.png';

async function run() {
  // Create icons directory
  if (!existsSync(iconsDir)) {
    await mkdir(iconsDir, { recursive: true });
  }

  // Regular icons
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of sizes) {
    await sharp(ICON_SRC)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✅ icon-${size}x${size}.png`);
  }

  // Maskable icon (512x512)
  await sharp(MASKABLE_SRC)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  console.log('✅ icon-maskable-512x512.png');

  // Apple touch icon (180x180)
  await sharp(ICON_SRC)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png');

  // Favicon 32x32
  await sharp(ICON_SRC)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✅ favicon-32x32.png');

  console.log('\n🎉 Toutes les icônes générées dans public/icons/');
}

run().catch(console.error);
