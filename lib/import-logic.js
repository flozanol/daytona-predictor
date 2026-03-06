const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

async function runImport() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        db: { schema: 'grupo_daytona' }
    });

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const results = {
        processed: [],
        skipped: [],
        errors: []
    };

    const agencias = ['Acura', 'GWM Cuernavaca', 'Infiniti', 'Mazda Vallejo', 'Mazda Zapata', 'Kia', 'Hyundai', 'Suzuki', 'Used Cars'];
    const mesesAProcesar = [
        { label: 'Diciembre 2025', month: 11, year: 2025 },
        { label: 'Enero 2026', month: 0, year: 2026 },
        { label: 'Febrero 2026', month: 1, year: 2026 }
    ];

    for (const nombreAgencia of agencias) {
        const sheet = doc.sheetsByTitle[nombreAgencia];
        if (!sheet) {
            results.skipped.push(nombreAgencia);
            continue;
        }

        await sheet.loadCells();
        const ROW_VENTAS_NUEVOS = 12;
        const ROW_VENTAS_SEMINUEVOS = 13;

        for (const periodo of mesesAProcesar) {
            const recordsToInsert = [];
            for (let dia = 1; dia <= 31; dia++) {
                try {
                    const ventasNuevos = sheet.getCell(ROW_VENTAS_NUEVOS, dia).value || 0;
                    const ventasSeminuevos = sheet.getCell(ROW_VENTAS_SEMINUEVOS, dia).value || 0;

                    if (ventasNuevos > 0 || ventasSeminuevos > 0) {
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
                    continue;
                }
            }

            if (recordsToInsert.length > 0) {
                const { error } = await supabase
                    .from('registros_agencias')
                    .upsert(recordsToInsert, { onConflict: 'fecha,agencia' });

                if (error) {
                    results.errors.push(`${nombreAgencia} (${periodo.label}): ${error.message}`);
                } else {
                    results.processed.push(`${nombreAgencia} (${periodo.label}): ${recordsToInsert.length} registros`);
                }
            }
        }
    }
    return results;
}

module.exports = { runImport };
