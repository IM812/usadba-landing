'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { FaqItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function FaqSettings() {
  const { data, mutate } = useSWR('/api/admin/faq', fetcher)
  const items: FaqItem[] = data?.data ?? []

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  async function addItem() {
    if (!question.trim() || !answer.trim()) return
    setAdding(true)
    try {
      await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim(), sort_order: items.length }),
      })
      setQuestion(''); setAnswer('')
      setShowAdd(false)
      mutate()
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id: string) {
    await fetch('/api/admin/faq', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">FAQ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Часто задаваемые вопросы</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Добавить
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Новый вопрос</h2>
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Вопрос" value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <textarea placeholder="Ответ" value={answer} rows={4}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Отмена
              </button>
              <button onClick={addItem} disabled={adding || !question.trim() || !answer.trim()}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">FAQ пока пуст</p>
        )}
        {items.map((item, i) => (
          <div key={item.id} className={`px-5 py-4 ${i < items.length - 1 ? 'border-b border-border' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.question}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.answer}</p>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
