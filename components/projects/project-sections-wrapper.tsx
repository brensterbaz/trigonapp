'use client'

import { useState } from 'react'
import { SectionManager } from '@/components/projects/section-manager'
import { SectionSummaryView } from '@/components/projects/section-summary-view'

interface ProjectSection {
  id: string
  name: string
  description: string | null
  code: string | null
  color_hex: string | null
  sort_order: number
  project_id: string
  created_at: string | null
  updated_at: string | null
}

interface ProjectSectionsWrapperProps {
  projectId: string
  initialSections: ProjectSection[]
}

export function ProjectSectionsWrapper({ projectId, initialSections }: ProjectSectionsWrapperProps) {
  const [sections, setSections] = useState<ProjectSection[]>(initialSections)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSectionsChange = async () => {
    // Refetch sections
    const response = await fetch(`/api/sections?projectId=${projectId}`)
    if (response.ok) {
      const data = await response.json()
      setSections(data.sections || [])
      setRefreshKey(prev => prev + 1)
    }
  }

  return (
    <>
      <SectionManager 
        projectId={projectId} 
        sections={sections} 
        onSectionsChange={handleSectionsChange}
      />
      <SectionSummaryView key={refreshKey} projectId={projectId} />
    </>
  )
}

