import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Index,
})

const SAMPLE = `Hey — I run engineering at a small team building brain-encoding models for outreach. I've been reading your last three posts on attention and systems thinking, and I think you'd have strong opinions about what we're trying to do. Would you trade 20 minutes next week for a look at what we've built?`

function Index() {
  const navigate = useNavigate()
  const createRoot = useMutation(api.variants.createRoot)
  const [message, setMessage] = useState(SAMPLE)
  const [title, setTitle] = useState('Cold outreach — engineer')
  const [loading, setLoading] = useState(false)

  async function start() {
    setLoading(true)
    try {
      const { sessionId } = await createRoot({ title, message })
      navigate({ to: '/session/$id', params: { id: sessionId } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-semibold">NeuralReach — brain-scored outreach</h1>
        <p className="text-neutral-400 text-sm">
          Write a message. We run it through Meta TRIBE v2, predict cortical activation at
          20,484 vertices, and score it for curiosity, social cognition, and threat.
        </p>
        <input
          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session title"
        />
        <textarea
          className="w-full h-48 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded font-mono text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          onClick={start}
          disabled={loading || !message.trim()}
        >
          {loading ? 'Scoring…' : 'Start session'}
        </button>
      </div>
    </div>
  )
}
