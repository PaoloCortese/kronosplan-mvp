/**
 * Image utilities for thumbnail generation and storage
 * - Resize to max 512px
 * - Compress to target <200KB
 * - Store/retrieve from IndexedDB (not sessionStorage)
 */

const DB_NAME = 'kronosplan'
const STORE_NAME = 'pending_thumbs'
const THUMB_KEY = 'pendingThumb'

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export async function savePendingThumb(blob: Blob): Promise<void> {
  const db = await openDB()
  // Convert Blob to ArrayBuffer for better IndexedDB compatibility
  const arrayBuffer = await blob.arrayBuffer()
  const data = {
    buffer: arrayBuffer,
    type: blob.type
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(data, THUMB_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getPendingThumb(): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(THUMB_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const data = request.result
      if (!data) {
        resolve(null)
        return
      }
      // Convert ArrayBuffer back to Blob
      if (data.buffer && data.type) {
        resolve(new Blob([data.buffer], { type: data.type }))
      } else if (data instanceof Blob) {
        // Legacy support for any existing blobs
        resolve(data)
      } else {
        resolve(null)
      }
    }
  })
}

export async function clearPendingThumb(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(THUMB_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Resize and compress image to thumbnail
 * @param file - Original image file
 * @param maxSize - Max dimension (default 512px)
 * @param quality - JPEG quality (default 0.8)
 * @returns Compressed Blob
 */
export async function createThumbnail(
  file: File,
  maxSize = 512,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP first, fallback to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // If still too large, reduce quality
            if (blob.size > 200 * 1024 && quality > 0.5) {
              canvas.toBlob(
                (smallerBlob) => {
                  resolve(smallerBlob || blob)
                },
                'image/webp',
                quality - 0.2
              )
            } else {
              resolve(blob)
            }
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate UUID v4 for post_id
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}
