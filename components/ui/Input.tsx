'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id || label

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#1e2340]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-sm bg-white text-[#1e2340]
            placeholder:text-[#9ca3af] outline-none transition-all duration-150
            border-[#e4e7f5] focus:border-[#5b7cf7] focus:ring-3 focus:ring-[#5b7cf7]/10
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
