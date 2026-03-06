const fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Manual .env parsing
const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
    const match = env.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].replace(/["']/g, '').trim() : null;
};

const email = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
const key = getEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
const sheetId = getEnv('SPREADSHEET_ID');

async function run() {
    const auth = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['MG Cuajimalpa'];
    await sheet.loadCells('A1:A100');

    console.log('ROW_MAPPING_START');
    for (let i = 0; i < 100; i++) {
        const val = sheet.getCell(i, 0).value;
        if (val) console.log(`${i}: ${val}`);
    }
    console.log('ROW_MAPPING_END');
}

run().catch(console.error);
