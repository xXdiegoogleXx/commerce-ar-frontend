import { useState } from 'react'
import type { Gender } from '../services/types'

interface SelectSexoProps {
  value?: Gender | null
  onChange: (value: Gender) => void
  disabled?: boolean
  required?: boolean
  error?: string
}

export function SelectSexo({ value, onChange, disabled, required, error }: SelectSexoProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const opciones: { value: Gender; label: string }[] = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otros', label: 'Otros' },
  ]

  const selectedOption = opciones.find(o => o.value === value)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Sexo {required && <span className="text-red-500">*</span>}
      </label>
      
      {required && !value && (
        <p className="mt-1 text-sm text-red-500">El sexo es obligatorio</p>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-left flex justify-between items-center ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption?.label || 'Seleccionar sexo'}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {opciones.map((opcion) => (
            <button
              key={opcion.value}
              type="button"
              onClick={() => {
                onChange(opcion.value)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
            >
              {opcion.label}
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}