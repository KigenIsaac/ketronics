import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json();
    const response = NextResponse.json({ ok: true });
    
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
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
