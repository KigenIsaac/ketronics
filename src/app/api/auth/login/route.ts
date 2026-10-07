import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { getClientIp, consumeRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const parsed = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    const { email, password } = parsed.data;

    const ipAllowed = await consumeRateLimit(`auth-login-ip:${getClientIp(req)}`, 10, 900);
    const emailAllowed = await consumeRateLimit(`auth-login-email:${email.toLowerCase()}`, 5, 900);
    if (!ipAllowed || !emailAllowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data) {
      console.error('Login failed:', error);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user?.id ?? data.user?.id)
      .single();

    return NextResponse.json({ user, profile }, { status: 200 });
  } catch (err: unknown) {
    console.error('Authentication endpoint failed:', err);
    return NextResponse.json({ error: 'Authentication request failed' }, { status: 500 });
  }
}
