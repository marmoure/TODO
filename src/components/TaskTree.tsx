import type { Task } from '@/types'
import { TaskRow } from '@/components/TaskRow'

interface TaskTreeProps {
  tasks: Task[]
  onUpdateTask: (updated: Task) => void
  onDeleteTask: (id: string) => void
  onAddSubtask: (parentId: string, newTask: Task) => void
}

export function TaskTree({ tasks, onUpdateTask, onDeleteTask, onAddSubtask }: TaskTreeProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground italic py-2">No tasks yet.</p>
  }

  return (
    <div className="space-y-0.5">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          depth={0}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddSubtask={onAddSubtask}
        />
      ))}
    </div>
  )
}
