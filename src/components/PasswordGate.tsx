import { useState } from 'react'
import { PASSWORD_HASH } from '@/auth-config'

async function sha256hex(text: string): Promise<string> {
  const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    const hash = await sha256hex(password)
    if (PASSWORD_HASH && hash === PASSWORD_HASH.toLowerCase()) {
      sessionStorage.setItem('lifetracker-auth', '1')
      onAuthenticated()
    } else {
      setError('Incorrect password.')
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-sm px-6 py-8 rounded-xl border border-border bg-card shadow-sm text-center">
        <h1 className="text-lg font-semibold mb-2">LifeTracker</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter password to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null) }}
            placeholder="Password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {checking ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
