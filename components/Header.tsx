'use client'

import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()

  if (pathname === '/') return null

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-kronos-navy safe-area-top">
      <div className="max-w-4xl mx-auto px-6 sm:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/logo_completo_bianco.png" alt="KRONOSPLAN" height={28} width={140} priority />
          <nav className="flex items-center gap-4">
            <a
              href="/checkin"
              className={`text-sm font-medium transition-colors text-white ${
                pathname === '/checkin'
                  ? 'opacity-100'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Check-in
            </a>
            <a
              href="/planning"
              className={`text-sm font-medium transition-colors text-white ${
                pathname === '/planning' || pathname.startsWith('/post/')
                  ? 'opacity-100'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Planning
            </a>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-white opacity-70 hover:opacity-100 transition-colors"
        >
          Esci
        </button>
      </div>
    </header>
  )
}
