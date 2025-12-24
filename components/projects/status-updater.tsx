'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type ProjectStatus = 'draft' | 'ready' | 'in_progress' | 'done'

interface StatusUpdaterProps {
  projectId: string
  currentStatus: ProjectStatus
}

const statusConfig = {
  draft: { label: '📝 Draft', color: 'text-gray-600' },
  ready: { label: '✅ Ready', color: 'text-blue-600' },
  in_progress: { label: '🚧 In Progress', color: 'text-orange-600' },
  done: { label: '✔️ Done', color: 'text-green-600' },
}

export function StatusUpdater({ projectId, currentStatus }: StatusUpdaterProps) {
  const router = useRouter()
  const [status, setStatus] = useState<ProjectStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    setIsUpdating(true)
    setStatus(newStatus)

    try {
      console.log('Updating status to:', newStatus)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()
      console.log('Update response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Revert on error
      setStatus(currentStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="status" className="text-sm font-medium">
        Status:
      </Label>
      <div className="relative">
        <Select
          value={status}
          onValueChange={handleStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger id="status" className="w-[200px]">
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">
              <span className={statusConfig.draft.color}>
                {statusConfig.draft.label}
              </span>
            </SelectItem>
            <SelectItem value="ready">
              <span className={statusConfig.ready.color}>
                {statusConfig.ready.label}
              </span>
            </SelectItem>
            <SelectItem value="in_progress">
              <span className={statusConfig.in_progress.color}>
                {statusConfig.in_progress.label}
              </span>
            </SelectItem>
            <SelectItem value="done">
              <span className={statusConfig.done.color}>
                {statusConfig.done.label}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

