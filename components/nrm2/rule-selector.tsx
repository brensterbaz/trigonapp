'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface NrmSection {
  id: string
  code: string
  title: string
  sort_order: number
}

interface NrmRule {
  id: string
  section_id: string
  path: string
  level: number
  content: string
  unit: string | null
  coverage_rules: string[] | null
  notes: string | null
  measurement_logic?: any
  examples?: string | null
}

interface RuleSelectorProps {
  onRuleSelected?: (rule: NrmRule) => void
}

export function RuleSelector({ onRuleSelected }: RuleSelectorProps) {
  const [sections, setSections] = useState<NrmSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [level1Rules, setLevel1Rules] = useState<NrmRule[]>([])
  const [level2Rules, setLevel2Rules] = useState<NrmRule[]>([])
  const [level3Rules, setLevel3Rules] = useState<NrmRule[]>([])
  const [selectedLevel1, setSelectedLevel1] = useState<string>('')
  const [selectedLevel2, setSelectedLevel2] = useState<string>('')
  const [selectedLevel3, setSelectedLevel3] = useState<string>('')
  const [selectedRule, setSelectedRule] = useState<NrmRule | null>(null)
  const [loading, setLoading] = useState({
    sections: true,
    level1: false,
    level2: false,
    level3: false,
  })

  // Fetch sections on mount
  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/nrm-sections')
      const data = await response.json()
      setSections(data.sections || [])
    } catch (error) {
      console.error('Failed to fetch sections:', error)
    } finally {
      setLoading((prev) => ({ ...prev, sections: false }))
    }
  }

  const fetchLevel1Rules = async (sectionId: string) => {
    setLoading((prev) => ({ ...prev, level1: true }))
    try {
      const url = `/api/nrm-rules?sectionId=${sectionId}&level=1`
      console.log('[RuleSelector] Fetching Level 1 from:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[RuleSelector] API error:', response.status, errorData)
        throw new Error(errorData.error || `Failed to fetch: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[RuleSelector] Level 1 response:', {
        rulesCount: data.rules?.length || 0,
        hasRules: Array.isArray(data.rules),
        rules: data.rules?.slice(0, 3) // Show first 3 for debugging
      })
      
      const rules = data.rules || []
      setLevel1Rules(rules)
      setLevel2Rules([])
      setLevel3Rules([])
      setSelectedLevel1('')
      setSelectedLevel2('')
      setSelectedLevel3('')
      setSelectedRule(null)
      
      if (rules.length === 0) {
        console.warn('[RuleSelector] No level 1 rules found for section:', sectionId)
      }
    } catch (error) {
      console.error('[RuleSelector] Failed to fetch level 1 rules:', error)
      setLevel1Rules([])
    } finally {
      setLoading((prev) => ({ ...prev, level1: false }))
    }
  }

  const fetchLevel2Rules = async (sectionId: string, parentPath: string) => {
    setLoading((prev) => ({ ...prev, level2: true }))
    console.log('[RuleSelector] Fetching Level 2:', { sectionId, parentPath })
    try {
      const url = `/api/nrm-rules?sectionId=${sectionId}&parentPath=${encodeURIComponent(parentPath)}`
      console.log('[RuleSelector] URL:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[RuleSelector] Level 2 API error:', response.status, errorData)
        throw new Error(errorData.error || `Failed to fetch level 2: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[RuleSelector] Level 2 response:', {
        rulesCount: data.rules?.length || 0,
        hasRules: Array.isArray(data.rules),
        rules: data.rules?.slice(0, 3)
      })
      
      const rules = data.rules || []
      setLevel2Rules(rules)
      setLevel3Rules([])
      setSelectedLevel2('')
      setSelectedLevel3('')
      setSelectedRule(null)
      
      if (rules.length === 0) {
        console.warn('[RuleSelector] No level 2 rules found for parent:', parentPath)
      }
    } catch (error) {
      console.error('[RuleSelector] Failed to fetch level 2 rules:', error)
      setLevel2Rules([])
    } finally {
      setLoading((prev) => ({ ...prev, level2: false }))
    }
  }

  const fetchLevel3Rules = async (sectionId: string, parentPath: string) => {
    setLoading((prev) => ({ ...prev, level3: true }))
    console.log('[RuleSelector] Fetching Level 3:', { sectionId, parentPath })
    try {
      const url = `/api/nrm-rules?sectionId=${sectionId}&parentPath=${encodeURIComponent(parentPath)}`
      console.log('[RuleSelector] Level 3 URL:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[RuleSelector] Level 3 API error:', response.status, errorData)
        throw new Error(errorData.error || `Failed to fetch level 3: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[RuleSelector] Level 3 response:', {
        rulesCount: data.rules?.length || 0,
        hasRules: Array.isArray(data.rules),
        rules: data.rules?.slice(0, 3)
      })
      
      const rules = data.rules || []
      setLevel3Rules(rules)
      setSelectedLevel3('')
      setSelectedRule(null)
      
      if (rules.length === 0) {
        console.warn('[RuleSelector] No level 3 rules found for parent:', parentPath)
      }
    } catch (error) {
      console.error('[RuleSelector] Failed to fetch level 3 rules:', error)
      setLevel3Rules([])
    } finally {
      setLoading((prev) => ({ ...prev, level3: false }))
    }
  }

  const handleSectionChange = (value: string) => {
    setSelectedSection(value)
    fetchLevel1Rules(value)
  }

  const handleLevel1Change = (value: string) => {
    setSelectedLevel1(value)
    const rule = level1Rules.find((r) => r.id === value)
    if (rule) {
      fetchLevel2Rules(selectedSection, rule.path)
    }
  }

  const handleLevel2Change = (value: string) => {
    setSelectedLevel2(value)
    setSelectedRule(null) // Clear selection while loading
    const rule = level2Rules.find((r) => r.id === value)
    if (rule) {
      fetchLevel3Rules(selectedSection, rule.path)
    }
  }

  const handleLevel3Change = (value: string) => {
    setSelectedLevel3(value)
    const rule = level3Rules.find((r) => r.id === value)
    if (rule) {
      setSelectedRule(rule)
      onRuleSelected?.(rule)
    }
  }

  // Auto-select level 2 rule when no level 3 children are available
  useEffect(() => {
    if (selectedLevel2 && !loading.level3 && level3Rules.length === 0) {
      const rule = level2Rules.find((r) => r.id === selectedLevel2)
      if (rule && !selectedRule) {
        setSelectedRule(rule)
        onRuleSelected?.(rule)
      }
    }
  }, [selectedLevel2, level2Rules, level3Rules, loading.level3, selectedRule, onRuleSelected])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NRM2 Rule Selector</CardTitle>
          <CardDescription>
            Select an NRM2 measurement rule by navigating through the hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Selection */}
          <div className="space-y-2">
            <Label>Work Section</Label>
            {loading.sections ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedSection} onValueChange={handleSectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a work section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.code} - {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Level 1 Selection */}
          {selectedSection && (
            <div className="space-y-2">
              <Label>Category (Level 1)</Label>
              {loading.level1 ? (
                <Skeleton className="h-10 w-full" />
              ) : level1Rules.length > 0 ? (
                <Select value={selectedLevel1} onValueChange={handleLevel1Change}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {level1Rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.content}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>No categories available for this section</p>
                  <p className="text-xs mt-1">Check console (F12) for debugging info</p>
                </div>
              )}
            </div>
          )}

          {/* Level 2 Selection */}
          {selectedLevel1 && (
            <div className="space-y-2">
              <Label>Sub-Category (Level 2)</Label>
              {loading.level2 ? (
                <Skeleton className="h-10 w-full" />
              ) : level2Rules.length > 0 ? (
                <Select value={selectedLevel2} onValueChange={handleLevel2Change}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {level2Rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.content}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>No sub-categories available - Level 1 rule can be selected</p>
                  <p className="text-xs mt-1">Check console (F12) for debugging info</p>
                </div>
              )}
            </div>
          )}

          {/* Level 3 Selection */}
          {selectedLevel2 && (
            <div className="space-y-2">
              <Label>Detail (Level 3)</Label>
              {loading.level3 ? (
                <Skeleton className="h-10 w-full" />
              ) : level3Rules.length > 0 ? (
                <Select value={selectedLevel3} onValueChange={handleLevel3Change}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select detailed specification" />
                  </SelectTrigger>
                  <SelectContent>
                    {level3Rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.content}
                        {rule.unit && <span className="ml-2 text-xs text-muted-foreground">({rule.unit})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">No details available - Level 2 rule can be selected</p>
              )}
            </div>
          )}

          {/* Selected Rule Display */}
          {selectedRule && (
            <Card className="mt-6 bg-accent">
              <CardHeader>
                <CardTitle className="text-lg">Selected Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedRule.content}</p>
                </div>
                {selectedRule.unit && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Unit of Measurement</Label>
                    <p className="text-lg font-bold">{selectedRule.unit}</p>
                  </div>
                )}
                {selectedRule.coverage_rules && Array.isArray(selectedRule.coverage_rules) && selectedRule.coverage_rules.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Deemed to be Included</Label>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                      {(selectedRule.coverage_rules as string[]).map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRule.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="text-sm text-muted-foreground">{selectedRule.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

