'use client'

import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth'

export default function Header() {
  const pathname = usePathname()

  if (pathname === '/') return null

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-100 safe-area-top">
      <div className="max-w-4xl mx-auto px-6 sm:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/icona-solo.png" alt="KRONOSPLAN" className="h-7 w-7" />
          <nav className="flex items-center gap-4">
            <a
              href="/checkin"
              className={`text-sm font-medium transition-colors ${
                pathname === '/checkin'
                  ? 'text-[#1a365d]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Check-in
            </a>
            <a
              href="/planning"
              className={`text-sm font-medium transition-colors ${
                pathname === '/planning' || pathname.startsWith('/post/')
                  ? 'text-[#1a365d]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Planning
            </a>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Esci
        </button>
      </div>
    </header>
  )
}
