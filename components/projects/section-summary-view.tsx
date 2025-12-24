'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Layers, Package } from 'lucide-react'

interface SectionSummary {
  section_id: string
  project_id: string
  section_name: string
  section_code: string | null
  description: string | null
  color_hex: string | null
  sort_order: number
  item_count: number
  section_total: number
  created_at: string | null
  updated_at: string | null
}

interface UnsectionedSummary {
  item_count: number
  total: number
}

interface SectionSummaryViewProps {
  projectId: string
}

export function SectionSummaryView({ projectId }: SectionSummaryViewProps) {
  const [summaries, setSummaries] = useState<SectionSummary[]>([])
  const [unsectioned, setUnsectioned] = useState<UnsectionedSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummaries = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sections/summaries?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setSummaries(data.summaries || [])
        setUnsectioned(data.unsectioned || null)
      }
    } catch (error) {
      console.error('Failed to fetch section summaries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSummaries()
  }, [fetchSummaries])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value)
  }

  const totalValue = summaries.reduce((sum, s) => sum + Number(s.section_total), 0) + 
                     (unsectioned?.total || 0)
  const totalItems = summaries.reduce((sum, s) => sum + s.item_count, 0) + 
                     (unsectioned?.item_count || 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Section Breakdown</CardTitle>
          <CardDescription>Cost breakdown by project section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (summaries.length === 0 && (!unsectioned || unsectioned.item_count === 0)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Section Breakdown</CardTitle>
            <CardDescription>Cost breakdown by project section</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Project Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-muted-foreground">{totalItems} items</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summaries
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((summary) => {
              const percentage = totalValue > 0 
                ? (Number(summary.section_total) / totalValue) * 100 
                : 0

              return (
                <div
                  key={summary.section_id}
                  className="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-10 w-10 rounded-lg"
                        style={{ backgroundColor: summary.color_hex || '#3B82F6' }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{summary.section_name}</h4>
                          {summary.section_code && (
                            <Badge variant="outline" className="text-xs">
                              {summary.section_code}
                            </Badge>
                          )}
                        </div>
                        {summary.description && (
                          <p className="text-sm text-muted-foreground">
                            {summary.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{summary.item_count} items</span>
                          </div>
                          <div>
                            <span>{percentage.toFixed(1)}% of total</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatCurrency(Number(summary.section_total))}
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: summary.color_hex || '#3B82F6',
                      }}
                    />
                  </div>
                </div>
              )
            })}

          {/* Unsectioned items */}
          {unsectioned && unsectioned.item_count > 0 && (
            <div className="rounded-lg border border-dashed p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-muted-foreground">Unsectioned Items</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>{unsectioned.item_count} items</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-muted-foreground">
                    {formatCurrency(unsectioned.total)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

