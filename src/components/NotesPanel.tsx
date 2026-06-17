import { useState } from 'react'
import { ChevronDown, ChevronRight, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotesPanelProps {
  notes: string
}

export function NotesPanel({ notes }: NotesPanelProps) {
  const [open, setOpen] = useState(false)

  if (!notes) return null

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors',
        )}
      >
        <StickyNote className="w-3 h-3" />
        Notes
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <p className="mt-1 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1 whitespace-pre-wrap">
          {notes}
        </p>
      )}
    </div>
  )
}
