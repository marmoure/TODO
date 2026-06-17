import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project, FlatTask } from '@/types'
import { flattenTimeline } from '@/lib/flattenTimeline'
import { cn } from '@/lib/utils'

interface CalendarProps {
  projects: Project[]
}

const STATUS_BG: Record<string, string> = {
  pending: 'bg-slate-400/20 text-slate-500 dark:text-slate-400',
  'in-progress': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  done: 'bg-green-500/15 text-green-600 dark:text-green-400',
  delayed: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-slate-400',
  'in-progress': 'bg-blue-500',
  done: 'bg-green-500',
  delayed: 'bg-red-500',
}

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface DayCell {
  date: Date
  ymd: string
  isCurrentMonth: boolean
}

function buildGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay() // 0=Sun
  const cells: DayCell[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, ymd: toYMD(d), isCurrentMonth: false })
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ date, ymd: toYMD(date), isCurrentMonth: true })
  }

  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    cells.push({ date, ymd: toYMD(date), isCurrentMonth: false })
  }

  return cells
}

const MAX_VISIBLE = 3

function DayTasks({ tasks }: { tasks: FlatTask[] }) {
  if (tasks.length === 0) return null
  const visible = tasks.slice(0, MAX_VISIBLE)
  const overflow = tasks.length - MAX_VISIBLE

  return (
    <div className="mt-1 space-y-0.5">
      {visible.map(t => (
        <Link
          key={t.taskId}
          to={`/project/${t.projectId}`}
          title={`${t.taskTitle} · ${t.projectTitle} · ${t.status}`}
          className={cn(
            'flex items-center gap-1 text-[10px] leading-tight px-1 py-0.5 rounded truncate max-w-full',
            STATUS_BG[t.status] ?? STATUS_BG.pending,
            'hover:opacity-80 transition-opacity',
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[t.status] ?? STATUS_DOT.pending)} />
          <span className="truncate">{t.taskTitle}</span>
        </Link>
      ))}
      {overflow > 0 && (
        <p className="text-[9px] text-muted-foreground pl-1">+{overflow} more</p>
      )}
    </div>
  )
}

export function Calendar({ projects }: CalendarProps) {
  const todayYMD = toYMD(new Date())
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())

  const allTasks = flattenTimeline(projects)
  const tasksByDay = new Map<string, FlatTask[]>()
  for (const t of allTasks) {
    const key = t.deadline.slice(0, 10)
    if (!tasksByDay.has(key)) tasksByDay.set(key, [])
    tasksByDay.get(key)!.push(t)
  }

  const grid = buildGrid(year, month)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  function goToday() {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{MONTH_NAMES[month]} {year}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(STATUS_DOT).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', cls)} />
            {s}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {grid.map(cell => {
            const isToday = cell.ymd === todayYMD
            const tasks = tasksByDay.get(cell.ymd) ?? []
            return (
              <div
                key={cell.ymd}
                className={cn(
                  'min-h-[96px] p-1.5 text-sm',
                  !cell.isCurrentMonth && 'bg-muted/20',
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                    isToday
                      ? 'bg-primary text-primary-foreground'
                      : cell.isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/50',
                  )}
                >
                  {cell.date.getDate()}
                </span>
                <DayTasks tasks={tasks} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
