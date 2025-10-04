"use client"

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface MobileLayoutProps {
  children: ReactNode
  showNavigation?: boolean
  currentPage?: string
}

export default function MobileLayout({
  children,
  showNavigation = true,
  currentPage = 'home'
}: MobileLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      {showNavigation && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🦠</span>
                <h1 className="text-lg font-bold text-indigo-600">FluLink</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg"
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="pb-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            {[
              { name: '首页', path: '/', icon: '🏠' },
              { name: '毒株', path: '/dashboard', icon: '🦠' },
              { name: '传播', path: '/dashboard?tab=spread', icon: '🌍' },
              { name: '我的', path: '/profile', icon: '👤' }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={"flex flex-col items-center p-2 " +
                  (currentPage === item.path ? 'text-indigo-600' : 'text-gray-600')
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
