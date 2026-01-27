import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider') || 'google'; // google, facebook, etc.

    if (error) {
      console.error(`OAuth callback error for ${provider}:`, error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(`Login with ${provider} failed`)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/login?error=Authorization code missing', request.url)
      );
    }

    const supabaseClient = await createSupabaseServerClient();

    // Exchange the code for a session
    const { data, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL('/auth/login?error=Failed to complete authentication', request.url)
      );
    }

    // Create or update user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name ||
                    `${data.user.user_metadata?.given_name || ''} ${data.user.user_metadata?.family_name || ''}`.trim(),
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
          provider: provider,
          email_verified: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation/update error:', profileError);
      }

      // Log successful OAuth login
      console.log(`User logged in via ${provider}:`, data.user.email);
    }

    // Redirect to dashboard or appropriate page
    const redirectTo = state || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));

  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/login?error=Authentication failed', request.url)
    );
  }
}

// Handle OAuth provider-specific callbacks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, code, state } = body;

    const supabaseClient = await createSupabaseServerClient();

    let authMethod;

    switch (provider) {
      case 'google':
        authMethod = supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${request.nextUrl.origin}/api/callbacks/auth/oauth?provider=google`,
            queryParams: { state }
          }
        });
        break;

      case 'facebook':
        authMethod = supabaseClient.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: `${request.nextUrl.origin}/api/callbacks/auth/oauth?provider=facebook`,
            queryParams: { state }
          }
        });
        break;

      case 'github':
        authMethod = supabaseClient.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${request.nextUrl.origin}/api/callbacks/auth/oauth?provider=github`,
            queryParams: { state }
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const { data, error } = await authMethod;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.url });

  } catch (err: any) {
    console.error('OAuth POST error:', err);
    return NextResponse.json({ error: 'OAuth initialization failed' }, { status: 500 });
  }
}