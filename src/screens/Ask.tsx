import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'

const PROMPTS = ['What is on next?', 'Who should I meet next?', 'Summarize my day']

export function Ask() {
  const { state, sendAsk, askBusy, addDoc, removeDoc } = useStore()
  const [input, setInput] = useState('')
  const [docNote, setDocNote] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.askMessages.length, askBusy])

  const submit = (text: string) => {
    const value = text.trim()
    if (!value || askBusy) return
    setInput('')
    void sendAsk(value)
  }

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    const bad: string[] = []
    for (const f of Array.from(files)) {
      try {
        const text = await f.text()
        if (/[\x00-\x08]/.test(text.slice(0, 400))) {
          bad.push(f.name)
          continue
        }
        addDoc({ name: f.name, text: text.slice(0, 40000) })
      } catch {
        bad.push(f.name)
      }
    }
    setDocNote(bad.length ? `${bad.join(', ')} could not be read as text — export it as .txt or .csv first.` : null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 130px)' }}>
      <div style={{ padding: '18px 18px 6px' }}>
        <div className="kicker">Concierge</div>
        <h2 style={{ font: '600 26px/1.1 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>Ask the Vault.</h2>
        {!state.aiApiKey && (
          <p style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--color-neutral-600)', margin: '6px 0 0' }}>
            Answering offline from your agenda, book and uploads. Add an API key in Me → Settings for open-ended answers.
          </p>
        )}
      </div>

      <div className="vv-scroll" style={{ flex: 1, overflow: 'auto', padding: '10px 18px' }}>
        {state.askMessages.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            <div
              style={{
                maxWidth: '86%',
                padding: m.role === 'user' ? '11px 14px' : '2px 0 2px 14px',
                background: m.role === 'user' ? 'var(--color-accent-100)' : 'transparent',
                borderLeft: m.role === 'assistant' ? '2px solid var(--color-accent-700)' : 'none',
                borderRadius: m.role === 'user' ? 12 : 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              <div style={{ font: '600 11px/1 var(--font-heading)', color: m.role === 'user' ? 'var(--color-neutral-600)' : 'var(--color-accent-700)', marginBottom: 5 }}>
                {m.role === 'user' ? 'You' : 'Concierge'}
              </div>
              <div style={{ font: '400 15px/1.45 var(--font-body)' }}>{m.text}</div>
            </div>
          </div>
        ))}
        {askBusy && (
          <div style={{ font: '400 13px/1 var(--font-body)', color: 'var(--color-neutral-600)', paddingLeft: 14 }}>Thinking…</div>
        )}
        <div ref={endRef} />
      </div>

      {state.askMessages.length < 2 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 18px 10px', flexWrap: 'wrap' }}>
          {PROMPTS.map((p) => (
            <button key={p} type="button" className="tag" onClick={() => submit(p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {state.docs.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 18px 10px', flexWrap: 'wrap' }}>
          {state.docs.map((d) => (
            <span key={d.id} className="tag" style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: 6 }}>
              {d.name} · {Math.round(d.text.length / 1000)}k
              <span onClick={() => removeDoc(d.id)} style={{ cursor: 'pointer', color: 'var(--color-danger)' }}>
                ✕
              </span>
            </span>
          ))}
        </div>
      )}
      {docNote && <div style={{ padding: '0 18px 8px', font: '400 12px/1.4 var(--font-body)', color: 'var(--color-danger)' }}>{docNote}</div>}

      <div style={{ display: 'flex', gap: 8, padding: '10px 18px calc(14px + var(--safe-bottom))', borderTop: '1px solid var(--color-divider)' }}>
        <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 'none' }} onClick={() => fileRef.current?.click()}>
          Upload
        </button>
        <input ref={fileRef} type="file" multiple accept=".txt,.csv,.md,.json" style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit(input)
          }}
          placeholder="Ask about the agenda, your book, follow-ups…"
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-primary btn-sm" style={{ flex: 'none' }} onClick={() => submit(input)} disabled={askBusy || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}
