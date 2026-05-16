import { SelectSexo } from './SelectSexo'
import type { Gender } from '../services/types'

interface UserFormFieldsProps {
  documentNumber?: string
  phone?: string
  birthDate?: string
  gender?: Gender | null
  onDocumentNumberChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onGenderChange: (value: Gender) => void
  disabled?: boolean
  required?: boolean
  errors?: {
    documentNumber?: string
    phone?: string
    birthDate?: string
    gender?: string
  }
}

export function UserFormFields({
  documentNumber,
  phone,
  birthDate,
  gender,
  onDocumentNumberChange,
  onPhoneChange,
  onBirthDateChange,
  onGenderChange,
  disabled,
  required,
  errors,
}: UserFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Número de Documento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Documento {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={documentNumber || ''}
          onChange={(e) => onDocumentNumberChange(e.target.value.replace(/\D/g, ''))}
          disabled={disabled}
          placeholder="Ej: 12345678"
          required={required}
          minLength={6}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors?.documentNumber ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''} focus:ring-2 focus:ring-primary focus:border-transparent`}
        />
        {errors?.documentNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.documentNumber}</p>
        )}
        {required && !documentNumber && (
          <p className="mt-1 text-sm text-red-500">El documento es obligatorio</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={phone || ''}
          onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
          disabled={disabled}
          placeholder="5491112345678"
          required={required}
          minLength={10}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors?.phone ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''} focus:ring-2 focus:ring-primary focus:border-transparent`}
        />
        {errors?.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
        )}
        {required && !phone && (
          <p className="mt-1 text-sm text-red-500">El teléfono es obligatorio</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Solo números (sin + ni espacios)</p>
      </div>

      {/* Fecha de Nacimiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Nacimiento
        </label>
        <input
          type="date"
          value={birthDate || ''}
          onChange={(e) => onBirthDateChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors?.birthDate ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''} focus:ring-2 focus:ring-primary focus:border-transparent`}
        />
        {errors?.birthDate && (
          <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
        )}
      </div>

      {/* Sexo */}
      <SelectSexo
        value={gender}
        onChange={onGenderChange}
        disabled={disabled}
        required={required}
        error={errors?.gender}
      />
    </div>
  )
}