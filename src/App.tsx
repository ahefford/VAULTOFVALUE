import { useState } from 'react'
import { useStore } from './store/store'
import { Onboarding } from './screens/Onboarding'
import { TopBar } from './components/TopBar'
import { TabBar, type Tab } from './components/TabBar'
import { Book } from './screens/Book'
import { ContactDetail } from './screens/ContactDetail'
import { Scan } from './screens/Scan'
import { Pipeline } from './screens/Pipeline'
import { Rooms } from './screens/Rooms'
import { Daily } from './screens/Daily'
import { Me } from './screens/Me'
import { Ask } from './screens/Ask'

export default function App() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('daily')
  const [detailId, setDetailId] = useState<string | null>(null)

  if (!state.onboarded) return <Onboarding />

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopBar onAvatar={() => { setTab('me'); setDetailId(null) }} />
      <main className="vv-scroll" style={{ flex: 1, overflow: 'auto', maxWidth: 620, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {detailId ? (
          <ContactDetail id={detailId} onBack={() => setDetailId(null)} />
        ) : (
          <>
            {tab === 'daily' && <Daily />}
            {tab === 'ask' && <Ask />}
            {tab === 'book' && <Book onOpen={setDetailId} />}
            {tab === 'scan' && <Scan onOpen={setDetailId} />}
            {tab === 'pipe' && <Pipeline onOpen={setDetailId} />}
            {tab === 'sess' && <Rooms onOpen={setDetailId} />}
            {tab === 'me' && <Me />}
          </>
        )}
      </main>
      {!detailId && <TabBar tab={tab} onChange={setTab} />}
    </div>
  )
}
