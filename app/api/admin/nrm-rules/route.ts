import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/nrm-rules
 * Fetch all NRM2 rules with hierarchy
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const sectionId = searchParams.get('sectionId')
  const parentPath = searchParams.get('parentPath')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!(profile as any)?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    let query = supabase
      .from('nrm_rules_hierarchy')
      .select('*')

    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    if (parentPath) {
      // Get children of a specific parent - use text pattern matching
      // Since paths are now text, we need to match paths that start with parentPath.
      // We'll filter in memory to get only immediate children (one level deeper)
      query = query.like('path', `${parentPath}.%`)
    }

    const { data: rules, error } = await query.order('path', { ascending: true })
    
    // If we have a parentPath, filter to only immediate children
    let filteredRules = rules || []
    if (parentPath && rules) {
      const parentDepth = parentPath.split('.').length
      filteredRules = rules.filter((rule: any) => {
        const rulePath = String(rule.path || '')
        const pathParts = rulePath.split('.')
        // Immediate child should have depth = parentDepth + 1
        return pathParts.length === parentDepth + 1 && rulePath.startsWith(`${parentPath}.`)
      })
    }

    if (error) {
      console.error('Error fetching rules:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Ensure paths are strings and parent_path is properly handled
    const processedRules = (filteredRules || rules || []).map((rule: any) => ({
      ...rule,
      path: String(rule.path || ''),
      parent_path: rule.parent_path ? String(rule.parent_path) : null,
    }))

    return NextResponse.json({ rules: processedRules })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

/**
 * POST /api/admin/nrm-rules
 * Create a new NRM2 rule
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!(profile as any)?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Validate required fields
    if (!body.sectionId || !body.content || !body.path || body.level === undefined) {
      console.error('Validation failed:', { body })
      return NextResponse.json(
        { error: 'sectionId, content, path, and level are required', received: body },
        { status: 400 }
      )
    }

    // Validate level is between 1 and 4
    if (body.level < 1 || body.level > 4) {
      return NextResponse.json(
        { error: 'Level must be between 1 and 4' },
        { status: 400 }
      )
    }

    // Validate path format (ltree compatible - alphanumeric and dots only)
    const pathRegex = /^[a-zA-Z0-9.]+$/
    if (!pathRegex.test(body.path)) {
      return NextResponse.json(
        { error: 'Path must contain only alphanumeric characters and dots' },
        { status: 400 }
      )
    }

    console.log('Creating rule with data:', {
      section_id: body.sectionId,
      path: body.path,
      level: body.level,
      content: body.content,
    })

    // Create the rule
    const { data: rule, error } = await supabase
      .from('nrm_rules')
      .insert({
        section_id: body.sectionId,
        path: body.path,
        level: body.level,
        content: body.content,
        unit: body.unit || null,
        measurement_logic: body.measurementLogic || {},
        coverage_rules: body.coverageRules || [],
        examples: body.examples || null,
        notes: body.notes || null,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Database error creating rule:', error)
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `A rule with path "${body.path}" already exists in this section` },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    console.log('Rule created successfully:', rule)
    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/nrm-rules
 * Update an existing NRM2 rule
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!(profile as any)?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!body.ruleId) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 })
    }

    // Build update object
    const updateData: Record<string, any> = {}
    if (body.content !== undefined) updateData.content = body.content
    if (body.unit !== undefined) updateData.unit = body.unit
    if (body.measurementLogic !== undefined) updateData.measurement_logic = body.measurementLogic
    if (body.coverageRules !== undefined) updateData.coverage_rules = body.coverageRules
    if (body.examples !== undefined) updateData.examples = body.examples
    if (body.notes !== undefined) updateData.notes = body.notes

    // Type assertion needed due to Supabase type inference limitations
    const { data: rule, error } = await (supabase
      .from('nrm_rules')
      .update(updateData as never)
      .eq('id', body.ruleId)
      .select()
      .single() as any)

    if (error) {
      console.error('Error updating rule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/nrm-rules
 * Delete an NRM2 rule
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const ruleId = searchParams.get('ruleId')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!(profile as any)?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!ruleId) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('nrm_rules')
      .delete()
      .eq('id', ruleId)

    if (error) {
      console.error('Error deleting rule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
