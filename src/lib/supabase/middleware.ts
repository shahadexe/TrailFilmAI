import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  // Keep in sync with src/app/(app)/ route group — any new (app) route prefix must be added here.
  // The (app)/layout.tsx server guard provides defense-in-depth for missed prefixes.
  // /t/* (public viewer) is intentionally absent — unauthenticated access is required. Keep in sync with src/app/(public)/ route group.
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/new') ||
    pathname.startsWith('/trip')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
