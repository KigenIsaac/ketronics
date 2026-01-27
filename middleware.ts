import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Cookie adapter for Supabase server client to read & write cookies in middleware
  const cookies = {
    get: (name: string) => {
      const c = req.cookies.get(name);
      if (!c) return undefined;
      // NextRequest.cookies.get may return a cookie object
      return typeof c === 'object' ? (c as any).value : c;
    },
    set: (name: string, value: string, options?: Record<string, any>) => {
      // Use NextResponse cookies API to set cookie
      // @ts-ignore - NextResponse cookies typings vary by Next.js versions
      res.cookies.set(name, value, options);
    },
    remove: (name: string, options?: Record<string, any>) => {
      // @ts-ignore
      res.cookies.delete(name, options);
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protect admin routes (only allow users with role 'manager')
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Re-authenticate the user for security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile || (profile as any).role !== 'manager') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect customer dashboard (requires authenticated session)
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};