import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const setCookies: Array<any> = [];

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Failed to sign in' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profile role/metadata to return to client
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user?.id ?? data.user?.id)
      .single();

    const out = NextResponse.json({ user, profile }, { status: 200 });

    // Attach any cookies the supabase client asked to set
    for (const c of setCookies) {
      const { name, value, options } = c;
      if (value) {
        // @ts-ignore
        out.cookies.set(name, value, options ?? {});
      } else {
        // @ts-ignore
        out.cookies.delete(name, options ?? {});
      }
    }

    return out;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
