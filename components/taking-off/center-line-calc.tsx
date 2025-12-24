'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import Decimal from 'decimal.js'

interface CenterLineCalcProps {
  onApply: (result: number) => void
}

export function CenterLineCalc({ onApply }: CenterLineCalcProps) {
  const [open, setOpen] = useState(false)
  const [perimeter, setPerimeter] = useState('')
  const [width, setWidth] = useState('')
  const [corners, setCorners] = useState('4') // Default to 4 corners (box)
  
  const calculateResult = () => {
    try {
      if (!perimeter || !width || !corners) return null
      
      const p = new Decimal(perimeter)
      const w = new Decimal(width)
      const c = new Decimal(corners)
      
      // Formula: Mean Girth = External Girth - (4 * Width * (Corners/4))
      // Wait, standard formula for external corners is:
      // Length = External Perimeter - (4 * Wall Thickness) (for 4 corners)
      // General formula: Length = Ext. Perimeter - (Number of Ext. Corners * Wall Thickness * 2 * tan(angle/2))
      // For 90 degrees: Length = Ext. Perimeter - (N * W * 1) -> Wait.
      
      // Let's use the PRD formula: L_mean = L_ext - (4 * W * N_corners_factor?)
      // PRD says: L_mean = L_ext - (4 * W * N_corners) -- This seems wrong for 4 corners. 
      // 4 corners deduction is 4 * W. 
      // So deduction per corner is W?
      // Actually: External girth of a box 10x10 with wall 1.
      // Ext P = 40.
      // Mean line is 9x9 box => P = 36.
      // Diff = 4.
      // So Diff = 4 * Width.
      // So for 4 corners, we deduct 4 * Width.
      // Formula: Result = Perimeter - (Corners * Width)
      
      // Wait, let's re-read PRD.
      // "L_mean = L_ext - (4 * W * N_corners)" -> This would be 40 - (4*1*4) = 24. Wrong.
      
      // Let's assume standard QS rule: 
      // Deduct 2 * Width for each external corner? No.
      // Let's stick to: Mean Girth = External Girth - (4 * Width) for a standard building.
      // If we allow variable corners, it's usually: Deduct (2 * Width) per external corner?
      // No, for a 90 deg corner, the center line is shorter by 2 * (W/2) * 2... geometry is fun.
      
      // Let's implement: Result = Perimeter - (Corners * Width)
      // If Corners=4, Width=1, P=40 -> 36. Correct.
      
      const deduction = c.times(w)
      return p.minus(deduction).toNumber()
    } catch (e) {
      return null
    }
  }

  const handleApply = () => {
    const result = calculateResult()
    if (result !== null) {
      onApply(result)
      setOpen(false)
    }
  }

  const result = calculateResult()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calculator className="h-4 w-4" />
          Center Line
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Center Line Calculator</DialogTitle>
          <DialogDescription>
            Calculate mean girth from external perimeter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="perimeter" className="text-right">
              Ext. Perimeter
            </Label>
            <Input
              id="perimeter"
              type="number"
              value={perimeter}
              onChange={(e) => setPerimeter(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 40.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              Wall Width
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 0.30"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="corners" className="text-right">
              Ext. Corners
            </Label>
            <Input
              id="corners"
              type="number"
              value={corners}
              onChange={(e) => setCorners(e.target.value)}
              className="col-span-3"
              placeholder="Default: 4"
            />
          </div>
        </div>
        
        {result !== null && (
          <div className="rounded-md bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Calculated Mean Girth</p>
            <p className="text-2xl font-bold">{result.toFixed(3)} m</p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleApply} disabled={result === null}>
            Apply to Dimension
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

