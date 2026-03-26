'use client'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md p-6 z-10">
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-xl leading-none">×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
