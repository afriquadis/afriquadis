import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configuration des routes protégées
const PROTECTED_ROUTES = [
  '/admin',
  '/account',
  '/cart',
  '/diagnostic/final-results'
];

// Configuration des routes d'authentification
const AUTH_ROUTES = [
  '/login',
  '/register'
];

// Configuration des en-têtes de sécurité
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const response = NextResponse.next();

  // Ajouter les en-têtes de sécurité à toutes les réponses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Gestion spéciale pour les routes d'administration
  if (pathname.startsWith('/admin')) {
    return handleAdminRoute(request, response);
  }

  // Vérification de l'authentification pour les routes protégées
  if (isProtectedRoute(pathname)) {
    return await handleProtectedRoute(request, response);
  }

  // Redirection des utilisateurs connectés depuis les routes d'auth
  if (isAuthRoute(pathname)) {
    return await handleAuthRoute(request, response);
  }

  return response;
}

// Vérifier si une route est protégée
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Vérifier si une route est d'authentification
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

// Gestion des routes d'administration
function handleAdminRoute(request: NextRequest, response: NextResponse): NextResponse {
  const url = new URL(request.url);
  const providedToken = url.searchParams.get('t');
  const hasCookie = request.cookies.get('admin_auth')?.value === '1';
  const validToken = process.env.ADMIN_TOKEN || 'AFRIQUADIS-ADMIN-2024';

  // Si un token valide est fourni, définir le cookie et rediriger
  if (providedToken && providedToken === validToken) {
    url.searchParams.delete('t');
    const redirectResponse = NextResponse.redirect(url);
    
    // Cookie sécurisé pour l'admin
    redirectResponse.cookies.set('admin_auth', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/admin',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return redirectResponse;
  }

  // Autoriser l'accès si le cookie est présent
  if (hasCookie) {
    return response;
  }

  // Bloquer l'accès et rediriger
  return NextResponse.redirect(new URL('/', request.url));
}

// Gestion des routes protégées avec NextAuth
async function handleProtectedRoute(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  try {
    // Vérifier le token JWT NextAuth
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET non défini');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const token = await getToken({ 
      req: request, 
      secret 
    });

    if (!token) {
      // Rediriger vers la page de connexion
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier l'expiration du token
    if (token.exp && typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
      // Token expiré, rediriger vers la connexion
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      loginUrl.searchParams.set('error', 'SessionExpired');
      return NextResponse.redirect(loginUrl);
    }

    // Token valide, autoriser l'accès
    return response;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    
    // En cas d'erreur, rediriger vers la connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    loginUrl.searchParams.set('error', 'AuthError');
    return NextResponse.redirect(loginUrl);
  }
}

// Gestion des routes d'authentification
async function handleAuthRoute(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  try {
    // Vérifier si l'utilisateur est déjà connecté
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET non défini');
      return response;
    }

    const token = await getToken({ 
      req: request, 
      secret 
    });

    if (token) {
      // Utilisateur connecté, rediriger vers le dashboard
      return NextResponse.redirect(new URL('/diagnostic', request.url));
    }

    // Utilisateur non connecté, autoriser l'accès aux pages d'auth
    return response;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return response;
  }
}

// Configuration des routes à traiter par le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
