import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const name = ((form.get('name') ?? form.get('nama')) ?? '').toString().trim()
    const description = (form.get('description') ?? '').toString().trim()
    const priceStr = (form.get('price') ?? '').toString().trim()
    const image = form.get('image') as File | null
    const tokopedia_url = (form.get('tokopedia_url') ?? '').toString().trim() || null
    const shopee_url = (form.get('shopee_url') ?? '').toString().trim() || null
    const brand = (form.get('brand') ?? '').toString().trim() || null
    const category = (form.get('category') ?? '').toString().trim() || null
    const featuredRaw = (form.get('featured') ?? '').toString().trim()
    const featured = featuredRaw === 'true' || featuredRaw === '1'
    const ingredientsRaw = (form.get('ingredients') ?? '').toString().trim()
    const usage = (form.get('usage') ?? '').toString().trim() || null
    const size = (form.get('size') ?? '').toString().trim() || null
    let skin_type: string[] | null = null
    let concernsArr: string[] | null = null
    let ingredientsArr: string[] | null = null

    try {
      const raw = form.get('skin_types') as string | null
      if (raw) {
        const arr = JSON.parse(raw.toString())
        if (Array.isArray(arr)) skin_type = arr.map((x: any) => String(x))
      }
    } catch {}

    try {
      const raw = form.get('concerns') as string | null
      if (raw) {
        let c: any = raw
        try { c = JSON.parse(raw.toString()) } catch {}
        if (Array.isArray(c)) {
          concernsArr = c.map((x: any) => String(x).trim()).filter(Boolean)
        } else if (typeof c === 'string') {
          concernsArr = c.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      }
    } catch {}

    try {
      if (ingredientsRaw) {
        let i: any = ingredientsRaw
        try { i = JSON.parse(ingredientsRaw) } catch {}
        if (Array.isArray(i)) {
          ingredientsArr = i.map((x: any) => String(x).trim()).filter(Boolean)
        } else if (typeof i === 'string') {
          ingredientsArr = i
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        }
      }
    } catch {}

    if (!name || !description || !priceStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const price = Number(priceStr)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

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

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let imageUrl: string | null = null
    if (image && image.size > 0) {
      if (!image.type?.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
      }

      const fileExt = image.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('bucket1')
        .upload(filePath, image, { contentType: image.type })

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 })
      }

      const { data: publicUrlData } = await supabase.storage
        .from('bucket1')
        .getPublicUrl(filePath)

      imageUrl = publicUrlData.publicUrl
    }

    const { data: inserted, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          brand,
          category,
          featured,
          ingredients: ingredientsArr,
          how_to_use: usage,
          size,
          skin_type: skin_type,
          concerns: concernsArr,
          image: imageUrl,
          tokopedia_url,
          shopee_url,
        },
      ])
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ id: inserted.id, image: imageUrl }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
