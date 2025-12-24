'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface BQItem {
  id: string
  quantity: number
  unit: string
  rate: number | null
  description_custom: string | null
  notes: string | null
  section_id: string | null
  nrm_rules: {
    content: string
    unit: string
  }
  project_sections?: {
    id: string
    name: string
  } | null
}

interface ProjectSection {
  id: string
  name: string
  code: string | null
  color_hex: string | null
}

interface EditBQItemDialogProps {
  item: BQItem
  projectId: string
  sections: ProjectSection[]
}

export function EditBQItemDialog({ item, projectId, sections }: EditBQItemDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [rate, setRate] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize form with item data
  useEffect(() => {
    if (open && item) {
      setQuantity(item.quantity.toString())
      setRate(item.rate?.toString() || '')
      setCustomDescription(item.description_custom || '')
      setNotes(item.notes || '')
      setSelectedSectionId(item.section_id || undefined)
      setError(null)
    }
  }, [open, item])

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/bq-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseFloat(quantity),
          rate: rate ? parseFloat(rate) : null,
          description_custom: customDescription || null,
          notes: notes || null,
          section_id: selectedSectionId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update item')
      }

      toast({
        title: 'Item updated',
        description: 'The BQ item has been updated successfully.',
      })

      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error('Update BQ item error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-blue-600 hover:text-blue-700"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit BQ Item</DialogTitle>
            <DialogDescription>
              Update the measurement details for this Bill of Quantities item
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* NRM2 Rule Info (read-only) */}
            <Card className="border-muted">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">NRM2 Rule</Label>
                  <p className="font-medium">{item.nrm_rules.content}</p>
                  <p className="text-sm text-muted-foreground">
                    Unit: <span className="font-medium">{item.nrm_rules.unit}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section Selector */}
            {sections.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="section">Project Section (Optional)</Label>
                <Select 
                  value={selectedSectionId || 'none'} 
                  onValueChange={(value) => setSelectedSectionId(value === 'none' ? undefined : value)}
                >
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

            {/* Measurement Input */}
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
                    <Label htmlFor="rate">Rate (£/{item.nrm_rules.unit})</Label>
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
                    Default: {item.nrm_rules.content}
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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

