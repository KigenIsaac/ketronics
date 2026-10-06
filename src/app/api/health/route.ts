import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { status: 'degraded', database: 'unavailable', latency_ms: Date.now() - startedAt },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      database: 'ok',
      latency_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: 'degraded', database: 'unavailable', latency_ms: Date.now() - startedAt },
      { status: 503 }
    );
  }
}
