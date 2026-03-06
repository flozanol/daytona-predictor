require('dotenv').config();
const { runImport } = require('./lib/import-logic');

async function main() {
    console.log('🚀 Iniciando Importación Profunda (Bodega v2)...');
    try {
        const results = await runImport();
        console.log('\n✅ Importación completada con éxito:');
        console.log('-----------------------------------');
        results.processed.forEach(p => console.log(`  - ${p}`));
        if (results.skipped.length > 0) {
            console.log('\n⌛ Saltados:');
            results.skipped.forEach(s => console.log(`  - ${s}`));
        }
        if (results.errors.length > 0) {
            console.log('\n❌ Errores:');
            results.errors.forEach(e => console.error(`  - ${e}`));
        }
        console.log('\n📡 Datos sincronizados con Supabase.');
    } catch (error) {
        console.error('\n💥 Error fatal durante la importación:');
        console.error(error);
        process.exit(1);
    }
}

main();
