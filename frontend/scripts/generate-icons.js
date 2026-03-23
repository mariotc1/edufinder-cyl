/**
 * Script para generar iconos PWA desde el logo original
 * Ejecutar con: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = path.join(__dirname, '../public/img/logo-edufinderCYL.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Tamaños de iconos necesarios para PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');

  // Verificar que existe la imagen fuente
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ No se encontró la imagen fuente:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Crear directorio de salida si no existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generar cada tamaño
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    try {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({ quality: 100 })
        .toFile(outputPath);

      console.log(`✅ Generado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generando icon-${size}x${size}.png:`, error.message);
    }
  }

  // Generar favicon adicional
  try {
    const faviconPath = path.join(OUTPUT_DIR, 'favicon-32x32.png');
    await sharp(SOURCE_IMAGE)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ quality: 100 })
      .toFile(faviconPath);
    console.log('✅ Generado: favicon-32x32.png');
  } catch (error) {
    console.error('❌ Error generando favicon:', error.message);
  }

  console.log('\n🎉 Iconos generados exitosamente en:', OUTPUT_DIR);
  console.log('\n📱 Recuerda crear también las capturas de pantalla para mejorar la experiencia de instalación:');
  console.log('   - /public/screenshots/desktop.png (1280x720)');
  console.log('   - /public/screenshots/mobile.png (390x844)');
}

generateIcons().catch(console.error);
