import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sectionId = searchParams.get('sectionId')
  const parentPath = searchParams.get('parentPath')
  const level = searchParams.get('level')

  const supabase = await createClient()

  try {
    // If we have a parent path, we need special handling for ltree
    if (parentPath && sectionId) {
      const parentPathTrimmed = String(parentPath || '').trim()
      
      console.log('[NRM Rules API] Fetching children for parent:', parentPathTrimmed)
      
      // Fetch ALL rules for this section with hierarchy info to find parent and children
      // Use the hierarchy view to get parent_path information
      const { data: allSectionRules, error: allError } = await supabase
        .from('nrm_rules_hierarchy')
        .select('*')
        .eq('section_id', sectionId)
        .order('path')
      
      if (allError) {
        console.error('[NRM Rules API] Database error:', allError)
        return NextResponse.json({ error: allError.message }, { status: 500 })
      }
      
      // Convert all paths to strings and ensure parent_path is a string
      const allRules = (allSectionRules || []).map((rule: any) => ({
        ...rule,
        path: String(rule.path || ''), // Ensure path is a string
        parent_path: rule.parent_path ? String(rule.parent_path) : null, // Ensure parent_path is a string
      }))
      
      console.log('[NRM Rules API] Total rules in section:', allRules.length)
      console.log('[NRM Rules API] All paths in section:', allRules.map((r: any) => ({ path: r.path, level: r.level, content: r.content?.substring(0, 40) })))
      
      // Find the parent rule by matching path (case-insensitive)
      const parentRule = allRules.find((r: any) => {
        const rulePath = String(r.path || '').trim()
        return rulePath.toLowerCase() === parentPathTrimmed.toLowerCase() || 
               rulePath === parentPathTrimmed
      })
      
      let childLevel: number
      if (parentRule && parentRule.level !== undefined) {
        // Use the actual parent level from database
        childLevel = parentRule.level + 1
        console.log('[NRM Rules API] Found parent rule - level:', parentRule.level, 'path:', parentRule.path, '→ child level:', childLevel)
      } else {
        // Fallback: calculate from path depth
        const parentDepth = parentPathTrimmed.split('.').length
        childLevel = parentDepth
        console.warn('[NRM Rules API] ⚠ Parent rule not found!')
        console.warn('[NRM Rules API] Searched for:', parentPathTrimmed)
        console.warn('[NRM Rules API] Available paths:', allRules.map((r: any) => ({ path: String(r.path), level: r.level })))
        console.warn('[NRM Rules API] Using path depth fallback:', parentDepth, 'as child level')
      }
      
      // Filter to rules at the child level
      const childLevelRules = allRules.filter((r: any) => r.level === childLevel)
      console.log('[NRM Rules API] Rules at level', childLevel, ':', childLevelRules.length)
      console.log('[NRM Rules API] Level', childLevel, 'paths:', childLevelRules.map((r: any) => r.path))
      
      // Filter to only include immediate children of parentPath
      // A child rule must:
      // 1. Have level = parentLevel + 1
      // 2. Have path that starts with parentPath + "."
      // 3. For siblings at the same level, we need to find rules that share the same parent_path
      //    For actual children, path depth should be one more than parent
      
      // First, try to find rules by matching parent_path from the hierarchy view
      // This is more reliable than path depth matching
      const filteredRules = childLevelRules.filter((rule: any) => {
        const rulePath = String(rule.path || '').trim()
        const rulePathLower = rulePath.toLowerCase()
        const parentPathLower = parentPathTrimmed.toLowerCase()
        const expectedPrefix = `${parentPathTrimmed}.`
        const expectedPrefixLower = `${parentPathLower}.`
        
        // Check if path starts with parentPath. (case-insensitive)
        const startsWithPrefix = rulePathLower.startsWith(expectedPrefixLower)
        
        if (!startsWithPrefix) {
          return false
        }
        
        // For immediate children, check if the rule's parent_path matches the parent's path
        // This handles cases where path depth doesn't match level due to sibling creation
        const ruleParentPath = rule.parent_path ? String(rule.parent_path).trim().toLowerCase() : null
        
        // If parent_path is available and matches, it's definitely a child
        if (ruleParentPath && ruleParentPath === parentPathLower) {
          console.log('[NRM Rules API] ✓ Matched child by parent_path:', rulePath, 'level:', rule.level, 'parent_path:', ruleParentPath)
          return true
        }
        
        // Fallback: check path depth (for rules without parent_path or as secondary check)
        const parentPathParts = parentPathTrimmed.split('.').filter(p => p.length > 0)
        const rulePathParts = rulePath.split('.').filter(p => p.length > 0)
        const expectedChildDepth = parentPathParts.length + 1
        
        // For immediate children, path should start with parent path and have one more segment
        // But also allow for cases where siblings were created with different path structures
        // Check if removing the last segment gives us the parent path
        const rulePathWithoutLast = rulePathParts.slice(0, -1).join('.')
        const pathMatchesParent = rulePathWithoutLast.toLowerCase() === parentPathLower ||
                                 rulePathParts.slice(0, parentPathParts.length).join('.').toLowerCase() === parentPathLower
        
        // Allow if path depth matches expected OR if path structure indicates it's a child
        const depthMatches = rulePathParts.length === expectedChildDepth || 
                            rulePathParts.length === expectedChildDepth + 1
        
        if (pathMatchesParent && depthMatches) {
          console.log('[NRM Rules API] ✓ Matched child by path structure:', rulePath, 'level:', rule.level, 'depth:', rulePathParts.length, 'expected:', expectedChildDepth)
          return true
        }
        
        // Last resort: if path starts with parent and level is correct, include it
        // This handles edge cases where path structure is unusual
        if (startsWithPrefix && rule.level === childLevel) {
          console.log('[NRM Rules API] ✓ Matched child by prefix and level (fallback):', rulePath, 'level:', rule.level)
          return true
        }
        
        return false
      })
      
      console.log('[NRM Rules API] Found children:', filteredRules.length, 'out of', childLevelRules.length, 'level', childLevel, 'rules')
      
      // If no exact matches found, try a more lenient approach
      if (filteredRules.length === 0 && childLevelRules.length > 0) {
        console.warn('[NRM Rules API] ⚠ No exact matches found, trying lenient matching...')
        
        // Try matching just the first part of the path (in case of format differences)
        const parentFirstPart = parentPathTrimmed.split('.')[0]
        const lenientMatches = childLevelRules.filter((rule: any) => {
          const rulePath = String(rule.path || '').trim()
          const pathParts = rulePath.split('.')
          return pathParts[0] === parentFirstPart && pathParts.length === childLevel
        })
        
        if (lenientMatches.length > 0) {
          console.warn('[NRM Rules API] Found', lenientMatches.length, 'lenient matches:', lenientMatches.map((r: any) => r.path))
          // Use lenient matches as fallback
          return NextResponse.json({ rules: lenientMatches })
        }
      }
      
      if (filteredRules.length > 0) {
        console.log('[NRM Rules API] Child paths:', filteredRules.map((r: any) => r.path))
      } else {
        console.warn('[NRM Rules API] ⚠ No children found!')
        console.warn('[NRM Rules API] Parent:', parentPathTrimmed)
        console.warn('[NRM Rules API] Expected pattern:', `${parentPathTrimmed}.*`)
        console.warn('[NRM Rules API] All level', childLevel, 'paths:', childLevelRules.map((r: any) => r.path))
        console.warn('[NRM Rules API] All paths in section (for debugging):', allRules.map((r: any) => ({ path: r.path, level: r.level })))
      }
      
      return NextResponse.json({ rules: filteredRules })
    }

    // Standard query for top-level or no parent
    // Cast path to text for proper JSON serialization
    let query = supabase
      .from('nrm_rules')
      .select('id, section_id, path, level, content, unit, measurement_logic, coverage_rules, examples, notes, created_at')
      .order('path')

    // Filter by section if provided
    if (sectionId) {
      query = query.eq('section_id', sectionId)
      console.log('[NRM Rules API] Filtering by sectionId:', sectionId)
    }

    // Filter by level if provided (for top-level fetch)
    if (level) {
      const levelNum = parseInt(level)
      query = query.eq('level', levelNum)
      console.log('[NRM Rules API] Filtering by level:', levelNum)
    }

    const { data, error } = await query

    if (error) {
      console.error('[NRM Rules API] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Convert ltree paths to strings explicitly
    const rules = (data || []).map((rule: any) => ({
      ...rule,
      path: String(rule.path || ''), // Ensure path is a string
    }))

    console.log('[NRM Rules API] Found rules:', rules.length, 'for sectionId:', sectionId, 'level:', level)
    if (rules.length > 0) {
      console.log('[NRM Rules API] Sample paths:', rules.slice(0, 3).map((r: any) => ({ path: r.path, level: r.level, content: r.content })))
    } else {
      console.warn('[NRM Rules API] No rules found! Check:')
      console.warn('  - Section ID:', sectionId)
      console.warn('  - Level filter:', level)
      console.warn('  - User authenticated:', !!supabase)
    }

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

