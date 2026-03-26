import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles = {
  primary: 'bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold disabled:opacity-50',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50',
  outline: 'border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 disabled:opacity-50',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 disabled:opacity-50',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
    {children}
  </button>
))
Button.displayName = 'Button'
export default Button
