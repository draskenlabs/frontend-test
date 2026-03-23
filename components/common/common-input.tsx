"use client"

import { Input as ShadcnInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CommonInputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
}

export function CommonInput({
  label,
  error,
  className,
  id,
  ...props
}: CommonInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <ShadcnInput
        id={id}
        className={cn(error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
