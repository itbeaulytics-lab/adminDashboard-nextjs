import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        console.log('[Seed API] Starting...');

        // Check Env Vars
        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!sbUrl || !sbKey) {
            console.error('[Seed API] Missing Env Vars');
            return NextResponse.json({ success: false, error: 'Missing Supabase Env Vars on Server' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            sbUrl,
            sbKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const categories = [
            'Serum', 'Cleanser', 'Toner', 'Moisturizer', 'Sunscreen',
            'Mask', 'Essence', 'Tonic', 'Face Wash', 'Eye Cream'
        ];

        const productTypes = [
            'Skincare', 'Bodycare', 'Haircare', 'Makeup', 'Fragrance', 'Tools'
        ];

        // 1. Seed Categories
        console.log('[Seed API] Fetching categories...');
        const { data: existingCats, error: fetchErr } = await supabase.from('categories').select('name');

        if (fetchErr) {
            console.error('[Seed API] Error fetching categories:', fetchErr);
            // Don't throw, return JSON
            return NextResponse.json({ success: false, error: `Fetch Categories Error: ${fetchErr.message}` }, { status: 500 });
        }

        const existingCatNames = new Set((existingCats || []).map((c) => c.name));

        const newCats = categories
            .filter((c) => !existingCatNames.has(c))
            .map((name) => ({ name }));

        if (newCats.length > 0) {
            const { error: catError } = await supabase.from('categories').insert(newCats);
            if (catError) {
                console.error('[Seed API] Insert Category Error:', catError);
                return NextResponse.json({ success: false, error: `Insert Categories Error: ${catError.message}` }, { status: 500 });
            }
        }

        // 2. Seed Product Types
        console.log('[Seed API] Fetching types...');
        const { data: existingTypes, error: typeErr } = await supabase.from('product_types').select('name');

        if (typeErr) {
            console.error('[Seed API] Error fetching types:', typeErr);
            return NextResponse.json({ success: false, error: `Fetch Types Error: ${typeErr.message}` }, { status: 500 });
        }

        const existingTypeNames = new Set((existingTypes || []).map((t) => t.name));

        const newTypes = productTypes
            .filter((t) => !existingTypeNames.has(t))
            .map((name) => ({ name }));

        if (newTypes.length > 0) {
            const { error: typeError } = await supabase.from('product_types').insert(newTypes);
            if (typeError) {
                console.error('[Seed API] Insert Type Error:', typeError);
                return NextResponse.json({ success: false, error: `Insert Types Error: ${typeError.message}` }, { status: 500 });
            }
        }

        console.log('[Seed API] Success');
        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            added_categories: newCats.map(c => c.name),
            added_types: newTypes.map(t => t.name)
        });
    } catch (error: any) {
        console.error('[Seed API] Fatal Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Unknown server error', stack: error.stack }, { status: 500 });
    }
}
