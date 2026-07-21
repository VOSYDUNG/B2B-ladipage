import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldAlert, X } from 'lucide-react'

interface HcpGateProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
}

export function HcpGate({ open, onOpenChange, onAccept }: HcpGateProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-amber-100 p-4 text-amber-600">
                <ShieldAlert className="h-8 w-8" />
              </div>
              
              <h2 className="text-xl font-bold text-slate-800">
                Xác nhận quyền truy cập
              </h2>
              
              <p className="text-sm text-slate-600">
                Tài liệu này chứa thông tin y khoa chuyên sâu và hướng dẫn điều trị. 
                Theo quy định, thông tin này chỉ dành cho chuyên gia y tế, bác sĩ, 
                dược sĩ hoặc đại diện nhà thuốc.
              </p>

              <div className="pt-4 w-full space-y-3">
                <button
                  onClick={() => {
                    onAccept()
                    onOpenChange(false)
                  }}
                  className="w-full rounded-xl bg-[#008A5E] px-4 py-3 text-sm font-bold text-white shadow hover:bg-[#00704C] transition-colors"
                >
                  Tôi là chuyên gia y tế / nhà thuốc
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
