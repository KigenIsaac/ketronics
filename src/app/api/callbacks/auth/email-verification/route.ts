import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    // Handle error cases
    if (error) {
      console.error('Email verification error:', error, error_description);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error_description || 'Verification failed')}`, request.url)
      );
    }

    // Handle different verification types
    if (type === 'signup' || type === 'email_confirmation') {
      // For Supabase email verification
      const supabaseClient = await createSupabaseServerClient();

      // Verify the token
      const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
        token_hash: token || '',
        type: 'email',
      });

      if (verifyError) {
        console.error('Email verification failed:', verifyError);
        return NextResponse.redirect(
          new URL('/auth/login?error=Verification failed. Please try again.', request.url)
        );
      }

      // Update user profile to mark as verified
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Failed to update profile verification status:', updateError);
        }

        // Send welcome email or notification
        console.log('User verified successfully:', data.user.email);
      }

      // Redirect to login with success message
      return NextResponse.redirect(
        new URL('/auth/login?message=Email verified successfully! Please sign in.', request.url)
      );
    }

    // Handle password recovery
    if (type === 'recovery') {
      return NextResponse.redirect(
        new URL(`/auth/reset-password?token=${token}`, request.url)
      );
    }

    // Default redirect for unknown types
    return NextResponse.redirect(
      new URL('/auth/login?message=Verification completed.', request.url)
    );

  } catch (err: any) {
    console.error('Email verification callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/login?error=An unexpected error occurred. Please try again.', request.url)
    );
  }
}

// Alternative POST method for some email providers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, type, email } = body;

    const supabaseClient = await createSupabaseServerClient();

    if (type === 'email_confirmation') {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Update profile verification status
      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        user: data.user
      });
    }

    return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });

  } catch (err: any) {
    console.error('Email verification POST error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}