import { NextRequest, NextResponse } from 'next/server';
// Importação essencial para rotas do App Router
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; 
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// ---------------------------------------------
// FUNÇÃO GET (LISTAR TAREFAS)
// ---------------------------------------------

export async function GET(request: NextRequest) {
    try {
        // 1. Cria o cliente AUTHENTICADO (lê o cookie e autentica o usuário)
        const supabase = createRouteHandlerClient({ cookies });
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized', details: authError?.message },
                { status: 401 }
            );
        }

        // 2. O usuário está autenticado, usa o cliente normal (supabase) para a seleção
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('order', { ascending: true });

        if (error) {
            console.error('Fetch tasks error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch tasks', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(tasks || []);
    } catch (error) {
        console.error('Get tasks error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ---------------------------------------------
// FUNÇÃO POST (CRIAR NOVA TAREFA)
// ---------------------------------------------

export async function POST(request: NextRequest) {
    try {
        // 1. Cria o cliente AUTHENTICADO para verificar o usuário
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            // Se o login não foi bem-sucedido (AuthSessionMissingError resolvido no Login Route)
            console.log('ERRO [1] - AUTORIZAÇÃO:', authError);
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description = '', scheduledFor } = body;

        // VALIDAÇÃO E FORMATAÇÃO (MANTIDA)
        if (!title || title.trim() === '') {
            return NextResponse.json(
                { error: 'Task title is required' },
                { status: 400 }
            );
        }

        const trimmedTitle = title.trim();
        const formattedTitle = trimmedTitle.charAt(0).toUpperCase() + trimmedTitle.slice(1);
        const trimmedDescription = description.trim();
        const formattedDescription = trimmedDescription.length > 0
            ? trimmedDescription.charAt(0).toUpperCase() + trimmedDescription.slice(1)
            : '';

        // OBTÉM A ORDEM (USANDO CLIENTE AUTHENTICADO)
        const { data: maxOrderTask } = await supabase
            .from('tasks')
            .select('order')
            .eq('user_id', user.id)
            .order('order', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextOrder = (maxOrderTask?.order ?? 0) + 1;

        const taskData: any = {
            title: formattedTitle,
            description: formattedDescription,
            user_id: user.id,
            completed: false,
            order: nextOrder,
        };

        if (scheduledFor) {
            taskData.scheduled_for = new Date(scheduledFor).toISOString();
        }

        // NOVO PRINT: O que será enviado para o Supabase
        console.log('DADOS ENVIADOS [2]:', taskData);
        
        // 2. INSERÇÃO: CRIA O CLIENTE ADMINISTRATIVO EM RUNTIME E VALIDA ENV
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        let insertResult: { data: any; error: any } | null = null;

        if (supabaseUrl && supabaseServiceRoleKey) {
            // Se tivermos a chave de serviço, use o cliente admin
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
            insertResult = await supabaseAdmin
                .from('tasks')
                .insert([taskData])
                .select()
                .single();
        } else {
            // Sem chave de serviço: tente usar o cliente autenticado (RLS pode permitir)
            console.warn('SUPABASE_SERVICE_ROLE_KEY not set — attempting insert with authenticated client (RLS).');
            insertResult = await supabase
                .from('tasks')
                .insert([taskData])
                .select()
                .single();
        }

        const { data: newTask, error } = insertResult || { data: null, error: { message: 'Insert failed' } };

        // NOVO PRINT: Resultado do Supabase
        if (error || !newTask) {
            console.error('ERRO [3] - SUPABASE FALHOU:', error);
            return NextResponse.json(
                { error: 'Failed to create task', details: error?.message },
                { status: 500 }
            );
        }
        
        console.log('SUCESSO [4] - TAREFA CRIADA:', newTask);
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error('ERRO [5] - EXCEÇÃO INTERNA:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}