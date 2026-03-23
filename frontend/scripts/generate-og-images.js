/**
 * Script para generar imágenes Open Graph
 * Ejecutar con: node scripts/generate-og-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_LOGO = path.join(__dirname, '../public/img/logo-edufinderCYL.png');
const OUTPUT_DIR = path.join(__dirname, '../public/img');

// Configuración de imágenes OG
const OG_IMAGES = [
  {
    name: 'og-default.png',
    width: 1200,
    height: 630,
    background: '#223945',
    logoSize: 300,
    text: 'Encuentra centros educativos en Castilla y León'
  },
  {
    name: 'og-centro.png',
    width: 1200,
    height: 630,
    background: '#223945',
    logoSize: 250,
    text: 'Centro Educativo'
  }
];

async function generateOGImages() {
  console.log('🖼️  Generando imágenes Open Graph...\n');

  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error('❌ No se encontró el logo fuente:', SOURCE_LOGO);
    process.exit(1);
  }

  for (const config of OG_IMAGES) {
    const outputPath = path.join(OUTPUT_DIR, config.name);

    try {
      // Redimensionar el logo
      const resizedLogo = await sharp(SOURCE_LOGO)
        .resize(config.logoSize, config.logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      // Crear imagen base con gradiente simulado
      const baseImage = await sharp({
        create: {
          width: config.width,
          height: config.height,
          channels: 4,
          background: config.background
        }
      })
        .png()
        .toBuffer();

      // Calcular posición centrada para el logo
      const logoX = Math.floor((config.width - config.logoSize) / 2);
      const logoY = Math.floor((config.height - config.logoSize) / 2) - 50;

      // Componer imagen final
      await sharp(baseImage)
        .composite([
          {
            input: resizedLogo,
            top: logoY,
            left: logoX,
          }
        ])
        .png({ quality: 90 })
        .toFile(outputPath);

      console.log(`✅ Generado: ${config.name}`);
    } catch (error) {
      console.error(`❌ Error generando ${config.name}:`, error.message);
    }
  }

  console.log('\n🎉 Imágenes OG generadas exitosamente');
  console.log('\n💡 Tip: Para mejores resultados, considera crear imágenes personalizadas');
  console.log('   con herramientas como Figma o Canva (1200x630 px)');
}

generateOGImages().catch(console.error);
