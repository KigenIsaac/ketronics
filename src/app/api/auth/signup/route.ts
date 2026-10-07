import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { getClientIp, consumeRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const parsed = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), full_name: z.string().trim().min(1).max(100).optional() }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid signup details' }, { status: 400 });
    const { email, password, full_name } = parsed.data;

    const ipAllowed = await consumeRateLimit(`auth-signup-ip:${getClientIp(req)}`, 5, 3600);
    const emailAllowed = await consumeRateLimit(`auth-signup-email:${email.toLowerCase()}`, 3, 3600);
    if (!ipAllowed || !emailAllowed) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });

    if (error) {
      console.error('Signup failed:', error);
      return NextResponse.json({ error: 'Unable to create account with these details' }, { status: 400 });
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
