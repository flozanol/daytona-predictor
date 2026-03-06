const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

async function runImport() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        db: { schema: 'grupo_daytona' }
    });

    let privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim();

    // Si la llave viene con comillas (común en Vercel si se pegó tal cual), las quitamos
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
    }

    // Normalizamos saltos de línea literales (\n como texto) a saltos reales
    privateKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const results = {
        processed: [],
        skipped: [],
        errors: []
    };

    const agencias = [
        'Acura', 'GWM Cuernavaca', 'GWM Iztapalapa',
        'Honda Cuajimalpa', 'Honda Interlomas',
        'KIA Interlomas', 'KIA Iztapalapa',
        'MG Cuajimalpa', 'MG Interlomas', 'MG Iztapalapa', 'MG Santa Fe'
    ];

    // 1. PROCESAR MARZO (Datos Diarios de 11 pestañas)
    for (const nombreAgencia of agencias) {
        const sheet = doc.sheetsByTitle[nombreAgencia];
        if (!sheet) {
            results.skipped.push(`${nombreAgencia} (Tab Diaria Marzo no encontrada)`);
            continue;
        }

        await sheet.loadCells();
        const recordsToInsert = [];
        const ROW_VENTAS_NUEVOS = 12;
        const ROW_VENTAS_SEMINUEVOS = 13;

        for (let dia = 1; dia <= 31; dia++) {
            try {
                const vNuevos = sheet.getCell(ROW_VENTAS_NUEVOS, dia).value || 0;
                const vSemis = sheet.getCell(ROW_VENTAS_SEMINUEVOS, dia).value || 0;

                if (vNuevos > 0 || vSemis > 0) {
                    recordsToInsert.push({
                        fecha: `2026-03-${String(dia).padStart(2, '0')}`,
                        agencia: nombreAgencia,
                        ventas_nuevos: parseInt(vNuevos),
                        ventas_seminuevos: parseInt(vSemis)
                    });
                }
            } catch (e) { continue; }
        }

        if (recordsToInsert.length > 0) {
            const { error } = await supabase
                .from('registros_agencias')
                .upsert(recordsToInsert, { onConflict: 'fecha,agencia' });
            if (!error) results.processed.push(`${nombreAgencia} (Marzo): ${recordsToInsert.length} días`);
        }
    }

    // 2. PROCESAR HISTÓRICOS (Res Dic, Res Ene26, Res Feb 26)
    const resumenes = [
        { title: 'Res Dic', month: 11, year: 2025 },
        { title: 'Res Ene26', month: 0, year: 2026 },
        { title: 'Res Feb 26', month: 1, year: 2026 }
    ];

    for (const res of resumenes) {
        const sheet = doc.sheetsByTitle[res.title];
        if (!sheet) {
            results.skipped.push(res.title);
            continue;
        }

        await sheet.loadCells('A1:Z100'); // Cargamos un rango amplio para buscar
        const recordsToInsert = [];

        // Buscamos cada agencia en las filas de la pestaña de resumen
        for (const nombreAgencia of agencias) {
            for (let r = 0; r < 100; r++) {
                const cellValue = sheet.getCell(r, 0).value; // Asumimos Columna A para nombres
                if (cellValue && String(cellValue).includes(nombreAgencia)) {
                    // Si encuentra la agencia, asumimos columnas B y C para totales (ajustable)
                    const vNuevosTotal = sheet.getCell(r, 1).value || 0;
                    const vSemisTotal = sheet.getCell(r, 2).value || 0;

                    if (vNuevosTotal > 0 || vSemisTotal > 0) {
                        recordsToInsert.push({
                            fecha: `${res.year}-${String(res.month + 1).padStart(2, '0')}-01`, // Fecha dummy para totales
                            agencia: nombreAgencia,
                            ventas_nuevos: parseInt(vNuevosTotal),
                            ventas_seminuevos: parseInt(vSemisTotal)
                        });
                    }
                    break;
                }
            }
        }

        if (recordsToInsert.length > 0) {
            const { error } = await supabase
                .from('registros_agencias')
                .upsert(recordsToInsert, { onConflict: 'fecha,agencia' });
            if (!error) results.processed.push(`${res.title}: ${recordsToInsert.length} agencias`);
        }
    }

    return results;
}

module.exports = { runImport };
