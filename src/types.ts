export type Bucket = 'deal' | 'referral' | 'contact'
export type Stage = 'New' | 'Qualified' | 'Proposal' | 'Won'

export const STAGES: Stage[] = ['New', 'Qualified', 'Proposal', 'Won']

export interface LogEntry {
  id: string
  when: string
  at: number
  what: string
}

export interface Contact {
  id: string
  name: string
  firm: string
  city: string
  email: string
  phone: string
  bucket: Bucket
  stage: Stage
  tags: string[]
  sessionId: string | null
  met: string
  createdAt: number
  log: LogEntry[]
}

export interface FollowUpTask {
  id: string
  contactId: string | null
  who: string
  what: string
  dueLabel: string
  createdAt: number
  done: boolean
}

export interface Goal {
  key: string
  label: string
  note: string
  target: number
  count: number
}

export type ChannelTone = 'blue' | 'gold'

export interface Channel {
  key: string
  label: string
  mark: string
  value: string
  placeholder?: string
  on: boolean
  connectable: boolean
  connected: boolean
  tone: ChannelTone
}

export interface EventSession {
  id: string
  time: string
  title: string
  room: string
}

export interface Profile {
  name: string
  firm: string
  role: string
  focus: string[]
  email: string
  phone: string
  scanTarget: number
  badgeLabel: string
}

export interface UploadedDoc {
  id: string
  name: string
  text: string
  addedAt: number
}

export interface AskMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  at: number
}

export interface AppState {
  onboarded: boolean
  profile: Profile
  contacts: Contact[]
  tasks: FollowUpTask[]
  goals: Goal[]
  channels: Channel[]
  sessions: EventSession[]
  currentSessionId: string | null
  docs: UploadedDoc[]
  askMessages: AskMessage[]
  aiApiKey: string
  eventName: string
  eventYear: string
}

export const BUCKET_LABEL: Record<Bucket, string> = {
  deal: 'Deal',
  referral: 'Referral',
  contact: 'Contact',
}
