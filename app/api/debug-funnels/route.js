import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim();
        const auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
        await doc.loadInfo();

        const results = {};
        const sampleAgencies = ['MG Cuajimalpa', 'KIA Interlomas', 'Acura'];

        for (const title of sampleAgencies) {
            const sheet = doc.sheetsByTitle[title];
            if (!sheet) continue;

            await sheet.loadCells('A1:B60');
            const labels = [];
            for (let r = 0; r < 60; r++) {
                const val = sheet.getCell(r, 0).value;
                if (val) labels.push({ row: r, text: val });
            }
            results[title] = labels;
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
