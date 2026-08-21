import type { AppState, Goal, Channel } from '../types'

export const STORAGE_KEY = 'vault-of-value:v1'

export const DEFAULT_GOALS: Goal[] = [
  { key: 'scans', label: 'Badges scanned', target: 12, count: 0, note: 'Every scan filed before you move on' },
  { key: 'deals', label: 'Deal conversations', target: 5, count: 0, note: 'Money actually discussed' },
  { key: 'refs', label: 'Referral sources opened', target: 4, count: 0, note: 'People who can send you business' },
  { key: 'intros', label: 'Introductions made for others', target: 3, count: 0, note: 'Give first' },
  { key: 'notes', label: 'Follow-ups sent same day', target: 8, count: 0, note: 'Before you sleep' },
]

export function defaultChannels(email: string, phone: string): Channel[] {
  return [
    { key: 'email', label: 'Email', mark: '@', value: email, on: !!email, connectable: false, connected: false, tone: 'blue' },
    { key: 'phone', label: 'Mobile', mark: '#', value: phone, on: !!phone, connectable: false, connected: false, tone: 'blue' },
    { key: 'linkedin', label: 'LinkedIn', mark: 'in', value: '', placeholder: 'linkedin.com/in/you', on: false, connectable: false, connected: false, tone: 'blue' },
    { key: 'site', label: 'Website', mark: 'W', value: '', placeholder: 'yoursite.com', on: false, connectable: false, connected: false, tone: 'blue' },
  ]
}

export function defaultState(): AppState {
  return {
    onboarded: false,
    profile: {
      name: '',
      firm: '',
      role: 'Advisor / wealth manager',
      focus: ['Deals'],
      email: '',
      phone: '',
      scanTarget: 12,
      badgeLabel: '',
    },
    contacts: [],
    tasks: [],
    goals: DEFAULT_GOALS,
    channels: defaultChannels('', ''),
    sessions: [],
    currentSessionId: null,
    docs: [],
    askMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Add your agenda in Rooms, then ask me things like "who should I meet next" or "what is on this afternoon." I answer from your book, your rooms and anything you upload here — nothing leaves your device.',
        at: Date.now(),
      },
    ],
    aiApiKey: '',
    eventName: 'The Vault',
    eventYear: new Date().getFullYear().toString(),
  }
}
