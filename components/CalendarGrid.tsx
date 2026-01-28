'use client'

import { useState, useMemo } from 'react'
import CalendarDay from './CalendarDay'

interface Post {
  id: string
  platform: string
  copied_at: string
}

interface CalendarGridProps {
  posts: Post[]
  onPostClick: (postId: string) => void
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

export default function CalendarGrid({ posts, onPostClick }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear()

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // getDay() returns 0 for Sunday, we want Monday = 0
    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay < 0) startDay = 6

    const days: (number | null)[] = []

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    // Fill remaining cells to complete the grid (6 rows max)
    while (days.length < 42 && days.length % 7 !== 0) {
      days.push(null)
    }

    return days
  }, [currentYear, currentMonth])

  const getPostsForDay = (day: number | null) => {
    if (!day) return []

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return posts.filter(post => {
      const postDate = post.copied_at?.split('T')[0]
      return postDate === dateStr
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mese precedente"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-[#1a365d]">
          {MONTHS_IT[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mese successivo"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            isCurrentMonth={day !== null}
            isToday={day !== null && isToday(day)}
            posts={getPostsForDay(day)}
            onPostClick={onPostClick}
          />
        ))}
      </div>
    </div>
  )
}
