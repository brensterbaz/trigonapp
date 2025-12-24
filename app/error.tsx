'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-semibold mb-1">Error Details:</p>
              <p>{error.message}</p>
            </div>
          )}
          {error.digest && (
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Error ID:</p>
              <p className="font-mono">{error.digest}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/sign-in')}
              className="flex-1"
            >
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

