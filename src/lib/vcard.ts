import type { Profile } from '../types'

export function profileToVCard(profile: Profile): string {
  const [firstName, ...rest] = profile.name.trim().split(/\s+/).filter(Boolean)
  const lastName = rest.join(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName || ''};;;`,
    `FN:${profile.name || 'Unnamed'}`,
  ]
  if (profile.firm) lines.push(`ORG:${profile.firm}`)
  if (profile.role) lines.push(`TITLE:${profile.role}`)
  if (profile.email) lines.push(`EMAIL:${profile.email}`)
  if (profile.phone) lines.push(`TEL:${profile.phone}`)
  if (profile.badgeLabel) lines.push(`NOTE:${profile.badgeLabel}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}
