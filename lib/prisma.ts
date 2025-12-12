// @ts-ignore - Prisma 7 type resolution
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { join } from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get database path from DATABASE_URL or use default
const getDatabasePath = () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    // Remove 'file:' prefix if present
    const path = dbUrl.replace(/^file:/, '')
    // If it's an absolute path, use it; otherwise make it relative to project root
    return path.startsWith('/') ? path : join(process.cwd(), path)
  }
  return join(process.cwd(), 'prisma', 'dev.db')
}

const adapter = new PrismaBetterSqlite3({
  url: getDatabasePath()
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

