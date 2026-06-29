'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateReportStatus(id: string, status: 'Submitted' | 'In Progress' | 'Resolved') {
  const supabase = await createClient()
  
  // Verify session at the server level
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized access. Admin privileges required.')
  }

  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}
