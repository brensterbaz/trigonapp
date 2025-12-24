'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Trash2, Calculator, Pencil } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { DimensionSheet } from '@/components/taking-off/dimension-sheet'
import { EditBQItemDialog } from './edit-bq-item-dialog'
import { useToast } from '@/hooks/use-toast'

interface BQItem {
  id: string
  quantity: number
  unit: string
  rate: number | null
  amount: number | null
  description_custom: string | null
  notes: string | null
  nrm_rules: {
    content: string
    path: string
    unit: string
    nrm_sections: {
      code: string
      title: string
    }
  }
}

interface ProjectSection {
  id: string
  name: string
  code: string | null
  color_hex: string | null
}

interface BQTableProps {
  items: BQItem[]
  projectId: string
  sections?: ProjectSection[]
}

export function BQTable({ items, projectId, sections = [] }: BQTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<BQItem | null>(null)

  // Group items by section
  const groupedItems = items.reduce((acc, item) => {
    const sectionCode = item.nrm_rules.nrm_sections.code
    if (!acc[sectionCode]) {
      acc[sectionCode] = {
        title: `${sectionCode} - ${item.nrm_rules.nrm_sections.title}`,
        items: [],
      }
    }
    acc[sectionCode].items.push(item)
    return acc
  }, {} as Record<string, { title: string; items: BQItem[] }>)

  // ... existing helper functions ...

  const toggleSection = (sectionCode: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionCode)) {
        next.delete(sectionCode)
      } else {
        next.add(sectionCode)
      }
      return next
    })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '£0.00'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatQuantity = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
  }

  return (
    <>
      <div className="rounded-md border">
        {/* ... table ... */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] text-right">Quantity</TableHead>
              <TableHead className="w-[80px]">Unit</TableHead>
              <TableHead className="w-[120px] text-right">Rate</TableHead>
              <TableHead className="w-[120px] text-right">Amount</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedItems).map(([sectionCode, section]) => {
              const isExpanded = expandedSections.has(sectionCode)
              const sectionTotal = section.items.reduce((sum, item) => sum + (item.amount || 0), 0)

              return (
                <>
                  <TableRow
                    key={sectionCode}
                    className="cursor-pointer bg-muted/50 font-medium hover:bg-muted"
                    onClick={() => toggleSection(sectionCode)}
                  >
                    <TableCell>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell colSpan={4}>
                      {section.title}
                      <Badge variant="outline" className="ml-2">
                        {section.items.length} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(sectionTotal)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  {isExpanded &&
                    section.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell></TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.description_custom || item.nrm_rules.content}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground">{item.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatQuantity(item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.unit}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.rate ? formatCurrency(item.rate) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {item.amount ? formatCurrency(item.amount) : '-'}
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            onClick={() => setSelectedItem(item as any)}
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                          <EditBQItemDialog 
                            item={item as any} 
                            projectId={projectId}
                            sections={sections}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-destructive"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this item?')) {
                                return
                              }
                              try {
                                const response = await fetch(`/api/bq-items/${item.id}`, {
                                  method: 'DELETE',
                                })
                                if (!response.ok) {
                                  throw new Error('Failed to delete item')
                                }
                                toast({
                                  title: 'Item deleted',
                                  description: 'The BQ item has been removed.',
                                })
                                router.refresh()
                              } catch (error) {
                                toast({
                                  title: 'Error',
                                  description: 'Failed to delete item. Please try again.',
                                  variant: 'destructive',
                                })
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              )
            })}

            <TableRow className="bg-muted font-bold">
              <TableCell></TableCell>
              <TableCell colSpan={4}>TOTAL</TableCell>
              <TableCell className="text-right">
                {formatCurrency(
                  items.reduce((sum, item) => sum + (item.amount || 0), 0)
                )}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Dimension Sheet Drawer */}
      <Sheet 
        open={!!selectedItem} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null)
            router.refresh()
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-4xl md:max-w-6xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Taking Off</SheetTitle>
            <SheetDescription>
              {selectedItem?.description_custom || selectedItem?.nrm_rules.content}
              <Badge variant="outline" className="ml-2">
                {selectedItem?.nrm_rules.unit}
              </Badge>
            </SheetDescription>
          </SheetHeader>
          
          {selectedItem && (
            <DimensionSheet 
              bqItem={selectedItem as any} 
              onUpdate={() => {
                // Local state handles immediate updates
                // router.refresh() on close handles parent sync
              }} 
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
