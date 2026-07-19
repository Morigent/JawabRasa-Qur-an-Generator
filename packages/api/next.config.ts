import type { NextConfig } from 'next'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load env vars from the monorepo root .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../.env.local') })
config({ path: resolve(__dirname, '.env.local') })

const nextConfig: NextConfig = {}

export default nextConfig
