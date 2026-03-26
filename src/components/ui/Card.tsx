import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ glow, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-slate-800 rounded-xl border border-slate-700 overflow-hidden
        ${glow ? 'ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 py-4 border-b border-slate-700 ${className}`} {...props}>{children}</div>
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 py-4 ${className}`} {...props}>{children}</div>
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 py-4 border-t border-slate-700 ${className}`} {...props}>{children}</div>
}
