import { useState } from 'react'
import type { Task, TaskStatus } from '@/types'
import { Modal } from '@/components/Modal'

interface TaskFormModalProps {
  initial?: Task
  onSave: (task: Task) => void
  onDelete?: () => void
  onClose: () => void
}

const today = new Date().toISOString().slice(0, 10)

export function TaskFormModal({ initial, onSave, onDelete, onClose }: TaskFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? today)
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'pending')
  const [estimatedDays, setEstimatedDays] = useState(initial?.estimatedDays ?? 1)
  const [delayedBy, setDelayedBy] = useState(initial?.delayedBy ?? 0)
  const [cost, setCost] = useState(initial?.cost ?? 0)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      deadline,
      status,
      estimatedDays,
      delayedBy,
      cost,
      notes: notes.trim(),
      tasks: initial?.tasks ?? [],
    })
  }

  const inputCls = 'rounded-md border border-border bg-background text-foreground px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/40'
  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1'

  return (
    <Modal title={initial ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelCls}>Title</label>
          <input
            className={inputCls}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Deadline</label>
            <input
              className={inputCls}
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
            >
              <option value="pending">pending</option>
              <option value="in-progress">in-progress</option>
              <option value="done">done</option>
              <option value="delayed">delayed</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Est. Days</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.5"
              value={estimatedDays}
              onChange={e => setEstimatedDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>Delayed By</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              value={delayedBy}
              onChange={e => setDelayedBy(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>Cost (DZD)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              value={cost}
              onChange={e => setCost(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={inputCls}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-border mt-4">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-md text-sm transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
