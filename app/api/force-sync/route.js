import { runImport } from '@/lib/import-logic'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const debugInfo = {
        hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasKey: !!rawKey,
        rawLength: rawKey.length,
        hasHeader: rawKey.includes('-----BEGIN PRIVATE KEY-----'),
        hasFooter: rawKey.includes('-----END PRIVATE KEY-----'),
        hasEscapedNewlines: rawKey.includes('\\n'),
        hasRealNewlines: rawKey.includes('\n'),
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.substring(0, 10) + '...') : 'missing'
    }

    try {
        console.log('Manual Sync Triggered...', debugInfo)
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
            debug: debugInfo,
            hint: 'EPERM o DECODER suelen ser error de formato en la GOOGLE_PRIVATE_KEY. Asegúrate de que pegaste la llave completa, sin comillas, y que las cabeceras BEGIN/END están presentes.'
        }, { status: 500 })
    }
}
