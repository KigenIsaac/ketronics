import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const parsed = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), full_name: z.string().trim().min(1).max(100).optional() }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid signup details' }, { status: 400 });
    const { email, password, full_name } = parsed.data;
    
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
 
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user?.id ?? data.user?.id)
      .single();

    const out = NextResponse.json({ user, profile }, { status: 200 });
    return out;
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unexpected error' }, { status: 500 });
  }
}
