import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const parsed = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    const { email, password } = parsed.data;
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data) {
      console.error('Login failed:', error);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profile role/metadata to return to client
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user?.id ?? data.user?.id)
      .single();

    const out = NextResponse.json({ user, profile }, { status: 200 });

    return out;
  } catch (err: unknown) {
    console.error('Authentication endpoint failed:', err);
    return NextResponse.json({ error: 'Authentication request failed' }, { status: 500 });
  }
}
