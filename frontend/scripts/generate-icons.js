/**
 * Script para generar iconos PWA y splash screens
 * Ejecutar con: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = path.join(__dirname, '../public/img/logo-edufinderCYL.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const SPLASH_DIR = path.join(__dirname, '../public/splash');

const WHITE = { r: 255, g: 255, b: 255 };

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const SPLASH_SCREENS = [
  { width: 1170, height: 2532, name: 'iphone-12-pro' },
  { width: 1179, height: 2556, name: 'iphone-14-pro' },
  { width: 1284, height: 2778, name: 'iphone-12-pro-max' },
  { width: 1290, height: 2796, name: 'iphone-14-pro-max' },
  { width: 1125, height: 2436, name: 'iphone-x' },
  { width: 1242, height: 2688, name: 'iphone-xs-max' },
  { width: 828, height: 1792, name: 'iphone-xr' },
  { width: 750, height: 1334, name: 'iphone-8' },
  { width: 640, height: 1136, name: 'iphone-se' },
  { width: 2048, height: 2732, name: 'ipad-pro-12' },
  { width: 1668, height: 2388, name: 'ipad-pro-11' },
  { width: 1640, height: 2360, name: 'ipad-air' },
  { width: 1620, height: 2160, name: 'ipad-10' },
  { width: 1536, height: 2048, name: 'ipad-9' },
  { width: 1488, height: 2266, name: 'ipad-mini' },
];

/**
 * Genera un icono PWA con el logo grande y fondo blanco
 */
async function generateIcon(size, outputPath) {
  // Logo ocupa 92% del espacio para que sea grande y visible
  const logoSize = Math.floor(size * 0.92);
  const padding = Math.floor((size - logoSize) / 2);

  const logoBuffer = await sharp(SOURCE_IMAGE)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: WHITE
    })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: WHITE
    }
  })
    .composite([{ input: logoBuffer, left: padding, top: padding }])
    .png({ quality: 100 })
    .toFile(outputPath);
}

/**
 * Crea un SVG con gradiente vertical
 */
function createGradientSVG(width, height) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eff6ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `);
}

/**
 * Genera splash screen con gradiente azul claro (como la app)
 */
async function generateSplashScreen(screen, outputPath) {
  // Logo grande y visible (35% del ancho)
  const logoSize = Math.min(Math.floor(screen.width * 0.35), 400);

  const logoBuffer = await sharp(SOURCE_IMAGE)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  // Posición centrada, un poco arriba del centro
  const left = Math.floor((screen.width - logoSize) / 2);
  const top = Math.floor((screen.height - logoSize) / 2) - Math.floor(screen.height * 0.08);

  // Crear fondo con gradiente
  const gradientSvg = createGradientSVG(screen.width, screen.height);

  await sharp(gradientSvg)
    .composite([{ input: logoBuffer, left, top }])
    .png({ quality: 90 })
    .toFile(outputPath);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   EduFinder CYL - Generador de Assets PWA');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Verificar imagen fuente
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ No se encontró:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Crear directorios
  [OUTPUT_DIR, SPLASH_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Generar iconos
  console.log('📱 Generando iconos PWA...');
  for (const size of ICON_SIZES) {
    try {
      await generateIcon(size, path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));
      console.log(`   ✅ icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`   ❌ icon-${size}x${size}.png -`, error.message);
    }
  }

  // Generar favicon
  console.log('\n🔖 Generando favicon...');
  try {
    await generateIcon(32, path.join(OUTPUT_DIR, 'favicon-32x32.png'));
    console.log('   ✅ favicon-32x32.png');
  } catch (error) {
    console.error('   ❌ favicon -', error.message);
  }

  // Generar splash screens
  console.log('\n📱 Generando splash screens (gradiente azul claro)...');
  for (const screen of SPLASH_SCREENS) {
    try {
      await generateSplashScreen(screen, path.join(SPLASH_DIR, `splash-${screen.name}.png`));
      console.log(`   ✅ splash-${screen.name}.png`);
    } catch (error) {
      console.error(`   ❌ splash-${screen.name}.png -`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✨ Assets generados correctamente');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
