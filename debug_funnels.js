require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function debugFunnels() {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim();
    const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
    await doc.loadInfo();

    const sampleAgencia = 'MG Cuajimalpa'; // Example sheet
    const sheet = doc.sheetsByTitle[sampleAgencia];

    if (!sheet) {
        console.log(`Sheet "${sampleAgencia}" not found.`);
        return;
    }

    await sheet.loadCells('A1:C50'); // Look at first few rows/cols for labels
    console.log(`--- Labels in ${sampleAgencia} ---`);
    for (let r = 0; r < 50; r++) {
        const label = sheet.getCell(r, 0).value;
        if (label) {
            console.log(`Row ${r}: ${label}`);
        }
    }
}

debugFunnels().catch(console.error);
