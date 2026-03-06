require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

// 1. Configurar Supabase con el esquema "grupo_daytona"
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    db: { schema: 'grupo_daytona' }
});

async function processSpreadsheet() {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    console.log(`Conectado a: ${doc.title}`);

    // Lista de agencias basadas en tus pestañas
    const agencias = ['Acura', 'GWM Cuernavaca', 'Infiniti', 'Mazda Vallejo', 'Mazda Zapata', 'Kia', 'Hyundai', 'Suzuki', 'Used Cars'];
    const mesesAProcesar = [
        { label: 'Diciembre 2025', month: 11, year: 2025 },
        { label: 'Enero 2026', month: 0, year: 2026 },
        { label: 'Febrero 2026', month: 1, year: 2026 }
    ];

    for (const nombreAgencia of agencias) {
        const sheet = doc.sheetsByTitle[nombreAgencia];
        if (!sheet) {
            console.warn(`⚠️  No se encontró la pestaña: ${nombreAgencia}`);
            continue;
        }

        console.log(`--- Procesando Agencia: ${nombreAgencia} ---`);
        await sheet.loadCells();

        // Nota: El usuario indicó que buscará las filas 13 y 14 (Ventas Nuevos y Seminuevos)
        // El índice de getCell es 0-based, por lo que fila 13 es índice 12.
        const ROW_VENTAS_NUEVOS = 12;
        const ROW_VENTAS_SEMINUEVOS = 13;

        for (const periodo of mesesAProcesar) {
            console.log(`   📅 Periodo: ${periodo.label}`);
            const recordsToInsert = [];

            // Días en columnas (asumiendo que empiezan en la columna 1, índice 1)
            for (let dia = 1; dia <= 31; dia++) {
                try {
                    // Intentamos obtener el valor del día. Si no es un número entre 1-31, frenamos o saltamos.
                    // El usuario usa el bucle 'dia' directamente como índice de columna.
                    const ventasNuevos = sheet.getCell(ROW_VENTAS_NUEVOS, dia).value || 0;
                    const ventasSeminuevos = sheet.getCell(ROW_VENTAS_SEMINUEVOS, dia).value || 0;

                    if (ventasNuevos > 0 || ventasSeminuevos > 0) {
                        // Formatear fecha: YYYY-MM-DD
                        const monthStr = String(periodo.month + 1).padStart(2, '0');
                        const dayStr = String(dia).padStart(2, '0');
                        const fecha = `${periodo.year}-${monthStr}-${dayStr}`;

                        recordsToInsert.push({
                            fecha: fecha,
                            agencia: nombreAgencia,
                            ventas_nuevos: parseInt(ventasNuevos),
                            ventas_seminuevos: parseInt(ventasSeminuevos)
                        });
                    }
                } catch (e) {
                    // Si nos pasamos de columnas o hay error, continuamos
                    continue;
                }
            }

            if (recordsToInsert.length > 0) {
                // Usamos upsert para evitar duplicados si se corre varias veces
                const { error } = await supabase
                    .from('registros_agencias')
                    .upsert(recordsToInsert, { onConflict: 'fecha,agencia' });

                if (error) {
                    console.error(`    ❌ Error en ${nombreAgencia} (${periodo.label}):`, error.message);
                } else {
                    console.log(`    ✅ Insertados/Actualizados ${recordsToInsert.length} registros.`);
                }
            }
        }
        console.log(`--- Finalizada: ${nombreAgencia} ---\n`);
    }
}

processSpreadsheet().catch(err => {
    console.error('❌ Error fatal:', err);
});
