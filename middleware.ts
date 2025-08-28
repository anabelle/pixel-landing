import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'es', 'fr', 'ja'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // Check if locale is already in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(locale => pathname.startsWith(`/${locale}`));
  if (pathnameLocale) return pathnameLocale;

  // Check for preferred locale cookie (manual selection)
  const preferredLocale = request.cookies.get('preferred-locale')?.value;
  if (preferredLocale && locales.includes(preferredLocale)) {
    return preferredLocale;
  }

  // Get Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, q = '1'] = lang.trim().split(';q=');
      return { locale: locale.split('-')[0], q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q);

  // Find the first supported locale
  for (const { locale } of languages) {
    if (locales.includes(locale)) {
      return locale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const pathnameLocale = locales.find(loc => pathname.startsWith(`/${loc}`));

  // If no locale in pathname, redirect to detected locale
  if (!pathnameLocale) {
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};