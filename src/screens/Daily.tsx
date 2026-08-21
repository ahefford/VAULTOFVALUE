import { useState } from 'react'
import { useStore } from '../store/store'
import { Sheet } from '../components/Sheet'
import { VERSES } from '../lib/verses'

export function Daily() {
  const { state, incGoal, decGoal, addGoal, removeGoal, toggleTask, deleteTask, addTask } = useStore()
  const [verseIdx, setVerseIdx] = useState(0)
  const [addingGoal, setAddingGoal] = useState(false)
  const [goalLabel, setGoalLabel] = useState('')
  const [goalTarget, setGoalTarget] = useState(5)
  const [addingTask, setAddingTask] = useState(false)
  const [taskWho, setTaskWho] = useState('')
  const [taskWhat, setTaskWhat] = useState('')
  const [taskDue, setTaskDue] = useState('Today')

  const hit = state.goals.filter((g) => g.count >= g.target).length
  const pct = state.goals.length
    ? Math.round((100 * state.goals.reduce((a, g) => a + Math.min(1, g.count / g.target), 0)) / state.goals.length)
    : 0
  const openTasks = state.tasks.filter((t) => !t.done)
  const doneTasks = state.tasks.filter((t) => t.done)
  const verse = VERSES[verseIdx % VERSES.length]

  const saveGoal = () => {
    if (!goalLabel.trim()) return
    addGoal(goalLabel.trim(), goalTarget)
    setGoalLabel('')
    setGoalTarget(5)
    setAddingGoal(false)
  }

  const saveTask = () => {
    if (!taskWhat.trim()) return
    addTask({ who: taskWho.trim(), what: taskWhat.trim(), dueLabel: taskDue.trim() || 'Today' })
    setTaskWho('')
    setTaskWhat('')
    setTaskDue('Today')
    setAddingTask(false)
  }

  return (
    <div style={{ padding: '18px 18px 32px' }}>
      <div className="kicker">Daily</div>
      <h2 style={{ font: '600 30px/1.08 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>Work the room.</h2>
      <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
        {hit} of {state.goals.length} goals hit · {pct}% of the day
      </p>

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state.goals.map((g) => {
          const done = g.count >= g.target
          const barW = Math.min(100, Math.round((100 * g.count) / g.target))
          return (
            <div key={g.key} className="card" style={{ padding: '13px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ font: '600 15px/1.25 var(--font-heading)' }}>{g.label}</div>
                <div style={{ font: '600 14px/1 var(--font-heading)', color: done ? 'var(--color-accent-800)' : 'var(--color-neutral-700)' }}>
                  {g.count} / {g.target}
                </div>
              </div>
              {g.note && <div style={{ font: '400 12px/1.35 var(--font-body)', color: 'var(--color-neutral-600)', marginTop: 3 }}>{g.note}</div>}
              <div style={{ height: 5, background: 'var(--color-neutral-200)', borderRadius: 3, marginTop: 9, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${barW}%`, background: done ? 'var(--color-process-yellow)' : 'var(--color-accent-700)', transition: 'width 0.2s ease' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: 34, height: 30, padding: 0 }} onClick={() => decGoal(g.key)}>
                  −
                </button>
                <button type="button" className="btn btn-primary btn-sm" style={{ width: 34, height: 30, padding: 0 }} onClick={() => incGoal(g.key)}>
                  ＋
                </button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--color-danger)' }} onClick={() => removeGoal(g.key)}>
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={() => setAddingGoal(true)}>
        + Add goal
      </button>

      <div className="kicker" style={{ marginTop: 26 }}>
        Open follow-ups · {openTasks.length}
      </div>
      <div style={{ marginTop: 10 }}>
        {openTasks.length === 0 && <div style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-600)', padding: '6px 0' }}>Nothing owed. Go find someone.</div>}
        {openTasks.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>
            <button
              type="button"
              onClick={() => toggleTask(t.id)}
              style={{ width: 22, height: 22, flex: 'none', borderRadius: 5, border: '1px solid var(--color-neutral-400)', background: 'transparent', cursor: 'pointer' }}
              aria-label="Mark done"
            />
            <div style={{ flex: 1 }}>
              <div style={{ font: '400 14px/1.3 var(--font-body)' }}>
                {t.who && <strong>{t.who} — </strong>}
                {t.what}
              </div>
              <div style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-accent-2-700)', marginTop: 3 }}>{t.dueLabel}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteTask(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {doneTasks.length > 0 && (
        <>
          <div className="kicker" style={{ marginTop: 22 }}>
            Done · {doneTasks.length}
          </div>
          <div style={{ marginTop: 10 }}>
            {doneTasks.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-divider)', opacity: 0.5 }}>
                <button
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  style={{ width: 22, height: 22, flex: 'none', borderRadius: 5, border: '1px solid var(--color-process-yellow)', background: 'var(--color-process-yellow)', cursor: 'pointer' }}
                  aria-label="Mark not done"
                />
                <div style={{ flex: 1, textDecoration: 'line-through', font: '400 14px/1.3 var(--font-body)' }}>
                  {t.who && <strong>{t.who} — </strong>}
                  {t.what}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={() => setAddingTask(true)}>
        + Add follow-up
      </button>

      <div className="card" style={{ marginTop: 26, padding: '16px 16px 14px' }}>
        <div className="kicker">Verse</div>
        <p style={{ font: '400 16px/1.5 var(--font-body)', margin: '8px 0 0', fontStyle: 'italic' }}>&ldquo;{verse.text}&rdquo;</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <a href={verse.url} target="_blank" rel="noreferrer" style={{ font: '600 13px/1 var(--font-heading)' }}>
            {verse.ref}
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVerseIdx((i) => i + 1)}>
            Next
          </button>
        </div>
      </div>

      {addingGoal && (
        <Sheet title="Add goal" onClose={() => setAddingGoal(false)}>
          <div className="field">
            <label>Goal</label>
            <input className="input" value={goalLabel} onChange={(e) => setGoalLabel(e.target.value)} placeholder="e.g. Coffees booked" />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Target</label>
            <input className="input" type="number" min={1} value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value) || 1)} />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={saveGoal} disabled={!goalLabel.trim()}>
            Save
          </button>
        </Sheet>
      )}

      {addingTask && (
        <Sheet title="Add follow-up" onClose={() => setAddingTask(false)}>
          <div className="field">
            <label>Who</label>
            <input className="input" value={taskWho} onChange={(e) => setTaskWho(e.target.value)} placeholder="Optional" />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>What</label>
            <input className="input" value={taskWhat} onChange={(e) => setTaskWhat(e.target.value)} placeholder="Send the deck" />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Due</label>
            <input className="input" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} placeholder="Today, 6:00p" />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={saveTask} disabled={!taskWhat.trim()}>
            Save
          </button>
        </Sheet>
      )}
    </div>
  )
}
