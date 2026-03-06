const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

async function runImport() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        db: { schema: 'grupo_daytona' }
    });

    let privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim();
    let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    // 1. Auto-detección de formato JSON (por si el usuario pegó el archivo completo)
    if (privateKey.startsWith('{')) {
        try {
            const credentials = JSON.parse(privateKey);
            privateKey = credentials.private_key || privateKey;
            email = credentials.client_email || email;
        } catch (e) {
            console.error('Error parseando JSON de credenciales:', e);
        }
    }

    // 2. Limpieza Nuclear del PEM (Reconstrucción total)
    privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';

    if (privateKey.includes(header) && privateKey.includes(footer)) {
        const startIndex = privateKey.indexOf(header) + header.length;
        const endIndex = privateKey.indexOf(footer);
        const base64Body = privateKey
            .substring(startIndex, endIndex)
            .replace(/[^A-Za-z0-9+/=]/g, ''); // Solo caracteres Base64

        const chunks = base64Body.match(/.{1,64}/g);
        privateKey = `${header}\n${chunks ? chunks.join('\n') : ''}\n${footer}`;
    }

    const serviceAccountAuth = new JWT({
        email: email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);

    // Guardamos métricas para el debug (usando una propiedad interna del doc o similar)
    doc._debug = {
        keyType: (process.env.GOOGLE_PRIVATE_KEY || '').startsWith('{') ? 'JSON' : 'PEM',
        finalKeyLength: privateKey.length,
        emailUsed: email ? (email.substring(0, 10) + '...') : 'missing'
    };

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
        const ROW_LEADS = 29;
        const ROW_CONTACTADOS = 30;
        const ROW_CITAS_AGENDADAS = 31;
        const ROW_CITAS_EFECTIVAS = 32;
        const ROW_VENTAS_NUEVOS = 36;
        const ROW_VENTAS_SEMINUEVOS = 37;
        const ROW_VISITAS = 11;
        const ROW_PRUEBAS = 15;
        const ROW_FINANCIERA = 18;
        const ROW_APROBADOS_FINANCIERA = 19;
        const ROW_AVALUOS = 25;
        const ROW_VENTAS_PROBABLES = 40;
        const ROW_APARTADOS = 42;

        for (let dia = 1; dia <= 31; dia++) {
            try {
                const vNuevos = sheet.getCell(ROW_VENTAS_NUEVOS, dia).value || 0;
                const vSemis = sheet.getCell(ROW_VENTAS_SEMINUEVOS, dia).value || 0;

                // Nuevas métricas de funnel
                const leads = sheet.getCell(ROW_LEADS, dia).value || 0;
                const contactados = sheet.getCell(ROW_CONTACTADOS, dia).value || 0;
                const citasAgendadas = sheet.getCell(ROW_CITAS_AGENDADAS, dia).value || 0;
                const citasEfectivas = sheet.getCell(ROW_CITAS_EFECTIVAS, dia).value || 0;
                const visitas = sheet.getCell(ROW_VISITAS, dia).value || 0;
                const pruebas = sheet.getCell(ROW_PRUEBAS, dia).value || 0;
                const financiera = sheet.getCell(ROW_FINANCIERA, dia).value || 0;
                const aprobados = sheet.getCell(ROW_APROBADOS_FINANCIERA, dia).value || 0;
                const avaluos = sheet.getCell(ROW_AVALUOS, dia).value || 0;
                const probables = sheet.getCell(ROW_VENTAS_PROBABLES, dia).value || 0;
                const apartados = sheet.getCell(ROW_APARTADOS, dia).value || 0;

                if (vNuevos > 0 || vSemis > 0 || leads > 0 || visitas > 0) {
                    recordsToInsert.push({
                        fecha: `2026-03-${String(dia).padStart(2, '0')}`,
                        agencia: nombreAgencia,
                        ventas_nuevos: parseInt(vNuevos),
                        ventas_seminuevos: parseInt(vSemis),
                        leads_recibidos: parseInt(leads),
                        citas_efectivas: parseInt(citasEfectivas),
                        total_visitas_piso: parseInt(visitas),
                        pruebas_manejo_total: parseInt(pruebas),
                        solicitudes_financiera: parseInt(financiera),
                        aprobados_financiera: parseInt(aprobados),
                        avaluos_total: parseInt(avaluos),
                        ventas_probables_48_hrs: parseInt(probables),
                        apartados_dia: parseInt(apartados)
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

async function getSheetLabels(sheetTitle) {
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim()
        .replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    let key = privateKey;
    if (privateKey.includes(header) && privateKey.includes(footer)) {
        const body = privateKey.substring(privateKey.indexOf(header) + header.length, privateKey.indexOf(footer)).replace(/[^A-Za-z0-9+/=]/g, '');
        const chunks = body.match(/.{1,64}/g);
        key = `${header}\n${chunks.join('\n')}\n${footer}`;
    }

    const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) return [];

    await sheet.loadCells('A1:B100');
    const labels = [];
    for (let i = 0; i < 100; i++) {
        const val = sheet.getCell(i, 1).value; // Columna B
        if (val) labels.push({ row: i, label: val });
    }
    return labels;
}

module.exports = { runImport, getSheetLabels };
