interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  type?: 'text' | 'password' | 'email'
  className?: string
}

export default function Input({
  value,
  onChange,
  placeholder = '',
  multiline = false,
  type = 'text',
  className = ''
}: InputProps) {
  const baseClasses = 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-transparent w-full text-sm'

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseClasses} min-h-[120px] resize-none ${className}`}
      />
    )
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${baseClasses} ${className}`}
    />
  )
}
