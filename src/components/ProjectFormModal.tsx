import { useState } from 'react'
import type { Project } from '@/types'
import { Modal } from '@/components/Modal'

interface ProjectFormModalProps {
  initial?: Project
  onSave: (project: Project) => void
  onDelete?: () => void
  onClose: () => void
}

const today = new Date().toISOString().slice(0, 10)

export function ProjectFormModal({ initial, onSave, onDelete, onClose }: ProjectFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? today)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      deadline,
      notes: notes.trim(),
      tasks: initial?.tasks ?? [],
    })
  }

  const inputCls = 'rounded-md border border-border bg-background text-foreground px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/40'
  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1'

  return (
    <Modal title={initial ? 'Edit Project' : 'New Project'} onClose={onClose}>
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
