'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import PianoEditoriale from '@/components/PianoEditoriale'

interface Post {
  id: string
  platform: string
  copy: string
  status: string
  copied_at: string | null
  created_at: string
}

export default function CalendarioPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchPosts() {
      const session = await getSession()
      if (!session) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('id, platform, copy, status, copied_at, created_at')
        .eq('user_id', session.user.id)
        .eq('status', 'copied')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
      }

      if (data) {
        setPosts(data as Post[])
      }

      setLoading(false)
    }

    fetchPosts()
  }, [router])

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
        <PianoEditoriale posts={posts} />
      </div>
    </main>
  )
}
