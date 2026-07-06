import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  description?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, description, id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'input-field',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : description ? `${inputId}-desc` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="text-xs text-red-500">{error}</p>}
      {description && !error && <p id={`${inputId}-desc`} className="description">{description}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
