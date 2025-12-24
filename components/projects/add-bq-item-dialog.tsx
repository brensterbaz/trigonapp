'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RuleSelector } from '@/components/nrm2/rule-selector'
import { Card, CardContent } from '@/components/ui/card'
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

interface AddBQItemDialogProps {
  projectId: string
}

interface ProjectSection {
  id: string
  name: string
  code: string | null
  color_hex: string | null
}

export function AddBQItemDialog({ projectId }: AddBQItemDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<NrmRule | null>(null)
  const [sections, setSections] = useState<ProjectSection[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState('')
  const [rate, setRate] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    try {
      const response = await fetch(`/api/sections?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setSections(data.sections || [])
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error)
    }
  }, [projectId])

  useEffect(() => {
    if (open) {
      fetchSections()
    }
  }, [open, fetchSections])

  const handleRuleSelected = (rule: NrmRule) => {
    setSelectedRule(rule)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedRule) {
      setError('Please select an NRM2 rule')
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    // Unit is required - use rule's unit or default to "nr" (number)
    const unit = selectedRule.unit || 'nr'

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/bq-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          nrm_rule_id: selectedRule.id,
          quantity: parseFloat(quantity),
          unit: unit,
          rate: rate ? parseFloat(rate) : null,
          description_custom: customDescription || null,
          notes: notes || null,
          section_id: selectedSectionId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add item')
      }

      // Reset form and close dialog
      setSelectedRule(null)
      setSelectedSectionId(undefined)
      setQuantity('')
      setRate('')
      setCustomDescription('')
      setNotes('')
      setOpen(false)
      
      // Refresh the page to show new item
      router.refresh()
    } catch (err) {
      console.error('Add BQ item error:', err)
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add BQ Item</DialogTitle>
          <DialogDescription>
            Select an NRM2 rule and enter measurement details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Selector */}
          <div>
            <Label className="mb-2 block">Select NRM2 Rule *</Label>
            <RuleSelector onRuleSelected={handleRuleSelected} />
          </div>

          {/* Section Selector */}
          {sections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="section">Project Section (Optional)</Label>
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="No section (general items)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No section (general items)</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: section.color_hex || '#3B82F6' }}
                        />
                        {section.name}
                        {section.code && (
                          <span className="text-xs text-muted-foreground">
                            ({section.code})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign this item to a specific area or section of the project
              </p>
            </div>
          )}

          {/* Measurement Input (shown after rule is selected) */}
          {selectedRule && (
            <Card className="border-primary">
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.0001"
                      placeholder="0.00"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  {/* Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate (£/{selectedRule.unit})</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Custom Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    placeholder="Override the default NRM2 description..."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: {selectedRule.content}
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or measurements..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Preview Calculation */}
                {quantity && rate && (
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Amount:</span>
                      <span className="font-bold">
                        £{(parseFloat(quantity) * parseFloat(rate)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !selectedRule}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to BQ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

