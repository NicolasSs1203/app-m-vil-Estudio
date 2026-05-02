// src/scripts/db-export.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const EXPORT_DIR = path.join(__dirname, '../../../db-backup');
const COLLECTIONS = ['users', 'exercises', 'userresponses', 'aianalyses', 'learningpaths'];
const DB_NAME = 'app-estudio';

const run = () => {
  // Crear carpeta de backup si no existe
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }

  console.log('📦 Exportando base de datos...\n');

  let success = 0;

  for (const collection of COLLECTIONS) {
    const outputFile = path.join(EXPORT_DIR, `${collection}.json`);
    const cmd = `mongoexport --uri="${process.env.MONGODB_URI}" --db="${DB_NAME}" --collection="${collection}" --out="${outputFile}" --jsonArray`;

    try {
      execSync(cmd, { stdio: 'pipe' });
      const stats = fs.statSync(outputFile);
      console.log(`✅ ${collection} → ${outputFile} (${(stats.size / 1024).toFixed(2)} KB)`);
      success++;
    } catch (err) {
      console.error(`❌ Error exportando ${collection}:`, err.message);
    }
  }

  console.log(`\n🎉 Export completado: ${success}/${COLLECTIONS.length} colecciones`);
  console.log(`📁 Archivos guardados en: ${EXPORT_DIR}`);
};

run();