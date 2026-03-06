import { runImport } from '@/lib/import-logic';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = await runImport();
        return new Response(JSON.stringify({
            success: true,
            message: 'Sincronización manual completada con éxito',
            results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Import error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
