"use client"

import { useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { CommonButton } from "./common-button"

interface CommonModalProps {
  trigger: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export function CommonModal({
  trigger,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Submit",
  cancelText = "Cancel",
}: CommonModalProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4">{children}</div>
        <DrawerFooter>
          {onConfirm && (
            <CommonButton onClick={onConfirm}>{confirmText}</CommonButton>
          )}
          <DrawerClose asChild>
            <CommonButton variant="outline">{cancelText}</CommonButton>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
