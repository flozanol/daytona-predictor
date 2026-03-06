require('dotenv').config();
const { runImport } = require('./lib/import-logic');

async function main() {
    console.log('🚀 Iniciando importación manual...');
    try {
        const results = await runImport();
        console.log('✅ Proceso terminado.');
        console.log('Resumen:', JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('❌ Error fatal:', err);
    }
}

main();
