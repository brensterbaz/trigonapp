'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NRMSection {
  id: string
  code: string
  title: string
  sort_order: number
}

interface NRMRule {
  id: string
  section_id: string
  section_code: string
  section_title: string
  path: string
  level: number
  content: string
  unit: string | null
  examples: string | null
  notes: string | null
  depth: number
  parent_path: string | null
  child_count: number
}

export function NRM2CMSManager() {
  const [sections, setSections] = useState<NRMSection[]>([])
  const [rules, setRules] = useState<NRMRule[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<NRMRule | null>(null)
  const [addAsSibling, setAddAsSibling] = useState(false) // Track if adding as sibling
  const [editingRule, setEditingRule] = useState<NRMRule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSectionsLoading, setIsSectionsLoading] = useState(true)
  const { toast } = useToast()
  const addFormRef = useRef<HTMLFormElement>(null)
  const addSectionFormRef = useRef<HTMLFormElement>(null)
  const editFormRef = useRef<HTMLFormElement>(null)

  const fetchSections = useCallback(async () => {
    setIsSectionsLoading(true)
    try {
      const response = await fetch('/api/nrm-sections')
      if (response.ok) {
        const data = await response.json()
        setSections(data.sections || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load NRM2 sections',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast({
        title: 'Error',
        description: 'Failed to load NRM2 sections',
        variant: 'destructive',
      })
    } finally {
      setIsSectionsLoading(false)
    }
  }, [toast])

  const fetchRules = useCallback(async (sectionId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/nrm-rules?sectionId=${sectionId}`)
      if (response.ok) {
        const data = await response.json()
        const fetchedRules = (data.rules || []).map((rule: any) => ({
          ...rule,
          path: String(rule.path || ''),
          parent_path: rule.parent_path ? String(rule.parent_path) : null,
        }))
        setRules(fetchedRules)
        
        // Auto-expand all rules that have children so all child rules are visible
        const pathsToExpand = new Set<string>()
        fetchedRules.forEach((rule: NRMRule) => {
          if (rule.child_count > 0) {
            const pathStr = String(rule.path || '').trim()
            pathsToExpand.add(pathStr)
          }
        })
        
        setExpandedPaths(pathsToExpand)
      } else if (response.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You need admin privileges to manage NRM2 rules',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Fetch sections on mount
  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  // Fetch rules when section changes
  useEffect(() => {
    if (selectedSection) {
      fetchRules(selectedSection)
    }
  }, [selectedSection, fetchRules])

  const togglePath = (path: string) => {
    const pathStr = String(path || '').trim()
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(pathStr)) {
        next.delete(pathStr)
      } else {
        next.add(pathStr)
      }
      return next
    })
  }

  const handleAddRule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedSection) {
      toast({
        title: 'Error',
        description: 'Please select a section first',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Calculate path and level
    let newCode = (formData.get('code') as string)?.trim()
    const content = (formData.get('content') as string)?.trim()
    
    if (!newCode || !content) {
      toast({
        title: 'Error',
        description: 'Code and content are required',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    // Sanitize code: convert spaces to dots, remove invalid characters
    // Keep only alphanumeric characters and dots
    newCode = newCode
      .replace(/\s+/g, '.')  // Convert spaces to dots
      .replace(/[^a-zA-Z0-9.]/g, '')  // Remove invalid characters
      .replace(/\.{2,}/g, '.')  // Replace multiple consecutive dots with single dot
      .replace(/^\.+|\.+$/g, '')  // Remove leading/trailing dots
    
    if (!newCode) {
      toast({
        title: 'Error',
        description: 'Code must contain at least one alphanumeric character',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    // If adding as sibling, use the parent's parent_path; otherwise use the parent's path
    let basePath = ''
    let newLevel = 1
    
    if (selectedParent) {
      if (addAsSibling) {
        // Adding as sibling: use the parent's parent_path (or empty if it's a top-level rule)
        basePath = selectedParent.parent_path ? String(selectedParent.parent_path).trim() : ''
        // Sibling has the same level as the selected parent
        newLevel = selectedParent.level
      } else {
        // Adding as child: use the parent's path
        basePath = selectedParent.path ? String(selectedParent.path).trim() : ''
        // Child has level = parent level + 1
        const parentLevel = typeof selectedParent.level === 'number' ? selectedParent.level : 0
        newLevel = parentLevel + 1
      }
    }

    // Calculate path: append new code to base path
    const newPath = basePath ? `${basePath}.${newCode}` : newCode
    
    // Check if path already exists in current rules (client-side validation)
    const pathExists = rules.some(r => String(r.path || '').trim().toLowerCase() === newPath.toLowerCase())
    if (pathExists) {
      toast({
        title: 'Path already exists',
        description: addAsSibling
          ? `A rule with path "${newPath}" already exists. Please use a different code.`
          : `A rule with path "${newPath}" already exists. To add a sibling at the same level, click the rotated "+" button on the existing rule instead. Otherwise, use a different code.`,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    // Validate level doesn't exceed 4
    if (newLevel > 4) {
      toast({
        title: 'Error',
        description: 'Maximum hierarchy depth is 4 levels',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    // Validate level is at least 1
    if (newLevel < 1) {
      toast({
        title: 'Error',
        description: 'Invalid level calculation. Please try again.',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    // Calculate path depth for logging/debugging (but don't block on mismatch)
    const pathDepth = newPath.split('.').filter(p => p.length > 0).length
    
    // Log warning if level doesn't match path depth, but don't block creation
    // (Some existing rules might have incorrect levels, but we still want to allow new rules)
    if (newLevel !== pathDepth) {
      console.warn('Level mismatch detected (non-blocking):', {
        calculatedLevel: newLevel,
        pathDepth,
        path: newPath,
        selectedParentLevel: selectedParent?.level,
        basePath,
        addAsSibling,
        note: 'This is a warning only. Rule will be created with calculated level.',
      })
    }
    
    console.log('Creating rule with parent:', {
      selectedParent: selectedParent ? { 
        id: selectedParent.id,
        path: selectedParent.path, 
        level: selectedParent.level,
        parent_path: selectedParent.parent_path,
        levelType: typeof selectedParent.level
      } : null,
      addAsSibling,
      basePath,
      newCode,
      newPath,
      newLevel,
      pathDepth,
      validation: newLevel === pathDepth ? '✓ Match' : '⚠ Mismatch (non-blocking)',
    })

    // Get optional fields - convert empty strings to null
    const unit = (formData.get('unit') as string)?.trim() || null
    const examples = (formData.get('examples') as string)?.trim() || null
    const notes = (formData.get('notes') as string)?.trim() || null

    const data = {
      sectionId: selectedSection,
      path: newPath,
      level: newLevel,
      content: content,
      unit: unit,
      examples: examples,
      notes: notes,
    }

    console.log('Creating rule:', data)

    try {
      const response = await fetch('/api/admin/nrm-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('API Error:', responseData)
        
        // Provide helpful error message for path conflicts
        if (response.status === 409 && responseData.error?.includes('already exists')) {
          const errorMsg = addAsSibling
            ? `A rule with this path already exists. Please use a different code, or if you want to add a child, use the regular "+" button instead.`
            : `A rule with path "${newPath}" already exists. If you want to add a sibling at the same level, click the rotated "+" button on the existing rule instead. Otherwise, please use a different code.`
          throw new Error(errorMsg)
        }
        
        throw new Error(responseData.error || 'Failed to create rule')
      }

      console.log('Rule created successfully:', responseData)

      toast({
        title: 'Rule created',
        description: 'NRM2 rule has been added successfully',
      })

      // Close dialog and reset state first
      setIsAddDialogOpen(false)
      
      // If we added a child rule, expand the parent path so it's visible
      // If we added a sibling, expand the parent's parent path
      if (selectedParent) {
        const pathToExpand = addAsSibling && selectedParent.parent_path 
          ? String(selectedParent.parent_path).trim()
          : String(selectedParent.path || '').trim()
        setExpandedPaths(prev => {
          const next = new Set(prev)
          next.add(pathToExpand)
          return next
        })
      }
      
      setSelectedParent(null)
      setAddAsSibling(false)
      
      // Reset form if it exists
      if (addFormRef.current) {
        addFormRef.current.reset()
      }
      
      // Refresh rules list (non-blocking - don't wait for it)
      if (selectedSection) {
        fetchRules(selectedSection).catch(err => {
          console.error('Error refreshing rules after creation:', err)
          // Don't show error toast - rule was created successfully
        })
      }
    } catch (error) {
      console.error('Error creating rule:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create rule',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRule) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    // Get and trim values, convert empty strings to null
    const content = (formData.get('content') as string)?.trim()
    const unit = (formData.get('unit') as string)?.trim() || null
    const examples = (formData.get('examples') as string)?.trim() || null
    const notes = (formData.get('notes') as string)?.trim() || null

    if (!content) {
      toast({
        title: 'Error',
        description: 'Content is required',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    const data = {
      ruleId: editingRule.id,
      content: content,
      unit: unit,
      examples: examples,
      notes: notes,
    }

    console.log('Updating rule:', data)

    try {
      const response = await fetch('/api/admin/nrm-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('API Error:', responseData)
        throw new Error(responseData.error || 'Failed to update rule')
      }

      console.log('Rule updated successfully:', responseData)

      toast({
        title: 'Rule updated',
        description: 'NRM2 rule has been updated successfully',
      })

      setIsEditDialogOpen(false)
      setEditingRule(null)
      
      // Reset form
      if (editFormRef.current) {
        editFormRef.current.reset()
      }
      
      // Refresh rules list (non-blocking)
      if (selectedSection) {
        fetchRules(selectedSection).catch(err => {
          console.error('Error refreshing rules after update:', err)
        })
      }
    } catch (error) {
      console.error('Error updating rule:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update rule',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const code = (formData.get('code') as string)?.trim()
    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || null

    if (!code || !title) {
      toast({
        title: 'Error',
        description: 'Code and title are required',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/nrm-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          title,
          description,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('API Error:', responseData)
        throw new Error(responseData.error || 'Failed to create section')
      }

      toast({
        title: 'Section created',
        description: `${code} - ${title} has been added successfully.`,
      })

      setIsAddSectionDialogOpen(false)
      if (addSectionFormRef.current) {
        addSectionFormRef.current.reset()
      }

      // Refresh sections list
      await fetchSections()
    } catch (error) {
      console.error('Error creating section:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create section',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRule = async (ruleId: string, content: string) => {
    if (!confirm(`Delete "${content}"? This will also delete all child rules.`)) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/nrm-rules?ruleId=${ruleId}`, {
        method: 'DELETE',
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('API Error:', responseData)
        throw new Error(responseData.error || 'Failed to delete rule')
      }

      console.log('Rule deleted successfully')

      toast({
        title: 'Rule deleted',
        description: 'NRM2 rule has been removed',
      })

      // Refresh rules list (non-blocking)
      if (selectedSection) {
        fetchRules(selectedSection).catch(err => {
          console.error('Error refreshing rules after delete:', err)
        })
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete rule',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter rules to show only top-level or children of expanded paths
  const getVisibleRules = () => {
    // First, sort rules by level, then by path to ensure siblings are grouped together
    const sortedRules = [...rules].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      const pathA = String(a.path || '').trim()
      const pathB = String(b.path || '').trim()
      return pathA.localeCompare(pathB)
    })
    
    return sortedRules.filter(rule => {
      // Always show level 1 rules
      if (rule.level === 1) return true
      
      // Calculate the parent path based on level
      // For a rule at level N, the parent should be at level N-1
      const rulePath = String(rule.path || '').trim()
      const pathParts = rulePath.split('.').filter(p => p.length > 0)
      
      // Find the actual parent rule at level (rule.level - 1)
      // For siblings at the same level, they share the same parent
      const parentLevel = rule.level - 1
      
      // First, try to find parent by matching path segments up to parent level
      // For level 3 rule, parent should be at level 2
      // Take first (parentLevel) segments of the path
      const rulePathParts = rulePath.split('.').filter(p => p.length > 0)
      const parentPathFromSegments = rulePathParts.slice(0, parentLevel).join('.')
      
      // Look for parent rule at the correct level
      const parentRule = rules.find(r => {
        if (r.level !== parentLevel) return false
        const parentPath = String(r.path || '').trim()
        // Match by path segments or exact match
        return parentPath.toLowerCase() === parentPathFromSegments.toLowerCase() ||
               rulePath.toLowerCase().startsWith(parentPath.toLowerCase() + '.')
      })
      
      if (parentRule) {
        const parentPathStr = String(parentRule.path || '').trim()
        return expandedPaths.has(parentPathStr)
      }
      
      // Fallback: use stored parent_path
      const storedParentPath = String(rule.parent_path || '').trim()
      if (storedParentPath) {
        return expandedPaths.has(storedParentPath)
      }
      
      // If no parent found, show it (shouldn't happen but handle gracefully)
      return true
    })
  }

  const getIndentation = (level: number) => {
    return `${(level - 1) * 24}px`
  }

  const getLevelName = (level: number): string => {
    switch (level) {
      case 1:
        return 'Category (Level 1)'
      case 2:
        return 'Sub-Category (Level 2)'
      case 3:
        return 'Detail (Level 3)'
      case 4:
        return 'Specification (Level 4)'
      default:
        return 'Rule'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NRM2 CMS - Rule Management</CardTitle>
          <CardDescription>
            Add and edit NRM2 subcategories and detail sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Work Section</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddSectionDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
            <Select 
              value={selectedSection || ''} 
              onValueChange={setSelectedSection}
              disabled={isSectionsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isSectionsLoading ? "Loading sections..." : "Choose a section..."} />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.code} - {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sections.length === 0 && !isSectionsLoading && (
              <p className="text-sm text-destructive">
                No sections found. Click "Add Section" to create one.
              </p>
            )}
          </div>

          {selectedSection && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {rules.length} rules in this section
                </p>
                <Button
                  onClick={() => {
                    setSelectedParent(null)
                    setIsAddDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category (Level 1)
                </Button>
              </div>

              {/* Rules Tree */}
              <div className="border rounded-lg">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading rules...
                  </div>
                ) : getVisibleRules().length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No rules yet. Click &quot;Add Top-Level Rule&quot; to get started.
                  </div>
                ) : (
                  <div className="divide-y">
                    {getVisibleRules().map(rule => (
                      <div
                        key={rule.id}
                        className="p-3 hover:bg-accent transition-colors"
                        style={{ paddingLeft: `calc(12px + ${getIndentation(rule.level)})` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            {rule.child_count > 0 ? (
                              <button
                                onClick={() => togglePath(String(rule.path || ''))}
                                className="mt-1 hover:bg-accent rounded p-0.5"
                              >
                                {expandedPaths.has(String(rule.path || '')) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <div className="w-5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {rule.path}
                                </Badge>
                                <Badge variant="secondary">{getLevelName(rule.level)}</Badge>
                                {rule.unit && (
                                  <Badge variant="outline">{rule.unit}</Badge>
                                )}
                                {rule.child_count > 0 && (
                                  <Badge variant="outline">
                                    {rule.child_count} children
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 font-medium">{rule.content}</p>
                              {rule.examples && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Examples: {rule.examples}
                                </p>
                              )}
                              {rule.notes && (
                                <p className="mt-1 text-sm italic text-muted-foreground">
                                  {rule.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Show add child button if level is less than 4 (max depth) */}
                            {rule.level < 4 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedParent(rule)
                                  setAddAsSibling(false)
                                  setIsAddDialogOpen(true)
                                }}
                                title={`Add ${getLevelName(rule.level + 1)} as child`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Show add sibling button if not a top-level rule */}
                            {rule.level > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedParent(rule)
                                  setAddAsSibling(true)
                                  setIsAddDialogOpen(true)
                                }}
                                title={`Add ${getLevelName(rule.level)} as sibling`}
                              >
                                <Plus className="h-4 w-4 rotate-45" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingRule(rule)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRule(rule.id, rule.content)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Rule Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) {
            setSelectedParent(null)
            setAddAsSibling(false)
            // Reset form when dialog closes
            if (addFormRef.current) {
              addFormRef.current.reset()
            }
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <form ref={addFormRef} onSubmit={handleAddRule}>
            <DialogHeader>
              <DialogTitle>
                {selectedParent 
                  ? addAsSibling
                    ? `Add ${getLevelName(selectedParent.level)} (sibling)`
                    : `Add ${getLevelName(selectedParent.level + 1)}`
                  : 'Add Category (Level 1)'}
              </DialogTitle>
              <DialogDescription>
                {selectedParent 
                  ? addAsSibling
                    ? `Create a new ${getLevelName(selectedParent.level).toLowerCase()} at the same level as "${selectedParent.content}". The path will be automatically calculated.`
                    : `Create a new ${getLevelName(selectedParent.level + 1).toLowerCase()} under "${selectedParent.content}". The path will be automatically calculated.`
                  : 'Create a new Category (Level 1). The path will be automatically calculated.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code/Number *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g., 1, 2, detail, detail2 (alphanumeric and dots only)"
                  required
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  {selectedParent && (
                    <div className={`p-2 rounded ${addAsSibling ? 'bg-blue-50 dark:bg-blue-950' : 'bg-green-50 dark:bg-green-950'}`}>
                      <p className="font-medium">
                        {addAsSibling ? 'Adding as SIBLING' : 'Adding as CHILD'}
                      </p>
                      <p className="mt-1">
                        {addAsSibling
                          ? `Base path: ${selectedParent.parent_path || '(root)'} → Will create: ${selectedParent.parent_path ? `${selectedParent.parent_path}.` : ''}[your code]`
                          : `Parent: ${selectedParent.path} → Will create: ${selectedParent.path}.[your code]`}
                      </p>
                      {addAsSibling && (
                        <p className="mt-1 text-xs italic">
                          This will be at the same level ({getLevelName(selectedParent.level)}) as "{selectedParent.content}"
                        </p>
                      )}
                    </div>
                  )}
                  {!selectedParent && (
                    <p>Will create path: [your code] (spaces will be converted to dots)</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Description/Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="e.g., External walls, Windows and external doors"
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measurement</Label>
                <Input
                  id="unit"
                  name="unit"
                  placeholder="e.g., m², nr, m"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examples">Examples</Label>
                <Textarea
                  id="examples"
                  name="examples"
                  placeholder="Examples of this rule..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setSelectedParent(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingRule(null)
            // Reset form when dialog closes
            if (editFormRef.current) {
              editFormRef.current.reset()
            }
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <form ref={editFormRef} onSubmit={handleEditRule}>
            <DialogHeader>
              <DialogTitle>Edit Rule: {editingRule?.path}</DialogTitle>
              <DialogDescription>
                Update the rule details (path cannot be changed)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-content">Description/Content *</Label>
                <Textarea
                  id="edit-content"
                  name="content"
                  defaultValue={editingRule?.content}
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit of Measurement</Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  defaultValue={editingRule?.unit || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-examples">Examples</Label>
                <Textarea
                  id="edit-examples"
                  name="examples"
                  defaultValue={editingRule?.examples || ''}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={editingRule?.notes || ''}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingRule(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Rule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog 
        open={isAddSectionDialogOpen} 
        onOpenChange={(open) => {
          setIsAddSectionDialogOpen(open)
          if (!open && addSectionFormRef.current) {
            addSectionFormRef.current.reset()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <form ref={addSectionFormRef} onSubmit={handleAddSection}>
            <DialogHeader>
              <DialogTitle>Add New Work Section</DialogTitle>
              <DialogDescription>
                Create a new NRM2 work section. This section will appear in the Rule Selector and when adding items to projects.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="section-code">Code *</Label>
                <Input
                  id="section-code"
                  name="code"
                  placeholder="e.g., 42, 99, CUSTOM"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Section code (e.g., "01", "14", "42"). Must be unique.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-title">Title *</Label>
                <Input
                  id="section-title"
                  name="title"
                  placeholder="e.g., Custom Work Section"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Full name of the work section.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-description">Description</Label>
                <Textarea
                  id="section-description"
                  name="description"
                  placeholder="Optional description of this work section..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSectionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
