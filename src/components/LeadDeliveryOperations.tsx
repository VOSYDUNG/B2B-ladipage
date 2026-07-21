import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  Loader2,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Webhook,
} from 'lucide-react'
import type {
  LeadIntegrationWorkspace,
  WebhookDeliveryDetail,
  WebhookDeliveryStatus,
} from '@/types'
import type { IntegrationFilters } from '@/lib/admin-integration-service'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

interface LeadDeliveryOperationsProps {
  workspace: LeadIntegrationWorkspace | null
  loadState: LoadState
  onRefresh: (filters?: IntegrationFilters) => Promise<boolean>
  onCommand: (
    action: 'release_delivery' | 'retry_delivery',
    deliveryId: string,
    note: string
  ) => Promise<{ ok: boolean; error?: string }>
  onLoadDetail: (deliveryId: string) => Promise<WebhookDeliveryDetail | null>
}

const STATUS_OPTIONS: Array<{ value: '' | WebhookDeliveryStatus; label: string }> = [
  { value: '', label: 'All states' },
  { value: 'held', label: 'Held' },
  { value: 'pending', label: 'Pending' },
  { value: 'leased', label: 'Leased' },
  { value: 'retry_wait', label: 'Retry wait' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'dead_letter', label: 'Dead letter' },
]

const statusTone = (status: WebhookDeliveryStatus) => {
  switch (status) {
    case 'delivered': return 'bg-emerald-500/15 text-emerald-300'
    case 'held': return 'bg-slate-700 text-slate-300'
    case 'pending': return 'bg-cyan-500/15 text-cyan-300'
    case 'leased': return 'bg-indigo-500/15 text-indigo-300'
    case 'retry_wait': return 'bg-amber-500/15 text-amber-300'
    case 'dead_letter': return 'bg-red-500/15 text-red-300'
  }
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return 'not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'invalid time' : date.toLocaleString()
}

const formatAge = (value?: string | null) => {
  if (!value) return 'none'
  const elapsed = Math.max(0, Date.now() - Date.parse(value))
  if (!Number.isFinite(elapsed)) return 'unknown'
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

export function LeadDeliveryOperations({
  workspace,
  loadState,
  onRefresh,
  onCommand,
  onLoadDetail,
}: LeadDeliveryOperationsProps) {
  const [expanded, setExpanded] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'' | WebhookDeliveryStatus>('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [detail, setDetail] = useState<WebhookDeliveryDetail | null>(null)
  const [detailPending, setDetailPending] = useState<string | null>(null)

  const periodMetrics = useMemo(() => {
    const totals = (workspace?.dailyStats || []).reduce((sum, stat) => ({
      released: sum.released + stat.releasedEvents,
      attempts: sum.attempts + stat.attempts,
      delivered: sum.delivered + stat.deliveredEvents,
      retrying: sum.retrying + stat.retryScheduled,
      dead: sum.dead + stat.deadLetterEvents,
      latency: sum.latency + stat.deliveryLatencySumMs,
    }), { released: 0, attempts: 0, delivered: 0, retrying: 0, dead: 0, latency: 0 })
    return {
      completionRate: totals.released > 0
        ? `${((totals.delivered / totals.released) * 100).toFixed(1)}%`
        : 'n/a',
      meanLatency: totals.delivered > 0
        ? `${Math.round(totals.latency / totals.delivered / 1000)}s`
        : 'n/a',
      retryRate: totals.attempts > 0
        ? `${((totals.retrying / totals.attempts) * 100).toFixed(1)}%`
        : 'n/a',
    }
  }, [workspace?.dailyStats])

  const refresh = async (nextStatus = statusFilter) => {
    setActionError(null)
    const ok = await onRefresh({ status: nextStatus })
    if (!ok) setActionError('Delivery workspace refresh failed.')
  }

  const runCommand = async (
    action: 'release_delivery' | 'retry_delivery',
    deliveryId: string
  ) => {
    const note = (notes[deliveryId] || '').trim()
    if (!note) {
      setActionError('An audit note is required before release or retry.')
      return
    }
    setPendingAction(`${action}:${deliveryId}`)
    setActionError(null)
    const result = await onCommand(action, deliveryId, note)
    setPendingAction(null)
    if (!result.ok) {
      setActionError(result.error || 'Delivery action failed.')
      return
    }
    setNotes((previous) => ({ ...previous, [deliveryId]: '' }))
    setDetail(null)
    await refresh()
  }

  const loadDetail = async (deliveryId: string) => {
    if (detail?.delivery.deliveryId === deliveryId) {
      setDetail(null)
      return
    }
    setDetailPending(deliveryId)
    setActionError(null)
    const next = await onLoadDetail(deliveryId)
    setDetailPending(null)
    if (!next) {
      setActionError('Delivery receipts are unavailable.')
      return
    }
    setDetail(next)
  }

  const health = workspace?.health
  const modeEnabled = workspace?.destination.deliveryMode === 'enabled'

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1322] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-900 bg-cyan-950/30">
            <Webhook className="h-4 w-4 text-cyan-300" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black uppercase text-white">Lead Data Hub</h4>
              <span className={`px-2 py-1 text-[8px] font-black uppercase ${
                modeEnabled
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                delivery {modeEnabled ? 'enabled' : 'off'}
              </span>
              <span className={`px-2 py-1 text-[8px] font-black uppercase ${
                workspace?.destination.configured
                  ? 'bg-cyan-500/15 text-cyan-300'
                  : 'bg-amber-500/15 text-amber-300'
              }`}>
                {workspace?.destination.configured ? 'URL configured' : 'URL unavailable'}
              </span>
            </div>
            <p className="mt-1 truncate font-mono text-[9px] text-slate-500">
              redacted_lead_event_v1 / {workspace?.destination.urlFingerprint?.slice(0, 12) || 'no URL fingerprint'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex min-h-9 items-center gap-2 border border-slate-700 px-3 py-2 text-[10px] font-black text-slate-300 hover:bg-slate-900"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide queue' : 'Open queue'}
        </button>
      </div>

      <div className="grid gap-px bg-slate-800 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Held', health?.held || 0, PauseCircle, 'text-slate-300'],
          ['Actionable', (health?.pending || 0) + (health?.retryWait || 0), Clock3, 'text-cyan-300'],
          ['Delivered today', health?.deliveredToday || 0, CheckCircle2, 'text-emerald-300'],
          ['Dead letter', health?.deadLetter || 0, AlertTriangle, 'text-red-300'],
          ['Oldest due', formatAge(health?.oldestActionableAt), Clock3, 'text-amber-300'],
        ].map(([label, value, Icon, tone]) => (
          <div key={String(label)} className="bg-[#0d1220] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8px] font-black uppercase text-slate-600">{label}</span>
              <Icon className={`h-3.5 w-3.5 ${tone}`} />
            </div>
            <span className={`mt-1 block text-lg font-black ${tone}`}>{value}</span>
          </div>
        ))}
      </div>

      {expanded && (
        <div>
          <div className="grid gap-px border-y border-slate-800 bg-slate-800 sm:grid-cols-3">
            <div className="bg-[#111625] px-4 py-3">
              <span className="text-[8px] font-black uppercase text-slate-600">30-day release cohorts</span>
              <span className="mt-1 block text-sm font-black text-emerald-300">{periodMetrics.completionRate}</span>
            </div>
            <div className="bg-[#111625] px-4 py-3">
              <span className="text-[8px] font-black uppercase text-slate-600">Mean delivery time</span>
              <span className="mt-1 block text-sm font-black text-cyan-300">{periodMetrics.meanLatency}</span>
            </div>
            <div className="bg-[#111625] px-4 py-3">
              <span className="text-[8px] font-black uppercase text-slate-600">Retry / attempts</span>
              <span className="mt-1 block text-sm font-black text-amber-300">{periodMetrics.retryRate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <select
              value={statusFilter}
              onChange={(event) => {
                const status = event.target.value as '' | WebhookDeliveryStatus
                setStatusFilter(status)
                void refresh(status)
              }}
              className="h-9 border border-slate-700 bg-slate-950 px-3 text-[10px] font-black text-slate-300 outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={loadState === 'loading'}
              onClick={() => void refresh()}
              title="Refresh deliveries"
              className="inline-flex h-9 w-9 items-center justify-center border border-slate-700 text-slate-300 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loadState === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {actionError && (
            <div className="border-b border-red-900/60 bg-red-950/25 px-4 py-3 text-[10px] font-bold text-red-300">
              {actionError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-[10px]">
              <thead className="bg-slate-900/60 text-[8px] font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Event / subject</th>
                  <th className="px-4 py-3">Landing / campaign</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Last result</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(workspace?.deliveries || []).map((delivery) => {
                  const actionable = delivery.status === 'held' || delivery.status === 'dead_letter'
                  const action = delivery.status === 'held' ? 'release_delivery' : 'retry_delivery'
                  return (
                    <tr key={delivery.deliveryId} className="align-top hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <span className="block font-black text-slate-200">{delivery.eventType}</span>
                        <span className="mt-1 block font-mono text-[8px] text-slate-600">
                          {delivery.leadFeatureId?.slice(0, 14) || 'deleted subject'} / {delivery.projectionSha256.slice(0, 12)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-black text-slate-300">{delivery.landingId}</span>
                        <span className="mt-1 block font-mono text-[8px] text-slate-600">{delivery.campaignId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-[8px] font-black uppercase ${statusTone(delivery.status)}`}>
                          {delivery.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-black text-slate-300">{delivery.attemptCount}</td>
                      <td className="px-4 py-3">
                        <span className="block text-slate-300">
                          {delivery.lastHttpStatus ? `HTTP ${delivery.lastHttpStatus}` : 'no HTTP result'}
                        </span>
                        <span className="mt-1 block text-[8px] text-red-300">
                          {delivery.lastErrorCode || delivery.failureReason || ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatTimestamp(delivery.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[300px] flex-col items-end gap-2">
                          <button
                            type="button"
                            disabled={detailPending === delivery.deliveryId}
                            onClick={() => void loadDetail(delivery.deliveryId)}
                            className="inline-flex min-h-8 items-center gap-1.5 border border-slate-700 px-2.5 py-1.5 text-[9px] font-black text-slate-300 disabled:opacity-50"
                          >
                            {detailPending === delivery.deliveryId
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Eye className="h-3.5 w-3.5" />}
                            Receipts
                          </button>
                          {workspace?.permissions.canOperate && actionable && (
                            <div className="flex w-full items-center gap-2">
                              <input
                                value={notes[delivery.deliveryId] || ''}
                                maxLength={500}
                                onChange={(event) => setNotes((previous) => ({
                                  ...previous,
                                  [delivery.deliveryId]: event.target.value,
                                }))}
                                placeholder="Required audit note"
                                className="h-8 min-w-0 flex-1 border border-slate-700 bg-slate-950 px-2 text-[9px] text-slate-200 outline-none focus:border-cyan-700"
                              />
                              <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() => void runCommand(action, delivery.deliveryId)}
                                className={`inline-flex h-8 shrink-0 items-center gap-1.5 px-2.5 text-[9px] font-black text-white disabled:opacity-40 ${
                                  action === 'release_delivery' ? 'bg-cyan-700' : 'bg-amber-700'
                                }`}
                              >
                                {pendingAction === `${action}:${delivery.deliveryId}`
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : action === 'release_delivery'
                                    ? <Send className="h-3.5 w-3.5" />
                                    : <RotateCcw className="h-3.5 w-3.5" />}
                                {action === 'release_delivery' ? 'Release' : 'Retry'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {workspace?.deliveries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      No deliveries match this bounded view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {workspace?.truncated && (
            <div className="border-t border-amber-900/40 bg-amber-950/15 px-4 py-2 text-[9px] text-amber-300">
              This view is bounded to {workspace.limit} rows. Refine the state filter for operational review.
            </div>
          )}

          {detail && (
            <div className="border-t border-slate-800 bg-[#0b101b] px-4 py-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[8px] font-black uppercase text-slate-600">Delivery receipts</span>
                  <p className="mt-1 break-all font-mono text-[9px] text-slate-400">{detail.delivery.deliveryId}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  response bodies not stored
                </span>
              </div>
              <div className="grid gap-px bg-slate-800 lg:grid-cols-2">
                <div className="bg-[#0d1220] p-3">
                  <span className="text-[8px] font-black uppercase text-slate-600">Network attempts</span>
                  <div className="mt-2 space-y-2">
                    {detail.attempts.map((attempt) => (
                      <div key={attempt.attemptId} className="flex items-center justify-between gap-3 text-[9px]">
                        <span className="text-slate-400">#{attempt.attemptNumber} / {formatTimestamp(attempt.completedAt)}</span>
                        <span className="font-black text-slate-200">
                          {attempt.httpStatus ? `HTTP ${attempt.httpStatus}` : attempt.errorCode || attempt.outcome}
                        </span>
                      </div>
                    ))}
                    {detail.attempts.length === 0 && <p className="text-[9px] text-slate-600">No network attempts.</p>}
                  </div>
                </div>
                <div className="bg-[#0d1220] p-3">
                  <span className="text-[8px] font-black uppercase text-slate-600">Operator activities</span>
                  <div className="mt-2 space-y-2">
                    {detail.activities.map((activity) => (
                      <div key={activity.activityId} className="text-[9px]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-black text-slate-300">{activity.type.replace(/_/g, ' ')}</span>
                          <span className="text-slate-600">{formatTimestamp(activity.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-slate-500">{activity.note}</p>
                      </div>
                    ))}
                    {detail.activities.length === 0 && <p className="text-[9px] text-slate-600">No operator activity.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
