import { runImport } from '@/lib/import-logic';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const authHeader = request.headers.get('authorization');

    // Security check: Verify Cron Secret
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const results = await runImport();
        return new Response(JSON.stringify({
            success: true,
            message: 'Import completed successfully',
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
