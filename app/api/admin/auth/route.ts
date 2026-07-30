import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

function normalizeEnvHash(value: string) {
  const trimmed = value.trim();
  // If someone pasted quotes into the env value itself, strip a single matching pair.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function looksLikeBcryptHash(value: string) {
  // Common bcrypt formats: $2a$, $2b$, $2y$ with a 2-digit cost.
  // We intentionally do NOT enforce a specific cost.
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

function decodeBase64ToUtf8(value: string) {
  try {
    return Buffer.from(value, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

/**
 * POST /api/admin/auth
 * Compares submitted password with env-provided bcrypt hash.
 * Sets a session cookie on success.
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

    const rawHashB64 = process.env.ADMIN_MASTER_PASSWORD_HASH_B64;
    const rawHash = process.env.ADMIN_MASTER_PASSWORD_HASH;

    let hash = '';
    if (rawHashB64 && rawHashB64.trim()) {
      hash = normalizeEnvHash(decodeBase64ToUtf8(normalizeEnvHash(rawHashB64)));
      if (!hash) {
        return NextResponse.json(
          { error: 'Invalid password hash configuration. ADMIN_MASTER_PASSWORD_HASH_B64 is not valid base64.' },
          { status: 500 },
        );
      }
    } else if (rawHash !== undefined) {
      hash = normalizeEnvHash(rawHash);
      if (!hash) {
        // Next.js loads .env via dotenv-expand, which treats $FOO as variable expansion.
        // Bcrypt hashes start with $2a$ / $2b$ / $2y$, so unescaped hashes in .env often expand to an empty string.
        return NextResponse.json(
          {
            error:
              'Admin password hash is set but empty. If you stored a bcrypt hash in .env, you must escape each $ as \\$ (e.g. \\$2b\\$10\\$...) OR set ADMIN_MASTER_PASSWORD_HASH_B64 (recommended) to a base64-encoded bcrypt hash.',
          },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Admin password not configured. Set ADMIN_MASTER_PASSWORD_HASH (or ADMIN_MASTER_PASSWORD_HASH_B64).' },
        { status: 500 },
      );
    }

    if (!looksLikeBcryptHash(hash)) {
      return NextResponse.json(
        {
          error:
            'Invalid password hash configuration. ADMIN_MASTER_PASSWORD_HASH must be a bcrypt hash like $2b$10$... (any cost is allowed). If you set it in a shell, be sure to quote it so $ characters are not expanded.',
        },
        { status: 500 },
      );
    }

    let isValid = false;
    try {
      isValid = await bcrypt.compare(String(password), hash);
    } catch {
      return NextResponse.json(
        { error: 'Invalid password hash configuration.' },
        { status: 500 },
      );
    }
    if (!isValid) {
      return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
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
  response.cookies.delete({ name: 'admin_session', path: '/' });
  return response;
}
