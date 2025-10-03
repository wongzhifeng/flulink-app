import React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
}

export function Select({ value, onValueChange, children, className }: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  )
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return (
    <div className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}>
      {children}
    </div>
  )
}

export function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <div className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}>
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-muted-foreground">{placeholder}</span>
}
import { cn } from '@/lib/utils'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
}

export function Select({ value, onValueChange, children, className }: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  )
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return (
    <div className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}>
      {children}
    </div>
  )
}

export function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <div className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}>
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-muted-foreground">{placeholder}</span>
}


