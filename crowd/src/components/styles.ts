import type { CSSProperties } from 'react'

export const kicker: CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }
export const heading: CSSProperties = { fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 3 }
export const card: CSSProperties = { background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 14 }

export const primaryBtn: CSSProperties = {
  width: '100%',
  border: 0,
  background: 'var(--zc-gold)',
  color: '#1b2b22',
  fontFamily: 'Archivo, sans-serif',
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '.12em',
  textAlign: 'left',
  padding: '15px 14px',
  cursor: 'pointer',
  minHeight: 48,
}

export const ghostBtn: CSSProperties = {
  width: '100%',
  border: '1px solid var(--zc-line)',
  background: 'transparent',
  color: 'var(--zc-muted-2)',
  fontFamily: 'Archivo, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.12em',
  textAlign: 'left',
  padding: 14,
  cursor: 'pointer',
  minHeight: 46,
}

export const dangerBtn: CSSProperties = {
  border: '2px solid var(--zc-red)',
  background: 'transparent',
  color: 'var(--zc-red)',
  fontFamily: 'Archivo, sans-serif',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '.14em',
  textAlign: 'left',
  padding: '15px 14px',
  cursor: 'pointer',
  minHeight: 48,
}
