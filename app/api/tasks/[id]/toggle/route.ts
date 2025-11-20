import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: currentTask, error: selectError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Toggle - select currentTask result:', { currentTask, selectError });

    if (selectError) {
      console.error('Select currentTask error:', selectError);
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }

    if (!currentTask) {
      console.warn('Toggle - task not found or not owned by user', { taskId: params.id, userId: user.id });
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        completed: !currentTask.completed,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !task) {
      console.error('Toggle task error:', error);
      return NextResponse.json(
        { error: 'Failed to toggle task' },
        { status: 500 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
