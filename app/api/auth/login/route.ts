import { NextRequest, NextResponse } from 'next/server';
// 1. TROCA DE CLIENTE: Usar o cliente auxiliar para rotas
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; 
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// NOTA: A Chave de Serviço não é mais necessária aqui, 
// pois o login é feito com a chave pública.
// A URL ainda é lida do ambiente.

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

        // 2. CRIAÇÃO DO CLIENTE: O cliente é criado e sabe ler/escrever cookies.
        const supabase = createRouteHandlerClient({ cookies });

        // 3. O LOGIN: O método signInWithPassword salva os cookies automaticamente.
        // Log do email tentando fazer login (não logamos a senha)
        console.log('Attempting login for:', email);
        const signInResult = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // Log completo para debugging (não inclui senhas)
        console.log('signInResult:', JSON.stringify(signInResult));

        const { error } = signInResult;

        if (error) {
            console.error('Login Supabase error:', error.message || error);

            // Caso comum: usuário ainda não confirmou o e-mail
            if ((error as any).code === 'email_not_confirmed') {
                return NextResponse.json(
                    { error: 'Email not confirmed', details: error.message || error },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                { error: 'Invalid email or password', details: error.message || error },
                { status: 401 }
            );
        }

        // 4. SUCESSO: Agora que os cookies foram salvos, redirecionamos.
        // O Supabase Helpers salvou os cookies sob os nomes padronizados (sb-access-token, etc.).
        
        // Se você quiser retornar o usuário, você pode buscar:
        // const { data: { user } } = await supabase.auth.getUser();

        return NextResponse.json(
            { message: 'Login successful' }, 
            { status: 200 } // Retorna 200, pois o redirecionamento é feito no cliente
        );
        
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}