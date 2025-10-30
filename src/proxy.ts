import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // Pastikan headers forward agar response dapat menyetel cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const url = new URL(request.url)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          // Sinkronkan cookies ke request & response
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Gunakan getUser() untuk revalidasi token (bukan getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteksi akses dashboard
  if (!user && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika sudah login dan akses /login, arahkan ke dashboard
  if (user && url.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}