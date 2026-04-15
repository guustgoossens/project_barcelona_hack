import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import Brain from '../components/Brain'
import Timeline from '../components/Timeline'
import ScoreBars from '../components/ScoreBars'
import BranchTree from '../components/BranchTree'
import { fetchActivations, type ActivationMatrix } from '../lib/activations'

export const Route = createFileRoute('/session/$id')({
  component: Session,
})

const MESH_URL = '/fsaverage5.glb'
const HEMISPHERE_SPLIT = 10242

function Session() {
  const { id } = Route.useParams()
  const sessionId = id as Id<'sessions'>
  const variants = useQuery(api.variants.list, { sessionId }) ?? []
  const [selectedId, setSelectedId] = useState<Id<'variants'> | null>(null)
  const createChild = useMutation(api.variants.createChild)
  const archive = useMutation(api.variants.archive)

  useEffect(() => {
    if (!selectedId && variants.length) setSelectedId(variants[0]._id as Id<'variants'>)
  }, [variants, selectedId])

  const selected = useMemo(
    () => variants.find((v) => v._id === selectedId) ?? null,
    [variants, selectedId],
  )
  const full = useQuery(
    api.variants.get,
    selectedId ? { id: selectedId } : 'skip',
  )

  const [timestep, setTimestep] = useState(0)
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [matrix, setMatrix] = useState<ActivationMatrix | null>(null)

  useEffect(() => {
    setMatrix(null)
    setTimestep(0)
    if (!full || !full.activationsUrl || !full.shape) return
    const [T, V] = full.shape as [number, number]
    let cancelled = false
    fetchActivations(full.activationsUrl, [T, V])
      .then((m) => !cancelled && setMatrix(m))
      .catch((e) => console.error(e))
    return () => {
      cancelled = true
    }
  }, [full?.activationsUrl, full?.shape?.[0], full?.shape?.[1]])

  async function mutate(parentId: Id<'variants'>) {
    const parent = variants.find((v) => v._id === parentId)
    if (!parent) return
    const next = window.prompt('New variant message:', parent.message)
    if (!next) return
    await createChild({ parentId, message: next })
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-neutral-950 text-neutral-100 grid grid-cols-[320px_1fr_280px]">
      <aside className="border-r border-neutral-900 overflow-y-auto p-3">
        <h2 className="text-sm font-semibold mb-3 text-neutral-300">Variants</h2>
        <BranchTree
          variants={variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onArchive={(id) => archive({ id })}
          onMutate={mutate}
        />
      </aside>

      <section className="flex flex-col">
        <div className="flex-1 relative">
          {matrix ? (
            <Brain
              meshUrl={MESH_URL}
              activations={matrix}
              timestep={timestep}
              showLeft={showLeft}
              showRight={showRight}
              hemisphereSplit={HEMISPHERE_SPLIT}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
              {selected?.status === 'scoring' || selected?.status === 'pending'
                ? 'Scoring variant on GPU…'
                : selected?.status === 'failed'
                  ? `Failed: ${selected.error ?? 'unknown'}`
                  : 'Select a variant.'}
            </div>
          )}
        </div>
        {matrix && full?.fps && (
          <div className="p-3 border-t border-neutral-900 space-y-2">
            <Timeline
              T={matrix.T}
              fps={full.fps}
              hemodynamicOffsetS={full.hemodynamicOffsetS ?? 5}
              timestep={timestep}
              setTimestep={setTimestep}
            />
            <div className="flex gap-3 text-xs text-neutral-400">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showLeft}
                  onChange={(e) => setShowLeft(e.target.checked)}
                />
                Left hemisphere
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showRight}
                  onChange={(e) => setShowRight(e.target.checked)}
                />
                Right hemisphere
              </label>
            </div>
          </div>
        )}
      </section>

      <aside className="border-l border-neutral-900 overflow-y-auto p-3 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Message</h2>
          <div className="text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded p-2 whitespace-pre-wrap">
            {selected?.message ?? '—'}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Scores</h2>
          <ScoreBars scores={selected?.scores ?? null} />
        </div>
      </aside>
    </div>
  )
}
