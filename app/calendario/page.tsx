'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import CalendarGrid from '@/components/CalendarGrid'

interface Post {
  id: string
  platform: string
  scheduled_date: string
}

export default function CalendarioPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchCopiedPosts() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('id, platform, scheduled_date')
        .eq('user_id', session.user.id)
        .eq('status', 'copied')
        .order('scheduled_date', { ascending: true })

      if (error) {
        console.error('Error fetching posts:', error)
      }

      if (data) {
        setPosts(data as Post[])
      }

      setLoading(false)
    }

    fetchCopiedPosts()
  }, [router])

  const handlePostClick = (postId: string) => {
    // Naviga al planning con il post ID come parametro per lo scroll
    router.push(`/planning?highlight=${postId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <p className="text-sm text-gray-700">...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <CalendarGrid posts={posts} onPostClick={handlePostClick} />
      </div>
    </main>
  )
}
