import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Task } from '@/types'
import { cn, formatDate, daysUntil, formatDZD } from '@/lib/utils'
import { NotesPanel } from '@/components/NotesPanel'
import { TaskFormModal } from '@/components/TaskFormModal'

const STATUS_STYLES: Record<Task['status'], string> = {
  pending: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  delayed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

interface TaskRowProps {
  task: Task
  depth?: number
  onUpdateTask: (updated: Task) => void
  onDeleteTask: (id: string) => void
  onAddSubtask: (parentId: string, newTask: Task) => void
}

export function TaskRow({ task, depth = 0, onUpdateTask, onDeleteTask, onAddSubtask }: TaskRowProps) {
  const [expanded, setExpanded] = useState(true)
  const [modal, setModal] = useState<'closed' | 'edit' | 'add-sub'>('closed')
  const hasChildren = task.tasks.length > 0
  const days = daysUntil(task.deadline)
  const isOverdue = days < 0 && task.status !== 'done'
  const isDueSoon = days >= 0 && days <= 7 && task.status !== 'done'

  return (
    <div className={cn('border-l-2 pl-3', depth === 0 ? 'border-border' : 'border-border/50 ml-4')}>
      <div className={cn(
        'group flex flex-wrap items-start gap-x-3 gap-y-1 py-2',
        task.status === 'done' && 'opacity-60',
      )}>
        <button
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className={cn(
            'flex items-center gap-1 font-medium text-sm text-left flex-1 min-w-0',
            !hasChildren && 'cursor-default',
          )}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <span className="w-3.5 h-3.5 shrink-0 inline-block" />
          )}
          <span className={cn(task.status === 'done' && 'line-through')}>{task.title}</span>
        </button>

        <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium shrink-0', STATUS_STYLES[task.status])}>
          {task.status}
        </span>

        <div className={cn('flex items-center gap-1 text-xs shrink-0', isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground')}>
          <CalendarDays className="w-3 h-3" />
          {formatDate(task.deadline)}
          {task.delayedBy > 0 && <span className="text-red-400">(+{task.delayedBy}d)</span>}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="w-3 h-3" />
          {task.estimatedDays}d
        </div>

        {task.cost > 0 && (
          <div className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {formatDZD(task.cost)}
          </div>
        )}

        <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setModal('add-sub')}
            title="Add subtask"
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setModal('edit')}
            title="Edit task"
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            title="Delete task"
            className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {task.notes && (
        <div className="pb-1">
          <NotesPanel notes={task.notes} />
        </div>
      )}

      {hasChildren && expanded && (
        <div className="mb-1">
          {task.tasks.map((child) => (
            <TaskRow
              key={child.id}
              task={child}
              depth={depth + 1}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}

      {modal === 'edit' && (
        <TaskFormModal
          initial={task}
          onSave={(t) => { onUpdateTask(t); setModal('closed') }}
          onDelete={() => { onDeleteTask(task.id); setModal('closed') }}
          onClose={() => setModal('closed')}
        />
      )}
      {modal === 'add-sub' && (
        <TaskFormModal
          onSave={(t) => { onAddSubtask(task.id, t); setModal('closed') }}
          onClose={() => setModal('closed')}
        />
      )}
    </div>
  )
}
