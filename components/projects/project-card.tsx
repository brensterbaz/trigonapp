'use client'

import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteProjectButton } from './delete-project-button'
import type { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
}

const statusColors = {
  draft: 'bg-gray-500',
  active: 'bg-blue-500',
  tendered: 'bg-green-500',
  archived: 'bg-gray-400',
  ready: 'bg-blue-500',
  in_progress: 'bg-orange-500',
  done: 'bg-green-500',
}

const formatCurrency = (value: number | null) => {
  if (!value) return '-'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg relative group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
            <div className="space-y-1">
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              {project.code && (
                <p className="text-xs text-muted-foreground">{project.code}</p>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[project.status as keyof typeof statusColors] || statusColors.draft}>
              {project.status}
            </Badge>
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteProjectButton
                projectId={project.id}
                projectName={project.name}
                variant="ghost"
                size="icon"
              />
            </div>
          </div>
        </div>
        {project.description && (
          <Link href={`/dashboard/projects/${project.id}`}>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <Link href={`/dashboard/projects/${project.id}`}>
          <dl className="space-y-2 text-sm">
            {project.client_name && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Client:</dt>
                <dd className="font-medium">{project.client_name}</dd>
              </div>
            )}
            {project.location && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location:</dt>
                <dd className="truncate font-medium">{project.location}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Value:</dt>
              <dd className="font-medium">{formatCurrency(project.contract_value)}</dd>
            </div>
            {project.tender_deadline && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Deadline:</dt>
                <dd className="font-medium">{formatDate(project.tender_deadline)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <dt className="text-muted-foreground">Created:</dt>
              <dd className="text-muted-foreground">{formatDate(project.created_at)}</dd>
            </div>
          </dl>
        </Link>
      </CardContent>
    </Card>
  )
}

