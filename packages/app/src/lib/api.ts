/**
 * API client — resolves the correct base URL for API calls.
 *
 * In development: VITE_API_URL is unset → falls back to '' → Vite proxy handles /api/*
 * In production: VITE_API_URL should point to the deployed Next.js API server
 *                (e.g. https://jawabrasa-api.netlify.app)
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = BASE ? `${BASE}${path}` : path
  return fetch(url, init)
}
