import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type DimensionUpdate = Database['public']['Tables']['dimension_sheets']['Update']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    const body = (await request.json()) as DimensionUpdate

    const { data: dimension, error } = await supabase
      .from('dimension_sheets')
      .update(body as DimensionUpdate)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating dimension:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dimension })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to update dimension' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('dimension_sheets')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting dimension:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to delete dimension' }, { status: 500 })
  }
}

