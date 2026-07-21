import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Database,
  Download,
  FileText,
  LogOut,
  PackageCheck,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react'
import { landingRegistry } from '@/config/landing-registry'
import { WL_PRODUCTS } from '@/config/white-lotus'
import { fetchAdminLeads } from '@/lib/admin-lead-service'
import { downloadLeadsCsv } from '@/lib/lead-export'
import type { CrmUserSession, UnifiedLead } from '@/types'

type LoadState = 'loading' | 'ready' | 'error'

interface CampaignLeadDashboardProps {
  currentUser: CrmUserSession
  onLogout: () => Promise<void>
}

const campaigns = Object.values(landingRegistry).map((landing) => ({
  id: landing.campaignId,
  landingId: landing.landingId,
  name: landing.name,
}))

const productNames = new Map(WL_PRODUCTS.map((product) => [product.product_id, product.canonical_name]))

const identityOf = (lead: UnifiedLead) => ({
  pharmacyName: lead.identity?.pharmacy_name || lead.pharmacy_name || 'Chưa có tên cơ sở',
  contactName: lead.identity?.contact_name || lead.contact_name || 'Chưa có người liên hệ',
  phone: lead.identity?.phone || lead.phone_number || '',
  province: lead.identity?.province || lead.province || 'Chưa xác định',
})

const leadTypeOf = (lead: UnifiedLead) => lead.attribution?.lead_type || lead.lead_type || 'UNKNOWN'

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const formatValue = (lead: UnifiedLead) => {
  const value = lead.selection?.selected_package_value
  if (typeof value !== 'number') return '—'
  return `${new Intl.NumberFormat('vi-VN').format(value)} ${lead.selection?.currency || 'LAK'}`
}

const productSummary = (lead: UnifiedLead) => {
  const items = lead.selection?.items || []
  if (!items.length) return lead.selection?.need_type || 'Không có sản phẩm'
  return items.map((item) => (
    `${productNames.get(item.product_id) || item.product_id} × ${item.quantity}`
  )).join(', ')
}

export default function CampaignLeadDashboard({ currentUser, onLogout }: CampaignLeadDashboardProps) {
  const [campaignId, setCampaignId] = useState('WL_NEW_PRODUCTS_2026_Q3')
  const [leads, setLeads] = useState<UnifiedLead[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [search, setSearch] = useState('')
  const [leadType, setLeadType] = useState('ALL')

  const loadLeads = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage('')
    try {
      const result = await fetchAdminLeads({ campaignId, readLimit: 500 })
      setLeads(result.leads)
      setTruncated(result.truncated)
      setLoadState('ready')
    } catch (error) {
      console.error('Campaign Lead query failed:', error)
      setLeads([])
      setTruncated(false)
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải Lead từ Firestore')
      setLoadState('error')
    }
  }, [campaignId])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  const leadTypes = useMemo(() => (
    Array.from(new Set(leads.map(leadTypeOf))).sort()
  ), [leads])

  const visibleLeads = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi')
    return leads.filter((lead) => {
      if (leadType !== 'ALL' && leadTypeOf(lead) !== leadType) return false
      if (!keyword) return true
      const identity = identityOf(lead)
      return [
        identity.pharmacyName,
        identity.contactName,
        identity.phone,
        identity.province,
        productSummary(lead),
      ].some((value) => value.toLocaleLowerCase('vi').includes(keyword))
    })
  }, [leadType, leads, search])

  const summary = useMemo(() => ({
    total: leads.length,
    orders: leads.filter((lead) => leadTypeOf(lead) === 'ORDER').length,
    samples: leads.filter((lead) => leadTypeOf(lead) === 'SAMPLE_REQUEST').length,
    orderValue: leads.reduce((sum, lead) => (
      sum + (leadTypeOf(lead) === 'ORDER' ? lead.selection?.selected_package_value || 0 : 0)
    ), 0),
  }), [leads])

  const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/nnc-logo.png" alt="NNC Pharma" className="h-9 w-auto shrink-0" />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <h1 className="truncate text-base font-extrabold">Quản trị Lead theo Campaign</h1>
              <p className="truncate text-xs text-slate-500">Firestore Lead Registry</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-700">{currentUser.email}</p>
              <p className="text-[11px] text-slate-500">{currentUser.role}</p>
            </div>
            <button
              type="button"
              onClick={() => void onLogout()}
              title="Đăng xuất"
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        <section className="border-b border-slate-200 pb-5">
          <label htmlFor="campaign-filter" className="mb-2 block text-xs font-bold uppercase text-slate-500">
            Campaign đang xem
          </label>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <select
              id="campaign-filter"
              value={campaignId}
              onChange={(event) => {
                setCampaignId(event.target.value)
                setLeadType('ALL')
                setSearch('')
              }}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 lg:max-w-xl"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.id}</option>
              ))}
            </select>
            <p className="font-mono text-xs text-slate-500">landing: {selectedCampaign?.landingId || '—'}</p>
          </div>
        </section>

        <section className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Lead đã tải', value: summary.total, icon: Users },
            { label: 'Đơn đặt hàng', value: summary.orders, icon: PackageCheck },
            { label: 'Yêu cầu mẫu/tài liệu', value: summary.samples, icon: FileText },
            { label: 'Giá trị đơn đăng ký', value: `${new Intl.NumberFormat('vi-VN').format(summary.orderValue)} LAK`, icon: Database },
          ].map((item) => (
            <div key={item.label} className="flex min-h-24 items-center gap-3 border-slate-200 px-4 py-4 sm:border-r last:border-r-0">
              <item.icon className="h-5 w-5 shrink-0 text-emerald-700" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="mt-1 truncate text-xl font-extrabold text-slate-900">{item.value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="py-5">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm nhà thuốc, người liên hệ, số điện thoại, tỉnh..."
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <select
              value={leadType}
              onChange={(event) => setLeadType(event.target.value)}
              aria-label="Lọc loại Lead"
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-600"
            >
              <option value="ALL">Tất cả loại Lead</option>
              {leadTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <button
              type="button"
              onClick={() => void loadLeads()}
              disabled={loadState === 'loading'}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loadState === 'loading' ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => downloadLeadsCsv(visibleLeads, campaignId)}
              disabled={!visibleLeads.length}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:bg-slate-300"
            >
              <Download className="h-4 w-4" />
              Xuất CSV ({visibleLeads.length})
            </button>
          </div>

          {truncated && (
            <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Đang hiển thị 500 Lead mới nhất. Cần phân trang trước khi dùng cho quy mô lớn hơn.
            </p>
          )}

          {loadState === 'error' && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
              <p className="font-bold">Không tải được dữ liệu campaign.</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          {loadState === 'loading' ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-500">Đang tải Lead từ Firestore...</div>
          ) : visibleLeads.length === 0 ? (
            <div className="py-16 text-center">
              <Database className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">Campaign chưa có Lead phù hợp</p>
              <p className="mt-1 text-xs text-slate-500">Kiểm tra form White Lotus hoặc thay đổi bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border-b border-slate-200">
              <table className="w-full min-w-[1120px] table-fixed text-left text-sm">
                <thead className="bg-slate-100 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="w-36 px-3 py-3">Thời gian</th>
                    <th className="w-28 px-3 py-3">Loại Lead</th>
                    <th className="w-56 px-3 py-3">Cơ sở / Liên hệ</th>
                    <th className="w-40 px-3 py-3">Điện thoại</th>
                    <th className="w-36 px-3 py-3">Tỉnh/Thành</th>
                    <th className="px-3 py-3">Sản phẩm / Nhu cầu</th>
                    <th className="w-44 px-3 py-3 text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {visibleLeads.map((lead) => {
                    const identity = identityOf(lead)
                    const type = leadTypeOf(lead)
                    return (
                      <tr key={lead.id} className="align-top transition hover:bg-emerald-50/40">
                        <td className="px-3 py-4 text-xs text-slate-600">
                          {formatDateTime(lead.created_at)}
                          <span className="mt-1 block truncate font-mono text-[10px] text-slate-400" title={lead.id}>{lead.id}</span>
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex rounded px-2 py-1 text-[10px] font-extrabold ${type === 'ORDER' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {type}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-bold text-slate-900">{identity.pharmacyName}</p>
                          <p className="mt-1 text-xs text-slate-500">{identity.contactName}</p>
                        </td>
                        <td className="px-3 py-4">
                          {identity.phone ? (
                            <a href={`tel:${identity.phone}`} className="font-mono font-semibold text-emerald-700 hover:underline">{identity.phone}</a>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-4 text-slate-700">{identity.province}</td>
                        <td className="px-3 py-4 text-xs leading-5 text-slate-700">{productSummary(lead)}</td>
                        <td className="px-3 py-4 text-right font-mono font-bold text-slate-800">{formatValue(lead)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
