import type { ReactNode } from 'react'
import { IconClose } from './icons'

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(32,30,29,0.45)' }}
      />
      <div
        className="vv-rise"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 620,
          background: 'var(--color-bg)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -8px 30px rgba(0,0,0,0.18)',
          padding: '18px 20px calc(24px + var(--safe-bottom))',
          maxHeight: '85dvh',
          overflow: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ font: '600 18px/1.2 var(--font-heading)' }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-neutral-600)', padding: 6 }}
          >
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
