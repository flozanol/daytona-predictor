require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function debug() {
    const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
    await doc.loadInfo();
    console.log('Sheets found:', doc.sheetsByIndex.map(s => s.title));

    const resTabs = ['Res Dic', 'Res Ene26', 'Res Feb 26'];
    for (const title of resTabs) {
        const sheet = doc.sheetsByTitle[title];
        if (sheet) {
            console.log(`\n--- ${title} ---`);
            await sheet.loadCells('A1:E20');
            for (let r = 0; r < 20; r++) {
                let row = [];
                for (let c = 0; c < 5; c++) {
                    row.push(sheet.getCell(r, c).value);
                }
                console.log(row.join(' | '));
            }
        }
    }
}

debug().catch(console.error);
