import { runImport } from '@/lib/import-logic'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log('Manual Sync Triggered...')

        // Debug check for critical vars
        const debugInfo = {
            hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.substring(0, 5) + '...') : 'missing',
            hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
            keyStart: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.substring(0, 30) : 'missing',
            hasSheetId: !!process.env.SPREADSHEET_ID
        }
        console.log('Env Debug Info:', debugInfo)

        const results = await runImport()
        return NextResponse.json({
            success: true,
            message: 'Sincronización completada',
            results,
            debug: debugInfo
        })
    } catch (error) {
        console.error('Manual Sync Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            hint: 'EPERM o DECODER suelen ser error de formato en la GOOGLE_PRIVATE_KEY'
        }, { status: 500 })
    }
}
