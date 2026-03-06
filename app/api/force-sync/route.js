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
            debug: {
                ...debugInfo,
                cleanedMetrics: results.debug // Pasamos las métricas internas si las hay
            }
        })
    } catch (error) {
        console.error('Manual Sync Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            debug: debugInfo,
            hint: 'Si el error persiste, intenta pegar el CONTENIDO COMPLETO del JSON de Google Service Account en la variable GOOGLE_PRIVATE_KEY (incluyendo las llaves {}). Mi nuevo código ahora detecta y procesa ambos formatos.'
        }, { status: 500 })
    }
}
