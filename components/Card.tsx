interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  const hasCustomBg = className.includes('bg-')
  return (
    <div className={`${hasCustomBg ? '' : 'bg-white'} rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  )
}
