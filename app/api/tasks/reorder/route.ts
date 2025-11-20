import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
  const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskOrders } = body;

    if (!Array.isArray(taskOrders)) {
      return NextResponse.json(
        { error: 'taskOrders must be an array' },
        { status: 400 }
      );
    }

    const updates = taskOrders.map(({ id, order }) =>
      supabase
        .from('tasks')
        .update({ order })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
