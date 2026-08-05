import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request })

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
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT : ce getUser() est ce qui rafraîchit le cookie de session.
    // Sans cet appel, la session peut sembler "perdue" côté serveur (bug déjà
    // rencontré sur d'autres projets Saaytu/Fii-rek) — ne pas le supprimer.
    const { data: { user } } = await supabase.auth.getUser()

    // --- Protection des routes Admin ---
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        // La vérification du rôle 'admin' se fait désormais dans app/admin/layout.tsx
        // car les requêtes BDD dans le middleware (Edge) peuvent parfois échouer silencieusement.
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}