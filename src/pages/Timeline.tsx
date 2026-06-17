import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Project, Task } from '@/types'

interface TimelineProps {
  projects: Project[]
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#94a3b8',
  'in-progress': '#3b82f6',
  done: '#22c55e',
  delayed: '#ef4444',
}

const DAY_MS = 86_400_000
// approximate px-per-char at 9.5px system-ui font
const CHAR_W = 5.6

function flatTasks(tasks: Task[]): Task[] {
  return tasks.flatMap(t => [t, ...flatTasks(t.tasks)])
}

// 4 label slots ordered by preference: nearest-above, nearest-below, far-above, far-below
const LINE_Y = 90

interface Slot { nameY: number; dateY: number; dotTickY: number; lblTickY: number }
const SLOTS: Slot[] = [
  { nameY: LINE_Y - 34, dateY: LINE_Y - 22, dotTickY: LINE_Y - 10, lblTickY: LINE_Y - 20 },
  { nameY: LINE_Y + 36, dateY: LINE_Y + 48, dotTickY: LINE_Y + 10, lblTickY: LINE_Y + 30 },
  { nameY: LINE_Y - 60, dateY: LINE_Y - 48, dotTickY: LINE_Y - 10, lblTickY: LINE_Y - 46 },
  { nameY: LINE_Y + 62, dateY: LINE_Y + 74, dotTickY: LINE_Y + 10, lblTickY: LINE_Y + 56 },
]
const SLOT_ORDER = [0, 1, 2, 3]

const H = 205   // total SVG height, accommodates all 4 slots
const W = 720
const PAD_L = 16
const PAD_R = 70  // room for goal flag label

function ProjectTimeline({ project }: { project: Project }) {
  const tasks = flatTasks(project.tasks).sort((a, b) => a.deadline.localeCompare(b.deadline))
  if (tasks.length === 0) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const goalMs = new Date(project.deadline).getTime()

  const firstMs = new Date(tasks[0].deadline).getTime() - tasks[0].estimatedDays * DAY_MS
  const rangeStart = Math.min(firstMs, todayMs) - 20 * DAY_MS
  const rangeEnd = goalMs + 30 * DAY_MS
  const totalMs = rangeEnd - rangeStart
  const chartW = W - PAD_L - PAD_R

  const toPx = (ms: number) => PAD_L + ((ms - rangeStart) / totalMs) * chartW
  const todayX = toPx(todayMs)
  const goalX = toPx(goalMs)

  // Collision-aware slot assignment: track the rightmost x used per slot
  const slotRight = new Array<number>(SLOTS.length).fill(-9999)

  const milestones = tasks.map(t => {
    const x = toPx(new Date(t.deadline).getTime())
    const halfW = (t.title.length * CHAR_W) / 2 + 6
    let slot = 0
    for (const s of SLOT_ORDER) {
      if (x - halfW > slotRight[s] + 5) { slot = s; break }
    }
    slotRight[slot] = x + halfW
    return { ...t, x, slot }
  })

  const fmtShort = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <div className="flex items-center justify-between">
        <Link to={`/project/${project.id}`} className="font-semibold text-sm hover:underline">
          {project.title}
        </Link>
        <span className="text-xs text-muted-foreground">
          {new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>

        {/* background track */}
        <line x1={PAD_L} y1={LINE_Y} x2={goalX} y2={LINE_Y}
          stroke="var(--color-border)" strokeWidth={4} strokeLinecap="round" />

        {/* elapsed track */}
        <line x1={PAD_L} y1={LINE_Y} x2={Math.min(todayX, goalX)} y2={LINE_Y}
          stroke="var(--color-primary)" strokeWidth={4}
          strokeLinecap="round" strokeOpacity={0.55} />

        {/* milestone dots + labels */}
        {milestones.map(m => {
          const color = STATUS_COLOR[m.status] ?? '#94a3b8'
          const sl = SLOTS[m.slot]
          return (
            <g key={m.id}>
              <line x1={m.x} y1={sl.dotTickY} x2={m.x} y2={sl.lblTickY}
                stroke={color} strokeWidth={1} strokeOpacity={0.45} />
              <circle cx={m.x} cy={LINE_Y} r={5.5}
                fill={m.status === 'done' ? color : 'var(--color-card)'}
                stroke={color} strokeWidth={2} />
              <text x={m.x} y={sl.nameY} textAnchor="middle"
                fontSize={9.5} fill="var(--color-foreground)" fillOpacity={0.85}>
                {m.title}
              </text>
              <text x={m.x} y={sl.dateY} textAnchor="middle"
                fontSize={8} fill="var(--color-muted-foreground)">
                {fmtShort(m.deadline)}
              </text>
              <title>{m.title} · {fmtShort(m.deadline)} · {m.status}</title>
            </g>
          )
        })}

        {/* today marker */}
        <g>
          <line x1={todayX} y1={LINE_Y - 18} x2={todayX} y2={LINE_Y + 18}
            stroke="#f59e0b" strokeWidth={2} />
          <polygon
            points={`${todayX - 5},${LINE_Y - 18} ${todayX + 5},${LINE_Y - 18} ${todayX},${LINE_Y - 10}`}
            fill="#f59e0b" />
          <text x={todayX} y={LINE_Y - 22} textAnchor="middle"
            fontSize={8} fill="#f59e0b" fontWeight="600">Today</text>
        </g>

        {/* goal flag */}
        <g>
          <line x1={goalX} y1={LINE_Y} x2={goalX} y2={LINE_Y - 34}
            stroke="var(--color-primary)" strokeWidth={2} />
          <polygon
            points={`${goalX},${LINE_Y - 34} ${goalX + 16},${LINE_Y - 27} ${goalX},${LINE_Y - 20}`}
            fill="var(--color-primary)" />
          <circle cx={goalX} cy={LINE_Y} r={6} fill="var(--color-primary)" />
          <text x={goalX + 22} y={LINE_Y - 28} textAnchor="start"
            fontSize={9} fill="var(--color-primary)" fontWeight="600">Goal</text>
          <text x={goalX + 22} y={LINE_Y - 17} textAnchor="start"
            fontSize={8} fill="var(--color-muted-foreground)">
            {fmtShort(project.deadline)}
          </text>
        </g>

      </svg>
    </div>
  )
}

export function Timeline({ projects }: TimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c }} />
            {s}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 border-t-2 border-amber-400" />
          today
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map(p => <ProjectTimeline key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}
