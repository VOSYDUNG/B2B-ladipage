import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, BarChart3, Database, Trash2, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { AnalyticsEvent } from '../types';

interface AnalyticsPanelProps {
  events: AnalyticsEvent[];
  onClearLogs: () => void;
  lang: 'lo' | 'vi' | 'en';
}

const METRICS_DICT = {
  lo: {
    panelTitle: "Local Diagnostics (Luồng Sự kiện Cục bộ)",
    panelDesc: "Theo dõi luồng sự kiện thời gian thực khi tương tác trên Landing Page",
    funnelTitle: "Báo cáo Phễu Chuyển đổi B2B",
    activeLogs: "Nhật ký Sự kiện ({count})",
    clear: "Xóa màn hình log (Không xóa dữ liệu GA4)",
    noEvents: "Chưa có sự kiện nào được kích hoạt. Hãy tương tác với trang đích (cuộn, click kệ POSM, chọn combo, gửi form) để xem luồng dữ liệu.",
    eventParams: "Tham số truyền vào",
    funnelView: "1. Nhận thức (View Promotion)",
    funnelEngage: "2. Tương tác POSM (Click POSM 3D)",
    funnelClick: "3. Ý định (Select Promo)",
    funnelLead: "4. Chuyển đổi (Generate Lead)"
  },
  vi: {
    panelTitle: "Local Diagnostics (Luồng Sự kiện Cục bộ)",
    panelDesc: "Theo dõi dữ liệu sự kiện gửi đi ngay lập tức khi bạn tương tác với Landing Page",
    funnelTitle: "Báo cáo Phễu Chuyển Đổi B2B",
    activeLogs: "Nhật ký Sự kiện ({count})",
    clear: "Xóa màn hình log (Không ảnh hưởng dữ liệu GA4)",
    noEvents: "Chưa có sự kiện nào được kích hoạt. Hãy tương tác với trang đích (cuộn xem sản phẩm, click kệ POSM, chọn combo, gửi form) để xem dữ liệu.",
    eventParams: "Tham số truyền vào",
    funnelView: "1. Nhận thức (View Promotion)",
    funnelEngage: "2. Tương tác POSM (Click POSM 3D)",
    funnelClick: "3. Ý định (Select Promo)",
    funnelLead: "4. Chuyển đổi (Generate Lead)"
  },
  en: {
    panelTitle: "Local Diagnostics",
    panelDesc: "Monitor event payloads dispatched in real-time as you interact with the landing page",
    funnelTitle: "B2B Conversion Funnel Report",
    activeLogs: "Dispatched Events ({count})",
    clear: "Clear local screen logs (does not delete GA4 metrics)",
    noEvents: "No events triggered yet. Interact with the page (scroll, click POSM shelf, select combos, submit lead) to view live logs.",
    eventParams: "Parameters",
    funnelView: "1. Awareness (View Promotion)",
    funnelEngage: "2. Engagement (Click POSM 3D)",
    funnelClick: "3. Intent (Select Promo)",
    funnelLead: "4. Conversion (Generate Lead)"
  }
};

export default function AnalyticsPanel({ events, onClearLogs, lang }: AnalyticsPanelProps) {
  const t = METRICS_DICT[lang];

  // Calculate simulated funnel numbers based on logs
  const counts = {
    view_promotion: events.filter(e => e.name === 'view_promotion').length,
    click_posm_3d: events.filter(e => e.name === 'click_posm_3d').length,
    select_promotion: events.filter(e => e.name === 'select_promotion').length,
    generate_lead: events.filter(e => e.name === 'generate_lead').length,
  };

  // Base mockup statistics added to real actions for visualization (cleared mock data)
  const baseImpressions = counts.view_promotion;
  const baseEngagements = counts.click_posm_3d;
  const baseClicks = counts.select_promotion;
  const baseLeads = counts.generate_lead;

  const funnelData = [
    { name: t.funnelView, value: baseImpressions, color: 'bg-indigo-500', pct: baseImpressions > 0 ? 100 : 0 },
    { name: t.funnelEngage, value: baseEngagements, color: 'bg-blue-500', pct: baseImpressions > 0 ? Math.round((baseEngagements / baseImpressions) * 100) : 0 },
    { name: t.funnelClick, value: baseClicks, color: 'bg-cyan-500', pct: baseImpressions > 0 ? Math.round((baseClicks / baseImpressions) * 100) : 0 },
    { name: t.funnelLead, value: baseLeads, color: 'bg-bento-cyan text-slate-950', pct: baseImpressions > 0 ? Math.round((baseLeads / baseImpressions) * 100) : 0 },
  ];

  return (
    <div className="bg-[#14181F] text-slate-100 rounded-3xl p-6 border border-slate-700/50 shadow-xl overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-start justify-between border-b border-slate-800/85 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-850 text-bento-cyan border border-slate-700/50 animate-pulse">
            <Activity className="w-5 h-5 text-bento-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-base font-display flex items-center gap-2">
              {t.panelTitle}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bento-cyan text-slate-950 text-[9px] uppercase tracking-wider font-mono font-black">
                LIVE GA4 ENGINE
              </span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{t.panelDesc}</p>
          </div>
        </div>

        {events.length > 0 && (
          <button
            id="clear-analytics-logs-btn"
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clear}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Graph Section */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-display flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-bento-cyan" />
              {t.funnelTitle}
            </h4>
            <p className="text-slate-400 text-[11px] mb-4">
              Biểu diễn tỉ lệ rớt phễu (drop-off) thực tế từ chiến dịch B2B. Các hành động của bạn sẽ cập nhật trực tiếp phễu dưới đây.
            </p>

            <div className="space-y-4">
              {funnelData.map((stage, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{stage.name}</span>
                    <span className="font-mono text-slate-400">
                      <strong>{stage.value}</strong> leads ({stage.pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.pct}%` }}
                      transition={{ type: 'spring', stiffness: 50, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${stage.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-bento-cyan" />
            <span>Dữ liệu tuân thủ chuẩn mã hóa bảo mật GDPR.</span>
          </div>
        </div>

        {/* Real-time Logs Terminal */}
        <div className="lg:col-span-7 flex flex-col h-[280px]">
          <div className="flex items-center justify-between text-xs mb-2 px-1">
            <span className="text-slate-400 font-mono flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-bento-cyan" />
              {t.activeLogs.replace('{count}', events.length.toString())}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="flex-1 bg-slate-950 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs overflow-y-auto space-y-3.5 scrollbar-thin select-all">
            <AnimatePresence initial={false}>
              {events.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6 text-slate-500 text-xs">
                  <div className="space-y-2">
                    <Activity className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="max-w-xs">{t.noEvents}</p>
                  </div>
                </div>
              ) : (
                events.map((evt, idx) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -10, y: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="p-2.5 rounded bg-slate-900 border-l-4 border-bento-cyan text-[11px] leading-normal"
                  >
                    <div className="flex items-center justify-between mb-1.5 text-slate-400 border-b border-slate-800/50 pb-1">
                      <span className="text-bento-cyan font-bold uppercase tracking-wider text-[10px]">{evt.name}</span>
                      <span>{evt.timestamp}</span>
                    </div>

                    <div className="text-slate-300 font-mono text-[10px] pl-1.5 leading-relaxed">
                      <span className="text-bento-cyan font-bold">params:</span> {JSON.stringify(evt.params, null, 2)}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
