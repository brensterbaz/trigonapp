'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Loader2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import type { DimensionSheet as DimensionSheetType, BillOfQuantities } from '@/types/database'
import { debounce } from '@/lib/utils'
import { CenterLineCalc } from '@/components/taking-off/center-line-calc'

interface DimensionSheetProps {
  bqItem: BillOfQuantities
  onUpdate?: () => void
}

export function DimensionSheet({ bqItem, onUpdate }: DimensionSheetProps) {
  const [dimensions, setDimensions] = useState<DimensionSheetType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // ID of row being saved

  const fetchDimensions = useCallback(async () => {
    try {
      const response = await fetch(`/api/dimensions?bqItemId=${bqItem.id}`)
      const data = await response.json()
      setDimensions(data.dimensions || [])
    } catch (error) {
      console.error('Failed to fetch dimensions:', error)
    } finally {
      setLoading(false)
    }
  }, [bqItem.id])

  useEffect(() => {
    fetchDimensions()
  }, [fetchDimensions])

  const handleAddRow = async (initialData?: Partial<DimensionSheetType>) => {
    const tempId = 'temp-' + Date.now()
    const newRow = {
      bq_item_id: bqItem.id,
      description: '',
      timesing: 1.0,
      dim_a: null,
      dim_b: null,
      dim_c: null,
      waste: 0,
      is_deduction: false,
      sort_order: dimensions.length + 1,
      ...initialData, // Allow overriding defaults
    }
    
    // Optimistic update
    setDimensions([...dimensions, { ...newRow, id: tempId } as any])
    setSaving(tempId)

    try {
      const response = await fetch('/api/dimensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow),
      })
      const data = await response.json()
      
      if (data.dimension) {
        // Replace temp row with real row
        setDimensions((prev) => 
          prev.map((row) => (row.id === tempId ? data.dimension : row))
        )
        onUpdate?.()
      }
    } catch (error) {
      console.error('Failed to add dimension:', error)
      // Revert on error
      setDimensions((prev) => prev.filter((row) => row.id !== tempId))
    } finally {
      setSaving(null)
    }
  }

  const handleUpdateRow = useCallback(async (id: string, updates: Partial<DimensionSheetType>) => {
    // Optimistic update
    setDimensions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    )
    setSaving(id)

    try {
      const response = await fetch(`/api/dimensions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      
      if (data.dimension) {
        // Update with server calculation
        setDimensions((prev) =>
          prev.map((row) => (row.id === id ? data.dimension : row))
        )
        onUpdate?.()
      }
    } catch (error) {
      console.error('Failed to update dimension:', error)
      fetchDimensions() // Revert to server state
    } finally {
      setSaving(null)
    }
  }, [fetchDimensions, onUpdate])

  // Simple debounce for non-critical fields
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce((id: string, updates: Partial<DimensionSheetType>) => {
      handleUpdateRow(id, updates)
    }, 800),
    [handleUpdateRow]
  )

  const handleFieldChange = (id: string, field: keyof DimensionSheetType, value: any) => {
    // Update local state immediately for responsive UI
    setDimensions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
    
    // Debounce the API call
    debouncedUpdate(id, { [field]: value })
  }

  const handleDeleteRow = async (id: string) => {
    // Optimistic update
    setDimensions((prev) => prev.filter((row) => row.id !== id))

    try {
      await fetch(`/api/dimensions/${id}`, {
        method: 'DELETE',
      })
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete dimension:', error)
      fetchDimensions() // Revert
    }
  }

  const handleCenterLineApply = (result: number) => {
    handleAddRow({
      description: 'Mean Girth Calculation',
      dim_a: result,
    })
  }

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return ''
    return num.toString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">Dimensions</h3>
          <p className="text-xs text-muted-foreground">
            Measurements will automatically update the BQ Quantity
          </p>
        </div>
        <div className="flex gap-2">
          <CenterLineCalc onApply={handleCenterLineApply} />
          <Button onClick={() => handleAddRow()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60px]">Ded</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="w-[100px]">Times</TableHead>
              <TableHead className="w-[120px]">Dim A</TableHead>
              <TableHead className="w-[120px]">Dim B</TableHead>
              <TableHead className="w-[120px]">Dim C</TableHead>
              <TableHead className="w-[100px]">Waste %</TableHead>
              <TableHead className="w-[120px] text-right">Result</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : dimensions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No dimensions yet. Add a row to start measuring.
                </TableCell>
              </TableRow>
            ) : (
              dimensions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={row.is_deduction}
                      onCheckedChange={(checked) =>
                        handleUpdateRow(row.id, { is_deduction: !!checked })
                      }
                      className="h-5 w-5"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.description || ''}
                      onChange={(e) =>
                        handleFieldChange(row.id, 'description', e.target.value)
                      }
                      className="h-12 w-full text-base"
                      placeholder="Enter description..."
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={row.timesing}
                      onChange={(e) =>
                        handleFieldChange(row.id, 'timesing', parseFloat(e.target.value) || 1)
                      }
                      className="h-12 text-right text-lg font-semibold"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={formatNumber(row.dim_a)}
                      onChange={(e) =>
                        handleFieldChange(row.id, 'dim_a', e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="h-12 text-right font-mono text-lg"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={formatNumber(row.dim_b)}
                      onChange={(e) =>
                        handleFieldChange(row.id, 'dim_b', e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="h-12 text-right font-mono text-lg"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={formatNumber(row.dim_c)}
                      onChange={(e) =>
                        handleFieldChange(row.id, 'dim_c', e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="h-12 text-right font-mono text-lg"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={row.waste}
                      onChange={(e) =>
                        handleFieldChange(row.id, 'waste', parseFloat(e.target.value) || 0)
                      }
                      className="h-12 text-right text-lg"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 rounded-md bg-muted/30 p-3">
                      {saving === row.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span className={`text-xl font-bold font-mono ${row.is_deduction ? 'text-destructive' : ''}`}>
                        {row.calculated_value?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteRow(row.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end rounded-md bg-primary/10 p-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Total Quantity: </span>
          <span className="ml-3 text-3xl font-bold">
            {dimensions
              .reduce(
                (sum, row) =>
                  sum + (row.is_deduction ? -(row.calculated_value || 0) : row.calculated_value || 0),
                0
              )
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
