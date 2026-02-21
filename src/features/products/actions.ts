'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function toggleFeaturedStatus(productId: string, currentStatus: boolean) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { error } = await supabase
            .from('products')
            .update({ is_featured: !currentStatus })
            .eq('id', productId)

        if (error) {
            console.error('Error toggling featured status:', error)
            return { success: false, error: error.message }
        }

        // CRITICAL: Force cache refresh for homepage and dashboard
        revalidatePath('/', 'layout')
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/products')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'Internal server error' }
    }
}
