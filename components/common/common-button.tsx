"use client"

import { Button as ShadcnButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface CommonButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  loading?: boolean
  icon?: React.ReactNode
}

export function CommonButton({
  children,
  loading = false,
  disabled,
  icon,
  className,
  ...props
}: CommonButtonProps) {
  return (
    <ShadcnButton
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon && <span className="mr-2">{icon}</span>}
      {children}
    </ShadcnButton>
  )
}
