import { useState } from 'react'
import { todayISO } from '../lib/dates'
import { newId } from '../lib/format'
import type { AppData, StickyNote, StickyNoteColor } from '../types'
import { HelpBox } from '../components/HelpBox'

const COLORS: { id: StickyNoteColor; className: string }[] = [
  { id: 'yellow', className: 'bg-amber-100 border-amber-300' },
  { id: 'pink', className: 'bg-pink-100 border-pink-300' },
  { id: 'blue', className: 'bg-sky-100 border-sky-300' },
  { id: 'green', className: 'bg-emerald-100 border-emerald-300' },
]

type Props = {
  data: AppData
  setData: (fn: (d: AppData) => AppData) => void
}

export function NotesPage({ data, setData }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState<StickyNoteColor>('yellow')

  function addNote() {
    if (!title.trim() && !body.trim()) return
    const note: StickyNote = {
      id: newId(),
      title: title.trim() || 'Note',
      body: body.trim(),
      color,
      updatedAt: todayISO(),
    }
    setData((d) => ({ ...d, stickyNotes: [note, ...d.stickyNotes] }))
    setTitle('')
    setBody('')
  }

  function updateNote(id: string, patch: Partial<StickyNote>) {
    setData((d) => ({
      ...d,
      stickyNotes: d.stickyNotes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: todayISO() } : n,
      ),
    }))
  }

  function removeNote(id: string) {
    setData((d) => ({
      ...d,
      stickyNotes: d.stickyNotes.filter((n) => n.id !== id),
    }))
  }

  return (
    <div className="space-y-4">
      <HelpBox title="Sticky notes">
        <p>
          Write anything that is not an expense: reminders, account numbers,
          shopping lists, or plans. Saved on this phone like your expenses.
        </p>
      </HelpBox>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
        <h2 className="font-semibold text-amber-950">New note</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Bank details)"
          className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your note here…"
          rows={4}
          className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
        />
        <div className="mt-2 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              className={`h-8 w-8 rounded-full border-2 ${c.className} ${
                color === c.id ? 'ring-2 ring-amber-600 ring-offset-1' : ''
              }`}
              aria-label={`Color ${c.id}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addNote}
          className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white"
        >
          Stick note
        </button>
      </section>

      {data.stickyNotes.length === 0 ? (
        <p className="text-center text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.stickyNotes.map((note) => {
            const style =
              COLORS.find((c) => c.id === note.color)?.className ??
              COLORS[0].className
            return (
              <li
                key={note.id}
                className={`rounded-2xl border p-4 shadow-sm ${style}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) =>
                      updateNote(note.id, { title: e.target.value })
                    }
                    className="w-full bg-transparent text-base font-semibold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    className="shrink-0 text-sm text-slate-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <textarea
                  value={note.body}
                  onChange={(e) => updateNote(note.id, { body: e.target.value })}
                  rows={3}
                  className="mt-2 w-full resize-y bg-transparent text-sm outline-none"
                />
                <p className="mt-2 text-xs text-slate-600">
                  Updated {note.updatedAt}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
