import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Task } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysUntil(iso: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// Algerian convention: 1 million = 10,000 DZD — always display as XM DZD
export function formatDZD(dzd: number): string {
  const millions = dzd / 10_000
  const formatted = millions.toLocaleString('fr-DZ', { maximumFractionDigits: 2 })
  return `${formatted}M DZD`
}

export function updateTaskById(tasks: Task[], updated: Task): Task[] {
  return tasks.map(t =>
    t.id === updated.id ? updated : { ...t, tasks: updateTaskById(t.tasks, updated) }
  )
}

export function deleteTaskById(tasks: Task[], id: string): Task[] {
  return tasks
    .filter(t => t.id !== id)
    .map(t => ({ ...t, tasks: deleteTaskById(t.tasks, id) }))
}

export function addSubtaskById(tasks: Task[], parentId: string, newTask: Task): Task[] {
  return tasks.map(t =>
    t.id === parentId
      ? { ...t, tasks: [...t.tasks, newTask] }
      : { ...t, tasks: addSubtaskById(t.tasks, parentId, newTask) }
  )
}
