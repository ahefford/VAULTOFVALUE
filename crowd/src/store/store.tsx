import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db, EVENT_ID, ensureSignedIn, FIREBASE_CONFIGURED } from '../firebase'
import { makeId } from '../lib/id'
import type { Alert, AlertLevel, BreakRequest, Incident, IncidentLevel, Person, PersonStatus, Role, Zone } from '../types'

const ME_KEY = 'zc_me_id'

function col(name: string) {
  return collection(db, 'events', EVENT_ID, name)
}

function toMs(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis()
  return Date.now()
}

function watch<T>(name: string, map: (d: QueryDocumentSnapshot<DocumentData>) => T, onData: (rows: T[]) => void) {
  return onSnapshot(
    col(name),
    (snap) => onData(snap.docs.map(map)),
    () => onData([]),
  )
}

interface StoreState {
  ready: boolean
  authError: string | null
  people: Person[]
  zones: Zone[]
  incidents: Incident[]
  breaks: BreakRequest[]
  alerts: Alert[]
}

interface StoreValue {
  state: StoreState
  meId: string | null
  me: Person | null
  setMeId: (id: string | null) => void

  addPerson: (input: { name: string; role: Role; zone: string | null; post: string }) => Promise<string>
  updatePerson: (id: string, patch: Partial<Pick<Person, 'name' | 'role' | 'zone' | 'post' | 'status'>>) => Promise<void>
  removePerson: (id: string) => Promise<void>

  addZone: (input: { id?: string; name: string; short: string; leadId: string | null; dutiesLabel: string }) => Promise<string>
  updateZone: (id: string, patch: Partial<Pick<Zone, 'name' | 'short' | 'leadId' | 'dutiesLabel'>>) => Promise<void>
  removeZone: (id: string) => Promise<void>

  api: {
    setStatus: (personId: string, status: PersonStatus) => Promise<void>
    requestBreak: (personId: string) => Promise<void>
    resolveBreak: (breakId: string, approve: boolean) => Promise<void>
    reportIncident: (personId: string, text: string, level: IncidentLevel) => Promise<void>
    ackIncident: (incidentId: string, personId: string) => Promise<void>
    sendAlert: (fromId: string, text: string, level: AlertLevel) => Promise<void>
    ackAlert: (alertId: string, personId: string) => Promise<void>
    fileDebrief: (personId: string) => Promise<void>
    sendMsg: (threadId: string, byId: string, text: string) => Promise<void>
    markRead: (threadId: string, personId: string) => Promise<void>
    setTyping: (threadId: string, personId: string, typing: boolean) => Promise<void>
  }
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [breaks, setBreaks] = useState<BreakRequest[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [meId, setMeIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ME_KEY)
    } catch {
      return null
    }
  })

  const setMeId = (id: string | null) => {
    setMeIdState(id)
    try {
      if (id) localStorage.setItem(ME_KEY, id)
      else localStorage.removeItem(ME_KEY)
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      setAuthError('Firebase is not configured. Set VITE_ZC_* environment variables (see .env.example).')
      return
    }
    let unsubs: Array<() => void> = []
    ensureSignedIn()
      .then(() => {
        unsubs = [
          watch<Person>(
            'people',
            (d) => {
              const v = d.data()
              return {
                id: d.id,
                name: v.name ?? '',
                initials: v.initials ?? '··',
                role: (v.role ?? 'member') as Role,
                zone: v.zone ?? null,
                post: v.post ?? '',
                status: (v.status ?? 'off') as PersonStatus,
                debriefed: Boolean(v.debriefed),
                createdAt: toMs(v.createdAt),
              }
            },
            setPeople,
          ),
          watch<Zone>(
            'zones',
            (d) => {
              const v = d.data()
              return {
                id: d.id,
                name: v.name ?? '',
                short: v.short ?? '',
                leadId: v.leadId ?? null,
                dutiesLabel: v.dutiesLabel ?? 'MAIN FLOOR',
              }
            },
            setZones,
          ),
          watch<Incident>(
            'incidents',
            (d) => {
              const v = d.data()
              return {
                id: d.id,
                byId: v.byId ?? '',
                text: v.text ?? '',
                level: (v.level ?? 'med') as IncidentLevel,
                status: (v.status ?? 'open') as 'open' | 'closed',
                acks: (v.acks ?? []) as string[],
                atMs: toMs(v.at),
              }
            },
            setIncidents,
          ),
          watch<BreakRequest>(
            'breaks',
            (d) => {
              const v = d.data()
              return {
                id: d.id,
                byId: v.byId ?? '',
                status: (v.status ?? 'pending') as BreakRequest['status'],
                atMs: toMs(v.at),
              }
            },
            setBreaks,
          ),
          watch<Alert>(
            'alerts',
            (d) => {
              const v = d.data()
              return {
                id: d.id,
                from: v.from ?? '',
                text: v.text ?? '',
                level: (v.level ?? 'notice') as AlertLevel,
                acks: (v.acks ?? []) as string[],
                atMs: toMs(v.at),
              }
            },
            setAlerts,
          ),
        ]
        setReady(true)
      })
      .catch((err: unknown) => {
        setAuthError(err instanceof Error ? err.message : 'Could not sign in to Firebase.')
      })
    return () => {
      unsubs.forEach((u) => u())
    }
  }, [])

  const me = useMemo(() => people.find((p) => p.id === meId) ?? null, [people, meId])

  const value = useMemo<StoreValue>(() => {
    const addPerson: StoreValue['addPerson'] = async ({ name, role, zone, post }) => {
      const ref = await addDoc(col('people'), {
        name,
        initials: name
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? '')
          .join(),
        role,
        zone,
        post,
        status: 'off',
        debriefed: false,
        createdAt: serverTimestamp(),
      })
      return ref.id
    }
    const updatePerson: StoreValue['updatePerson'] = async (id, patch) => {
      await updateDoc(doc(col('people'), id), patch)
    }
    const removePerson: StoreValue['removePerson'] = async (id) => {
      await deleteDoc(doc(col('people'), id))
    }

    const addZone: StoreValue['addZone'] = async ({ id, ...rest }) => {
      const zoneId = id ?? makeId()
      await setDoc(doc(col('zones'), zoneId), rest)
      return zoneId
    }
    const updateZone: StoreValue['updateZone'] = async (id, patch) => {
      await updateDoc(doc(col('zones'), id), patch)
    }
    const removeZone: StoreValue['removeZone'] = async (id) => {
      await deleteDoc(doc(col('zones'), id))
    }

    const setStatus: StoreValue['api']['setStatus'] = async (personId, status) => {
      await updateDoc(doc(col('people'), personId), { status })
    }
    const requestBreak: StoreValue['api']['requestBreak'] = async (personId) => {
      await addDoc(col('breaks'), { byId: personId, status: 'pending', at: serverTimestamp() })
    }
    const resolveBreak: StoreValue['api']['resolveBreak'] = async (breakId, approve) => {
      await updateDoc(doc(col('breaks'), breakId), { status: approve ? 'approved' : 'denied' })
      if (approve) {
        const b = breaks.find((x) => x.id === breakId)
        if (b) await setStatus(b.byId, 'break')
      }
    }
    const reportIncident: StoreValue['api']['reportIncident'] = async (personId, text, level) => {
      await addDoc(col('incidents'), { byId: personId, text, level, status: 'open', acks: [], at: serverTimestamp() })
    }
    const ackIncident: StoreValue['api']['ackIncident'] = async (incidentId, personId) => {
      const inc = incidents.find((i) => i.id === incidentId)
      if (inc && inc.acks.includes(personId)) {
        await updateDoc(doc(col('incidents'), incidentId), { status: 'closed' })
      } else {
        await updateDoc(doc(col('incidents'), incidentId), { acks: arrayUnion(personId) })
      }
    }
    const sendAlert: StoreValue['api']['sendAlert'] = async (fromId, text, level) => {
      const person = people.find((p) => p.id === fromId)
      await addDoc(col('alerts'), { from: person?.name ?? 'Captain', text, level, acks: [], at: serverTimestamp() })
    }
    const ackAlert: StoreValue['api']['ackAlert'] = async (alertId, personId) => {
      await updateDoc(doc(col('alerts'), alertId), { acks: arrayUnion(personId) })
    }
    const fileDebrief: StoreValue['api']['fileDebrief'] = async (personId) => {
      await updateDoc(doc(col('people'), personId), { debriefed: true })
    }
    const sendMsg: StoreValue['api']['sendMsg'] = async (threadId, byId, text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      await addDoc(collection(col('threads'), threadId, 'messages'), {
        byId,
        text: trimmed,
        at: serverTimestamp(),
        readBy: [byId],
      })
    }
    const markRead: StoreValue['api']['markRead'] = async (threadId, personId) => {
      const snap = await getDocs(collection(col('threads'), threadId, 'messages'))
      const batch = writeBatch(db)
      let any = false
      snap.docs.forEach((d) => {
        const readBy = (d.data().readBy ?? []) as string[]
        if (!readBy.includes(personId)) {
          batch.update(d.ref, { readBy: arrayUnion(personId) })
          any = true
        }
      })
      if (any) await batch.commit()
    }
    const setTyping: StoreValue['api']['setTyping'] = async (threadId, personId, typing) => {
      await setDoc(
        doc(col('threads'), threadId),
        { typingIds: typing ? arrayUnion(personId) : arrayRemove(personId) },
        { merge: true },
      )
    }

    return {
      state: { ready, authError, people, zones, incidents, breaks, alerts },
      meId,
      me,
      setMeId,
      addPerson,
      updatePerson,
      removePerson,
      addZone,
      updateZone,
      removeZone,
      api: {
        setStatus,
        requestBreak,
        resolveBreak,
        reportIncident,
        ackIncident,
        sendAlert,
        ackAlert,
        fileDebrief,
        sendMsg,
        markRead,
        setTyping,
      },
    }
  }, [ready, authError, people, zones, incidents, breaks, alerts, meId, me])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
