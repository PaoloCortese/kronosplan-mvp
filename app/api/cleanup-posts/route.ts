import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Verifica CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!cronSecret) {
    console.error('[cleanup-posts] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (!serviceRoleKey || !supabaseUrl) {
    console.error('[cleanup-posts] SUPABASE_SERVICE_ROLE_KEY or URL not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // Crea client admin SOLO dopo verifica configurazione
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[cleanup-posts] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date().toISOString()

    // 1. Trova post scaduti (visible_until <= now AND archived_at IS NULL)
    const { data: expiredPosts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, image_thumb_path')
      .lte('visible_until', now)
      .is('archived_at', null)

    if (fetchError) {
      console.error('[cleanup-posts] Error fetching expired posts:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch expired posts' }, { status: 500 })
    }

    if (!expiredPosts || expiredPosts.length === 0) {
      console.log('[cleanup-posts] No expired posts to process')
      return NextResponse.json({ message: 'No expired posts', processed: 0 })
    }

    console.log(`[cleanup-posts] Found ${expiredPosts.length} expired posts`)

    let processed = 0
    let thumbsDeleted = 0

    for (const post of expiredPosts) {
      // 2. Se ha thumbnail, elimina da storage
      if (post.image_thumb_path) {
        try {
          const { error: deleteError } = await supabaseAdmin
            .storage
            .from('post-images')
            .remove([post.image_thumb_path])

          if (deleteError) {
            console.warn(`[cleanup-posts] Failed to delete thumb for post ${post.id}:`, deleteError)
          } else {
            thumbsDeleted++
          }
        } catch (e) {
          console.warn(`[cleanup-posts] Storage delete error for post ${post.id}:`, e)
        }
      }

      // 3. Aggiorna post: archived_at = now, image_thumb_path = null, image_expires_at = null
      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({
          archived_at: now,
          image_thumb_path: null,
          image_expires_at: null
        })
        .eq('id', post.id)

      if (updateError) {
        console.error(`[cleanup-posts] Failed to update post ${post.id}:`, updateError)
      } else {
        processed++
      }
    }

    console.log(`[cleanup-posts] Processed ${processed} posts, deleted ${thumbsDeleted} thumbnails`)

    return NextResponse.json({
      message: 'Cleanup completed',
      processed,
      thumbsDeleted,
      timestamp: now
    })
  } catch (error) {
    console.error('[cleanup-posts] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
