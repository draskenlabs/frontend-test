"use client"

import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CommonTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string
  error?: string
}

export function CommonTextarea({
  label,
  error,
  className,
  id,
  ...props
}: CommonTextareaProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <ShadcnTextarea
        id={id}
        className={cn(error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
