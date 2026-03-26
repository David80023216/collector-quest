'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'

export default function TriviaPage() {
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadTrivia() {
    setLoading(true)
    setSelected(null)
    setResult(null)
    const res = await fetch('/api/trivia')
    const data = await res.json()
    setQuestion(data.question ?? null)
    setLoading(false)
  }

  useEffect(() => { loadTrivia() }, [])

  async function submitAnswer() {
    if (!selected || !question) return
    setSubmitting(true)
    const res = await fetch('/api/trivia/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, answer: selected }),
    })
    const data = await res.json()
    setSubmitting(false)
    setResult(data)
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sports Trivia ❓</h1>
          <p className="text-slate-400 text-sm mt-1">Answer correctly to earn entries and points</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading question...</div>
        ) : !question ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">You&apos;ve answered today&apos;s trivia!</h3>
            <p className="text-slate-400 text-sm">Come back tomorrow for more questions</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full capitalize">{question.category?.toLowerCase()}</span>
              <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded-full capitalize">{question.difficulty?.toLowerCase()}</span>
            </div>

            <h2 className="text-lg font-semibold text-slate-100 mb-6 leading-relaxed">{question.question}</h2>

            {!result ? (
              <>
                <div className="space-y-3 mb-6">
                  {question.options?.map((opt: string, i: number) => (
                    <button
                      key={opt}
                      onClick={() => setSelected(opt)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-3
                        ${selected === opt
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-700 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                        }`}
                    >
                      <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${selected === opt ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-500'}`}>
                        {optionLabels[i]}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
                <Button className="w-full" loading={submitting} disabled={!selected} onClick={submitAnswer}>
                  Submit Answer
                </Button>
              </>
            ) : (
              <div className={`rounded-xl p-5 text-center ${result.correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <div className="text-4xl mb-3">{result.correct ? '✅' : '❌'}</div>
                <h3 className={`text-xl font-bold mb-2 ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.correct ? 'Correct!' : 'Not quite!'}
                </h3>
                {!result.correct && (
                  <p className="text-sm text-slate-300 mb-2">
                    Correct answer: <strong className="text-emerald-400">{result.correctAnswer}</strong>
                  </p>
                )}
                {result.explanation && (
                  <p className="text-sm text-slate-400 mb-4">{result.explanation}</p>
                )}
                {result.correct && (
                  <div className="flex justify-center gap-4 mb-4">
                    {result.entries > 0 && <span className="text-amber-400 font-bold">+{result.entries} 🎟️</span>}
                    {result.points > 0 && <span className="text-emerald-400 font-bold">+{result.points} ⭐</span>}
                  </div>
                )}
                <Button variant="secondary" onClick={loadTrivia} className="w-full">
                  Next Question
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
