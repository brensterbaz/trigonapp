import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type DimensionInsert = Database['public']['Tables']['dimension_sheets']['Insert']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bqItemId = searchParams.get('bqItemId')

  if (!bqItemId) {
    return NextResponse.json({ error: 'BQ Item ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Verify access via RLS policies implicitly
    const { data: dimensions, error } = await supabase
      .from('dimension_sheets')
      .select('*')
      .eq('bq_item_id', bqItemId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching dimensions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dimensions })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dimensions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()

    // Basic validation
    if (!body.bq_item_id) {
      return NextResponse.json({ error: 'BQ Item ID is required' }, { status: 400 })
    }

    const dimData: DimensionInsert = {
      bq_item_id: body.bq_item_id,
      description: body.description,
      timesing: body.timesing,
      dim_a: body.dim_a,
      dim_b: body.dim_b,
      dim_c: body.dim_c,
      waste: body.waste,
      is_deduction: body.is_deduction || false,
      sort_order: body.sort_order
    }
    const { data: dimension, error } = await supabase
      .from('dimension_sheets')
      .insert(dimData)
      .select()
      .single()

    if (error) {
      console.error('Error creating dimension:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dimension }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create dimension' }, { status: 500 })
  }
}

