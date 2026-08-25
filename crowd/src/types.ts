export type Role = 'member' | 'lead' | 'captain'
export type PersonStatus = 'in' | 'break' | 'off'
export type AlertLevel = 'notice' | 'emergency'
export type IncidentLevel = 'med' | 'high'
export type BreakStatus = 'pending' | 'approved' | 'denied'

export interface Person {
  id: string
  name: string
  initials: string
  role: Role
  zone: string | null
  post: string
  status: PersonStatus
  debriefed: boolean
  createdAt: number
}

export interface Zone {
  id: string
  name: string
  short: string
  leadId: string | null
  dutiesLabel: string
}

export interface Incident {
  id: string
  byId: string
  text: string
  level: IncidentLevel
  status: 'open' | 'closed'
  acks: string[]
  atMs: number
}

export interface BreakRequest {
  id: string
  byId: string
  status: BreakStatus
  atMs: number
}

export interface Alert {
  id: string
  from: string
  text: string
  level: AlertLevel
  acks: string[]
  atMs: number
}

export interface Message {
  id: string
  byId: string
  text: string
  atMs: number
  readBy: string[]
}

export const DUTIES: Record<string, string[]> = {
  main: [
    'Direct guests to the correct seating area for their ticket tier',
    'Monitor aisles and walkways for congestion; clear blocked paths immediately',
    'Assist guests with directions, seating disputes, and general questions',
    'Watch for unauthorized tier crossovers between General, Platinum, and restricted areas',
  ],
  reg: [
    'Scan and verify credentials at the designated entry point',
    "Issue wristbands/badges matching each guest's ticket tier",
    'Redirect guests with incorrect or missing credentials to box office support',
    'Manage entry line flow and prevent bottlenecks at the door',
  ],
  exits: [
    'Monitor exit doors and keep pathways clear throughout the event',
    'Assist guests with early departures and re-entry policy',
    'Prepare for end-of-event mass egress — hold doors and direct flow',
    'Watch for and report any emergency exit obstructions',
  ],
}

export const SELF_CHECK = [
  'No guest complaints reach your Team Lead',
  'Zero unauthorized tier crossovers happen in your area',
  'Your lead never has to repeat an instruction to you',
  "You catch problems before they're reported to you",
  'Guests leave your interaction feeling helped, not processed',
  'You get a shoutout from your Lead or the Captain at debrief',
]

export const MAP_PINS: Record<string, [string, string]> = {
  main: ['31%', '40%'],
  reg: ['62%', '73%'],
  exits: ['77%', '30%'],
}

export const STATUS_META: Record<PersonStatus, { color: string; label: string }> = {
  in: { color: '#C9A227', label: 'IN POSITION' },
  break: { color: '#7FA893', label: 'ON BREAK' },
  off: { color: '#5B6B60', label: 'NOT CHECKED IN' },
}

export function dmThreadId(a: string, b: string): string {
  return 'dm:' + [a, b].sort().join('-')
}

export function zoneThreadId(zoneId: string): string {
  return 'zone:' + zoneId
}
