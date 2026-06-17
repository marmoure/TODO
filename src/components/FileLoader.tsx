import { useRef, useState } from 'react'
import type { Project } from '@/types'

interface FileLoaderProps {
  onLoad: (projects: Project[]) => void
}

export function FileLoader({ onLoad }: FileLoaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Project[]
        if (!Array.isArray(data)) throw new Error()
        onLoad(data)
      } catch {
        setError('Could not parse file. Make sure it is a valid data.json.')
        if (inputRef.current) inputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-sm px-6 py-8 rounded-xl border border-border bg-card shadow-sm text-center">
        <h1 className="text-lg font-semibold mb-2">LifeTracker</h1>
        <p className="text-sm text-muted-foreground mb-6">Select your data.json file to get started.</p>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Select file
        </button>
      </div>
    </div>
  )
}
