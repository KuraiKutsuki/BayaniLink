'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import xss from 'xss'
import { headers } from 'next/headers'

// In-memory rate limiter (Warning: won't persist across serverless cold starts or multiple instances)
// Key: IP Address, Value: Array of timestamps
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  
  // Filter out timestamps older than the window
  const recentTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)
  
  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  recentTimestamps.push(now)
  rateLimitMap.set(ip, recentTimestamps)
  return false
}

// Zod schema for input validation
const reportSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
  barangay: z.string().min(1, 'Barangay is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export async function submitReport(formData: FormData) {
  try {
    // 1. Rate Limiting Check
    const headersList = await headers()
    // Vercel and most proxies use x-forwarded-for. Fallback to a default if unavailable.
    const ip = headersList.get('x-forwarded-for') || 'unknown-ip'
    
    if (isRateLimited(ip)) {
      return { success: false, error: 'Too many reports submitted recently. Please try again in 15 minutes.' }
    }

    // 2. Extract Data
    const rawData = {
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      barangay: formData.get('barangay') as string,
      latitude: parseFloat(formData.get('latitude') as string),
      longitude: parseFloat(formData.get('longitude') as string),
    }

    // 3. Validation
    const validationResult = reportSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0].message }
    }
    const validatedData = validationResult.data

    // 4. XSS Sanitization
    const sanitizedDescription = xss(validatedData.description)

    // 5. Initialize Supabase Server Client
    const supabase = await createClient()

    // 6. Handle File Upload (if any)
    let image_url: string | null = null
    const imageFile = formData.get('imageFile') as File | null

    if (imageFile && imageFile.size > 0) {
      // Basic mime type check
      if (!imageFile.type.startsWith('image/')) {
        return { success: false, error: 'Invalid file type. Please upload an image.' }
      }
      
      const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('incident-photos')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        return { success: false, error: `Image upload failed: ${uploadError.message}` }
      }

      const { data: urlData } = supabase.storage.from('incident-photos').getPublicUrl(uploadData.path)
      image_url = urlData.publicUrl
    }

    // 7. Insert to Database
    const { data: insertData, error: insertError } = await supabase
      .from('reports')
      .insert({
        category: validatedData.category,
        description: sanitizedDescription,
        barangay: validatedData.barangay,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        image_url,
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: `Submission failed: ${insertError.message}` }
    }

    return { success: true, reportId: insertData.id }
  } catch (err: any) {
    console.error('Report submission error:', err)
    return { success: false, error: 'An unexpected error occurred on the server.' }
  }
}
