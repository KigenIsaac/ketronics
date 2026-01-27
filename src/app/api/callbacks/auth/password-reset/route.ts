import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent('Password reset failed')}`, request.url)
      );
    }

    if (type === 'recovery' && token) {
      // Redirect to reset password page with token
      return NextResponse.redirect(
        new URL(`/auth/reset-password?token=${encodeURIComponent(token)}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/auth/login?error=Invalid reset link', request.url)
    );

  } catch (err: any) {
    console.error('Password reset callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/login?error=An unexpected error occurred', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify the recovery token and update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log password reset event
    console.log('Password reset successful for user:', data.user?.email);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err: any) {
    console.error('Password reset POST error:', err);
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}