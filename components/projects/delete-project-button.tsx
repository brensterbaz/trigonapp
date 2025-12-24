'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface DeleteProjectButtonProps {
  projectId: string
  projectName: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DeleteProjectButton({ 
  projectId, 
  projectName,
  variant = 'destructive',
  size = 'default'
}: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete project')
      }

      toast({
        title: 'Project deleted',
        description: `${projectName} has been permanently deleted.`,
      })

      setOpen(false)
      router.push('/dashboard/projects')
      router.refresh()
    } catch (error) {
      console.error('Delete project error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
      >
        {size === 'icon' ? (
          <Trash2 className="h-4 w-4" />
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectName}&quot;? This action cannot be undone.
              <br />
              <br />
              <strong>This will permanently delete:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>The project and all its data</li>
                <li>All Bill of Quantities items</li>
                <li>All project sections</li>
                <li>All dimension sheets</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

