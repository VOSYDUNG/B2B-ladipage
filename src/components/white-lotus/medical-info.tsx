import React from 'react'
import { ShieldAlert, FileText, Lock } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'
import { WL_PRODUCTS } from '@/config/white-lotus'

interface MedicalInfoProps {
  isHcpUnlocked: boolean
  onRequestUnlock: () => void
}

export function MedicalInfo({ isHcpUnlocked, onRequestUnlock }: MedicalInfoProps) {
  return (
    <section className="py-16 bg-[#F4F7F5] border-y border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800">Thông tin Y khoa (Chỉ định & Liều dùng)</h2>
          <p className="mt-3 text-slate-600 text-sm">
            Nội dung chuyên môn bắt buộc phải ẩn theo quy định quản lý thông tin y tế.
          </p>
        </div>

        {!isHcpUnlocked ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Nội dung bị khóa</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md">
              Để xem chi tiết công dụng, cách dùng và tương tác thuốc, bạn cần xác nhận mình là Bác sĩ, Dược sĩ hoặc Chuyên gia y tế.
            </p>
            <button 
              onClick={onRequestUnlock}
              className="bg-[#008A5E] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#00704C] transition-colors flex items-center gap-2 shadow-sm"
            >
              <ShieldAlert className="w-5 h-5" />
              Xác nhận & Mở khóa
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#008A5E]/10 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#008A5E]" />
              <span className="font-bold text-[#008A5E] text-sm">Đã mở khóa nội dung dành cho HCP</span>
            </div>
            
            <Accordion.Root type="single" collapsible className="w-full">
              {WL_PRODUCTS.map((product, idx) => (
                <Accordion.Item 
                  key={product.product_id} 
                  value={product.product_id}
                  className={`border-b border-slate-100 ${idx === WL_PRODUCTS.length - 1 ? 'border-b-0' : ''}`}
                >
                  <Accordion.Header className="flex">
                    <Accordion.Trigger className="flex-1 flex items-center justify-between px-6 py-5 text-left text-slate-800 hover:bg-slate-50 transition-colors group">
                      <div>
                        <span className="font-bold block text-lg">{product.canonical_name}</span>
                        <span className="text-sm text-slate-500 font-medium">{product.active_ingredient}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-data-[state=open]:rotate-180 transition-transform">
                        ▼
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="px-6 pb-6 text-sm text-slate-600 data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden">
                    <div className="pt-2 space-y-4">
                      <div>
                        <strong className="text-slate-800 block mb-1">Công dụng (Chỉ định)</strong>
                        <p>Nội dung chỉ định chi tiết cho {product.canonical_name} đang được cập nhật từ hồ sơ công bố dược phẩm.</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Cách dùng & Liều lượng</strong>
                        <p>Thông tin cách dùng và liều lượng tiêu chuẩn theo phác đồ đang được cập nhật.</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl mt-4 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500">
                          Vui lòng tham khảo File Catalog PDF đính kèm của sản phẩm này tại mục "Danh mục sản phẩm" để xem thông tin chính thức.
                        </p>
                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        )}
      </div>
    </section>
  )
}
