import Anthropic from '@anthropic-ai/sdk'
import type { AppState } from '../types'
import { BUCKET_LABEL } from '../types'

/**
 * Optional BYOK concierge: only called when the user has pasted their own
 * Anthropic API key into Settings. The key never leaves the browser except
 * in the direct request to api.anthropic.com.
 */
export async function askClaude(state: AppState): Promise<string> {
  const client = new Anthropic({ apiKey: state.aiApiKey, dangerouslyAllowBrowser: true })

  const agenda = state.sessions.length
    ? state.sessions.map((s) => `${s.time} — ${s.title} (${s.room})`).join('\n')
    : '(no agenda saved)'
  const currentRoom = state.sessions.find((s) => s.id === state.currentSessionId)
  const book = state.contacts.length
    ? state.contacts
        .map(
          (c) =>
            `${c.name}, ${c.firm || 'no firm listed'}, ${BUCKET_LABEL[c.bucket]}${c.bucket === 'deal' ? '/' + c.stage : ''}, met ${c.met}${
              c.tags.length ? ', tags: ' + c.tags.join('; ') : ''
            }`,
        )
        .join('\n')
    : '(no contacts scanned yet)'
  const openTasks = state.tasks.filter((t) => !t.done)
  const uploads = state.docs.length
    ? state.docs.map((d) => `--- ${d.name} ---\n${d.text}`).join('\n\n')
    : '(nothing uploaded)'

  const system = [
    `You are the event concierge inside a personal networking app called ${state.eventName} ${state.eventYear}.`,
    'Answer only from the context below. If it is not there, say so in one line and suggest what the user could upload.',
    'Be brief: two or three sentences, or a short list. No preamble, no restating the question.',
    '',
    "TODAY'S AGENDA:\n" + agenda,
    '',
    'CURRENT ROOM: ' + (currentRoom ? `${currentRoom.title} (${currentRoom.room})` : 'not set'),
    '',
    "THE USER'S BOOK OF BUSINESS:\n" + book,
    '',
    'OPEN FOLLOW-UPS:\n' + (openTasks.length ? openTasks.map((t) => `${t.who} — ${t.what} (${t.dueLabel})`).join('\n') : '(none)'),
    '',
    'UPLOADED EVENT DATA:\n' + uploads,
  ].join('\n')

  // state.askMessages already ends with this question (the caller appends it
  // before invoking us) — reuse it as-is instead of appending a duplicate.
  const recent = state.askMessages.slice(-8).map((m) => ({
    role: m.role,
    content: m.text,
  }))

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 600,
    system,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low' },
    messages: recent,
  })

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  return (textBlock?.text ?? '').trim() || 'No answer came back. Try again.'
}
