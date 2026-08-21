import type { AppState } from '../types'
import { BUCKET_LABEL } from '../types'

function fmtContact(c: AppState['contacts'][number]): string {
  const bits = [c.name]
  if (c.firm) bits.push(c.firm)
  bits.push(BUCKET_LABEL[c.bucket] + (c.bucket === 'deal' ? ` (${c.stage})` : ''))
  if (c.tags.length) bits.push(c.tags.join(', '))
  return bits.join(' — ')
}

/**
 * Small offline rule-based concierge. Works with no network and no API key,
 * so it stays useful with bad venue wifi. Understands a handful of common
 * question shapes over the user's own agenda/book/tasks/uploaded notes.
 */
export function answerLocally(state: AppState, question: string): string {
  const q = question.toLowerCase()

  // Time-of-day / agenda lookups
  const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(a|am|p|pm)?/)
  if (/what.*(on|happening|next)|agenda|schedule/.test(q) || timeMatch) {
    if (state.sessions.length === 0) {
      return 'No agenda saved yet. Add sessions in Rooms and I can tell you what is on next.'
    }
    if (/next|now|current/.test(q) && !timeMatch?.[0]) {
      const current = state.sessions.find((s) => s.id === state.currentSessionId)
      if (current) return `Right now: ${current.title} in ${current.room} (${current.time}).`
    }
    const list = state.sessions.map((s) => `${s.time} — ${s.title} (${s.room})`).join('\n')
    return `Today's agenda:\n${list}`
  }

  // Who should I meet next / follow up with
  if (/who should i (meet|talk to|see)|meet next/.test(q)) {
    const open = state.tasks.filter((t) => !t.done)
    if (open.length) {
      const t = open[0]
      return `Start with ${t.who || 'your next follow-up'}: ${t.what} (due ${t.dueLabel}).`
    }
    const newDeals = state.contacts.filter((c) => c.bucket === 'deal' && c.stage === 'New')
    if (newDeals.length) {
      return `You have ${newDeals.length} new deal conversation${newDeals.length === 1 ? '' : 's'} waiting on a next step: ${newDeals
        .slice(0, 3)
        .map((c) => c.name)
        .join(', ')}.`
    }
    return 'Nothing urgent open. Good time to work the floor and scan a new badge.'
  }

  // Summarize my day / book
  if (/summar(y|ize)/.test(q) && /(day|book|today)/.test(q)) {
    const today = state.contacts.filter((c) => {
      const d1 = new Date(c.createdAt)
      const d0 = new Date()
      return d1.toDateString() === d0.toDateString()
    })
    const deals = state.contacts.filter((c) => c.bucket === 'deal').length
    const refs = state.contacts.filter((c) => c.bucket === 'referral').length
    const open = state.tasks.filter((t) => !t.done).length
    return `${today.length} scanned today. Book stands at ${deals} deals and ${refs} referral sources, ${open} follow-up${
      open === 1 ? '' : 's'
    } still open.`
  }

  // Open follow-ups / promises
  if (/(follow.?up|promise|owe|task)/.test(q)) {
    const open = state.tasks.filter((t) => !t.done)
    if (!open.length) return 'Nothing open. You are caught up.'
    return `Open follow-ups:\n${open.map((t) => `${t.who || 'Someone'} — ${t.what} (${t.dueLabel})`).join('\n')}`
  }

  // Search the book by name/firm/tag
  const bookHit = state.contacts.filter((c) =>
    q.split(/\s+/).some((word) => word.length > 2 && (c.name.toLowerCase().includes(word) || c.firm.toLowerCase().includes(word))),
  )
  if (bookHit.length) {
    return bookHit.slice(0, 5).map(fmtContact).join('\n')
  }

  // Uploaded docs keyword search
  if (state.docs.length) {
    const words = q.split(/\s+/).filter((w) => w.length > 3)
    for (const doc of state.docs) {
      const lower = doc.text.toLowerCase()
      const hitWord = words.find((w) => lower.includes(w))
      if (hitWord) {
        const idx = lower.indexOf(hitWord)
        const start = Math.max(0, idx - 120)
        const excerpt = doc.text.slice(start, idx + 200).trim()
        return `From ${doc.name}:\n…${excerpt}…`
      }
    }
  }

  if (state.docs.length === 0 && state.sessions.length === 0 && state.contacts.length === 0) {
    return 'Nothing to go on yet — add your agenda in Rooms, scan a few badges, or upload notes here and ask again.'
  }

  return "I couldn't match that to your agenda, book or notes. Try asking about the schedule, a name in your book, or open follow-ups — or upload the agenda/attendee list here for more."
}
