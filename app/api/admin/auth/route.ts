import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * POST /api/admin/auth
 * Reads the admin_passkey from qr_counter (id = 1) and compares it
 * with the submitted password. Sets a session cookie on success.
 *
 * DELETE /api/admin/auth
 * Clears the admin session cookie (logout).
 */

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    // Read the passkey stored in the qr_counter row (service-role bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('qr_counter')
      .select('admin_passkey')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Could not read admin passkey from database.' },
        { status: 500 },
      );
    }

    if (!data.admin_passkey) {
      return NextResponse.json(
        { error: 'Admin passkey not set. Edit row 1 in the qr_counter table and set admin_passkey.' },
        { status: 500 },
      );
    }

    if (password !== data.admin_passkey) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
