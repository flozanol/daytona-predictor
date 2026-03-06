import { runImport } from '@/lib/import-logic'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log('Manual Sync Triggered...')
        const results = await runImport()
        return NextResponse.json({
            success: true,
            message: 'Sincronización completada',
            results
        })
    } catch (error) {
        console.error('Manual Sync Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
