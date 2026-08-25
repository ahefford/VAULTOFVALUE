import { useEffect, useState } from 'react'
import type { Person, Zone } from '../types'
import { clockNow } from '../lib/time'

export function Header({ me, myZone }: { me: Person; myZone: Zone | null }) {
  const [clock, setClock] = useState(clockNow())
  useEffect(() => {
    const t = setInterval(() => setClock(clockNow()), 15000)
    return () => clearInterval(t)
  }, [])

  const roleTag = me.role === 'captain' ? 'CAPTAIN' : me.role === 'lead' ? 'TEAM LEAD' : 'TEAM MEMBER'
  const zoneLine = (me.role === 'captain' ? 'ALL ZONES' : (myZone?.name ?? '').toUpperCase()) + ' · MGM GRAND ARENA'

  return (
    <div style={{ flex: 'none', padding: '58px 18px 0', background: 'var(--zc-panel)', borderBottom: '2px solid var(--zc-line)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '.04em',
            background: 'var(--zc-gold)',
            color: '#1b2b22',
          }}
        >
          {me.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>{roleTag}</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.15, marginTop: 2 }}>{me.name}</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', color: 'var(--zc-muted)', marginTop: 3 }}>{zoneLine}</div>
        </div>
        <div style={{ flex: 'none', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, background: 'var(--zc-gold)', animation: 'ccpulse 1.8s infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: 'var(--zc-gold)' }}>CLOUD</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zc-muted)', marginTop: 3 }}>{clock}</div>
        </div>
      </div>
    </div>
  )
}
