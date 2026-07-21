import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to /api routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const origin = request.headers.get('origin') ?? ''
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://jawabrasa.netlify.app',
    'https://main--jawabrasa.netlify.app',
  ]

  const response = NextResponse.next()

  // Allow requests from known origins (or no origin — same-origin)
  if (!origin || allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
