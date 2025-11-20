import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Usa o helper que sabe ler/escrever cookies no App Router
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Se o Supabase exigir confirmação por e-mail, signUp pode não retornar session.
    // Nesse caso, não tratamos como 500 — informamos que a inscrição foi criada e
    // que o usuário deve confirmar por e-mail.
    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    if (!data.session) {
      // Usuário criado, mas sem sessão (p. ex. confirmação por e-mail necessária).
      return NextResponse.json(
        {
          message: 'Registration successful. Please check your email to confirm your account.',
          user: { id: data.user.id, email: data.user.email },
        },
        { status: 200 }
      );
    }

    // Se houver session, o helper já deverá ter escrito os cookies.
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: { id: data.user.id, email: data.user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
