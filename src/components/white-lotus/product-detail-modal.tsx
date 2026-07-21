import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'


interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-5xl bg-transparent rounded-[2rem] overflow-hidden flex flex-col my-auto focus:outline-none items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors shadow-lg" aria-label="Close">
                      <X className="w-6 h-6" />
                    </button>
                  </Dialog.Close>

                  {product.visual_aid_url ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full relative"
                    >
                      <img 
                        src={product.visual_aid_url} 
                        alt={product.canonical_name}
                        className="w-full h-auto rounded-xl sm:rounded-[2rem] shadow-2xl"
                      />
                    </motion.div>
                  ) : (
                    <div className="bg-white p-12 rounded-[2rem] text-center w-full max-w-lg shadow-2xl">
                      <p className="text-slate-500">Hình ảnh chi tiết đang được cập nhật...</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
