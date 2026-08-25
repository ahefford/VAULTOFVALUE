import { useMemo, useState } from 'react'
import { useStore } from './store/store'
import { useTotalUnread } from './store/threads'
import { dmThreadId, zoneThreadId, type IncidentLevel } from './types'
import { Header } from './components/Header'
import { BottomTabs, type TabDef } from './components/BottomTabs'
import { Banner } from './components/Banner'
import { ReportSheet } from './components/ReportSheet'
import { EmergencyOverlay } from './components/EmergencyOverlay'
import { Onboarding } from './screens/Onboarding'
import { ZoneScreen } from './screens/ZoneScreen'
import { MapScreen } from './screens/MapScreen'
import { TeamScreen } from './screens/TeamScreen'
import { RadioScreen } from './screens/RadioScreen'
import { BookScreen } from './screens/BookScreen'

type TabId = 'zone' | 'map' | 'team' | 'radio' | 'book'

export default function App() {
  const { state, me, api } = useStore()
  const [tab, setTab] = useState<TabId>('zone')
  const [radioThread, setRadioThread] = useState('all')
  const [showReport, setShowReport] = useState(false)

  const openTo = (personId: string) => {
    if (!me) return
    setRadioThread(dmThreadId(me.id, personId))
    setTab('radio')
  }

  const threadIdsToWatch = useMemo(() => {
    if (!me) return []
    if (me.role === 'captain') return ['all', ...state.zones.map((z) => zoneThreadId(z.id))]
    const ids = ['all']
    if (me.zone) ids.push(zoneThreadId(me.zone))
    const captain = state.people.find((p) => p.role === 'captain')
    if (captain) ids.push(dmThreadId(me.id, captain.id))
    return ids
  }, [me, state.zones, state.people])
  const radioUnread = useTotalUnread(threadIdsToWatch, me?.id ?? null)

  if (state.authError) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--zc-bg)', color: 'var(--zc-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-red)' }}>CONFIGURATION NEEDED</div>
          <div style={{ fontSize: 14, marginTop: 10, lineHeight: 1.5, color: 'var(--zc-muted-2)' }}>{state.authError}</div>
        </div>
      </div>
    )
  }

  if (!state.ready) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--zc-bg)', color: 'var(--zc-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Connecting…
      </div>
    )
  }

  if (!me) return <Onboarding />

  const myZone = state.zones.find((z) => z.id === me.zone) ?? null
  const openIncidents = state.incidents.filter((i) => i.status === 'open')
  const pendingBreaksForMe =
    me.role === 'lead' ? state.breaks.filter((b) => b.status === 'pending' && state.people.find((p) => p.id === b.byId)?.zone === me.zone) : []

  const zoneBadge = me.role === 'captain' ? (openIncidents.length ? `${openIncidents.length} OPEN` : '') : me.role === 'lead' ? (pendingBreaksForMe.length ? `${pendingBreaksForMe.length} REQ` : '') : ''

  const tabs: TabDef[] = [
    { id: 'zone', label: me.role === 'captain' ? 'OPS' : 'ZONE', badge: zoneBadge },
    { id: 'map', label: 'MAP', badge: '' },
    { id: 'team', label: 'TEAM', badge: '' },
    { id: 'radio', label: 'RADIO', badge: radioUnread ? `${radioUnread} NEW` : '' },
    { id: 'book', label: 'BOOK', badge: '' },
  ]

  const noticeAlert = [...state.alerts].filter((a) => a.level === 'notice' && !a.acks.includes(me.id)).sort((a, b) => a.atMs - b.atMs).at(-1)
  const emergencyAlert = [...state.alerts].filter((a) => a.level === 'emergency' && !a.acks.includes(me.id)).sort((a, b) => a.atMs - b.atMs).at(-1)

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--zc-bg)',
        fontFamily: 'Archivo, system-ui, sans-serif',
        color: 'var(--zc-ink)',
        overflow: 'hidden',
      }}
    >
      <Header me={me} myZone={myZone} />

      {noticeAlert && <Banner alert={noticeAlert} onAck={() => api.ackAlert(noticeAlert.id, me.id)} />}

      <div className="zc-scroll" style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'zone' && <ZoneScreen onOpenReport={() => setShowReport(true)} />}
        {tab === 'map' && <MapScreen />}
        {tab === 'team' && <TeamScreen onDm={openTo} />}
        {tab === 'radio' && <RadioScreen thread={radioThread} onThreadChange={setRadioThread} />}
        {tab === 'book' && <BookScreen />}
      </div>

      <BottomTabs tabs={tabs} active={tab} onChange={(id) => setTab(id as TabId)} />

      {showReport && (
        <ReportSheet
          onClose={() => setShowReport(false)}
          onSubmit={(text: string, level: IncidentLevel) => {
            void api.reportIncident(me.id, text, level)
            setShowReport(false)
            setTab('zone')
          }}
        />
      )}

      {emergencyAlert && (
        <EmergencyOverlay alert={emergencyAlert} totalPeople={state.people.length} onAck={() => api.ackAlert(emergencyAlert.id, me.id)} />
      )}
    </div>
  )
}
