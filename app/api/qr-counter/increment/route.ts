import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body; // 'generated' or 'downloaded'

    if (!type || !['generated', 'downloaded'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "generated" or "downloaded"' },
        { status: 400 }
      );
    }

    // Update the counter based on type
    const updatePayload = 
      type === 'generated' 
        ? { total_generated: supabase.rpc('increment_generated') }
        : { total_downloaded: supabase.rpc('increment_downloaded') };

    // Simple update approach - increment by 1
    const columnToUpdate = type === 'generated' ? 'total_generated' : 'total_downloaded';

    // Get current value
    const { data: currentData, error: fetchError } = await supabase
      .from('qr_counter')
      .select(columnToUpdate)
      .single();

    if (fetchError) throw fetchError;

    // Increment and update
    const newValue = (currentData as Record<string, number>)[columnToUpdate] + 1;
    
    const { data, error } = await supabase
      .from('qr_counter')
      .update({ [columnToUpdate]: newValue, updated_at: new Date() })
      .eq('id', 1)
      .select();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error incrementing counter:', error);
    return NextResponse.json(
      { error: 'Failed to increment counter' },
      { status: 500 }
    );
  }
}
