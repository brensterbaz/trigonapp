import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type BQItemUpdate = Database['public']['Tables']['bill_of_quantities']['Update']

/**
 * PATCH /api/bq-items/[id]
 * Update a BQ item
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the BQ item to verify ownership
    const { data: bqItem, error: fetchError } = await supabase
      .from('bill_of_quantities')
      .select('id, project_id, projects!inner(organization_id)')
      .eq('id', params.id)
      .single()

    if (fetchError || !bqItem) {
      return NextResponse.json({ error: 'BQ item not found' }, { status: 404 })
    }

    // Verify the project belongs to the user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    const projectOrgId = (bqItem as any).projects?.organization_id
    if (profile?.organization_id !== projectOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If section_id is provided, verify it belongs to this project
    if (body.section_id !== undefined) {
      if (body.section_id) {
        const { data: section } = await supabase
          .from('project_sections')
          .select('id')
          .eq('id', body.section_id)
          .eq('project_id', (bqItem as any).project_id)
          .maybeSingle()

        if (!section) {
          return NextResponse.json(
            { error: 'Section not found or does not belong to this project' },
            { status: 400 }
          )
        }
      }
    }

    // Validate unit if provided
    if (body.unit !== undefined && (!body.unit || body.unit.trim() === '')) {
      return NextResponse.json(
        { error: 'Unit cannot be empty' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Partial<{
      quantity: number
      unit: string
      rate: number | null
      description_custom: string | null
      notes: string | null
      section_id: string | null
    }> = {}
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.unit !== undefined) updateData.unit = body.unit.trim()
    if (body.rate !== undefined) updateData.rate = body.rate || null
    if (body.description_custom !== undefined) updateData.description_custom = body.description_custom || null
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.section_id !== undefined) updateData.section_id = body.section_id || null

    // Update the BQ item
    const { data: updatedItem, error } = await supabase
      .from('bill_of_quantities')
      // @ts-expect-error - Supabase type inference limitation
      .update(updateData)
      .eq('id', params.id)
      .select('*, nrm_rules(*), project_sections(*)')
      .single()

    if (error) {
      console.error('Error updating BQ item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bqItem: updatedItem })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to update BQ item' }, { status: 500 })
  }
}

/**
 * DELETE /api/bq-items/[id]
 * Delete a BQ item
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  try {
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the BQ item to verify ownership
    const { data: bqItem, error: fetchError } = await supabase
      .from('bill_of_quantities')
      .select('id, project_id, projects!inner(organization_id)')
      .eq('id', params.id)
      .single()

    if (fetchError || !bqItem) {
      return NextResponse.json({ error: 'BQ item not found' }, { status: 404 })
    }

    // Verify the project belongs to the user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    const projectOrgId = (bqItem as any).projects?.organization_id
    if (profile?.organization_id !== projectOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the BQ item
    const { error } = await supabase
      .from('bill_of_quantities')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting BQ item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to delete BQ item' }, { status: 500 })
  }
}

