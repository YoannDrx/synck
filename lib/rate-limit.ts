const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  identifier: string,
  limit = 10,
  windowMs = 15 * 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key)
      }
    }
  },
  5 * 60 * 1000
)
