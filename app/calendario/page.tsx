'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import PianoEditoriale from '@/components/PianoEditoriale'

interface Post {
  id: string
  platform: string
  copy: string | null
  status: string
  scheduled_date: string | null
  copied_at: string | null
  created_at: string
}

export default function CalendarioPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchPosts = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, platform, copy, status, scheduled_date, copied_at, created_at')
      .eq('user_id', uid)
      .in('status', ['copied', 'planned'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
    }

    if (data) {
      setPosts(data as Post[])
    }
  }, [])

  useEffect(() => {
    async function init() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      setUserId(session.user.id)
      await fetchPosts(session.user.id)
      setLoading(false)
    }

    init()
  }, [router, fetchPosts])

  const handlePostsChange = () => {
    if (userId) {
      fetchPosts(userId)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto py-8">
          <p className="text-sm text-gray-700">...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto py-4">
        <PianoEditoriale
          posts={posts}
          userId={userId}
          onPostsChange={handlePostsChange}
        />
      </div>
    </main>
  )
}
