// src/scripts/db-import.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const EXPORT_DIR = path.join(__dirname, '../../../db-backup');
const COLLECTIONS = ['users', 'exercises', 'userresponses', 'aianalyses', 'learningpaths'];
const DB_NAME = 'app-estudio';

const run = () => {
  if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`❌ No existe la carpeta de backup: ${EXPORT_DIR}`);
    console.log('💡 Primero corre: npm run db:export');
    process.exit(1);
  }

  console.log('📥 Importando base de datos...\n');

  let success = 0;

  for (const collection of COLLECTIONS) {
    const inputFile = path.join(EXPORT_DIR, `${collection}.json`);

    if (!fs.existsSync(inputFile)) {
      console.warn(`⚠️  No se encontró archivo para: ${collection} — omitiendo`);
      continue;
    }

    // Verificar que el archivo no esté vacío o sea solo []
    const content = fs.readFileSync(inputFile, 'utf8').trim();
    if (content === '[]' || content === '') {
      console.log(`⏭️  ${collection} — vacío, omitiendo`);
      success++;
      continue;
    }

    const cmd = `mongoimport --uri="${process.env.MONGODB_URI}" --db="${DB_NAME}" --collection="${collection}" --file="${inputFile}" --jsonArray --drop`;

    try {
      execSync(cmd, { stdio: 'pipe' });
      console.log(`✅ ${collection} importado correctamente`);
      success++;
    } catch (err) {
      console.error(`❌ Error importando ${collection}:`, err.message);
    }
  }

  console.log(`\n🎉 Import completado: ${success}/${COLLECTIONS.length} colecciones`);
};

run();