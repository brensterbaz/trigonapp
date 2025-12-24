'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BQItem {
  amount: number | null
  quantity: number
  section_id: string | null
  project_sections?: {
    id: string
    name: string
    code: string | null
    color_hex: string | null
  } | null
  nrm_rules: {
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

interface CostDashboardProps {
  items: BQItem[]
  sections?: ProjectSection[]
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function CostDashboard({ items, sections = [] }: CostDashboardProps) {
  // Create a map of section IDs to section data for quick lookup
  const sectionMap = new Map<string, ProjectSection>()
  sections.forEach(section => {
    sectionMap.set(section.id, section)
  })

  // Group by project section for charts
  const sectionData = items.reduce((acc: any, item) => {
    const sectionId = item.section_id
    let sectionKey: string
    let sectionName: string
    let sectionColor: string

    if (sectionId && item.project_sections) {
      // Item is assigned to a project section
      sectionKey = sectionId
      sectionName = item.project_sections.name
      sectionColor = item.project_sections.color_hex || DEFAULT_COLORS[0]
    } else if (sectionId && sectionMap.has(sectionId)) {
      // Fallback: get section from map
      const section = sectionMap.get(sectionId)!
      sectionKey = sectionId
      sectionName = section.name
      sectionColor = section.color_hex || DEFAULT_COLORS[0]
    } else {
      // Item is not assigned to any section (unsectioned)
      sectionKey = 'unsectioned'
      sectionName = 'Unsectioned'
      sectionColor = '#9ca3af' // Gray for unsectioned items
    }
    
    if (!acc[sectionKey]) {
      acc[sectionKey] = {
        name: sectionName,
        shortName: sectionName,
        color: sectionColor,
        cost: 0,
        count: 0
      }
    }
    
    acc[sectionKey].cost += item.amount || 0
    acc[sectionKey].count += 1
    
    return acc
  }, {})

  const chartData: any[] = Object.values(sectionData).sort((a: any, b: any) => b.cost - a.cost)

  // Calculate total count for percentage calculations
  const totalCount = chartData.reduce((sum: number, entry: any) => sum + entry.count, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Cost Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Distribution by Section</CardTitle>
          <CardDescription>Estimated costs grouped by project sections</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="shortName" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Item Count Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Item Distribution</CardTitle>
          <CardDescription>Number of measured items per section</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="shortName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ shortName, count }: any) => {
                  const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0'
                  return `${shortName}: ${percentage}%`
                }}
                labelLine={false}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

