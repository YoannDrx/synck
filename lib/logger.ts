type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  none: 50,
}

const envLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase()
const currentLevel: LogLevel = (['debug', 'info', 'warn', 'error', 'none'] as const).includes(
  envLevel as LogLevel
)
  ? (envLevel as LogLevel)
  : 'info'

const shouldLog = (level: LogLevel) =>
  LEVELS[level] >= LEVELS[currentLevel] && currentLevel !== 'none'

const consoleMethod: Record<LogLevel, 'log' | 'info' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
  none: 'log',
}

const log =
  (level: LogLevel) =>
  (...args: unknown[]) => {
    if (!shouldLog(level)) return
    const prefix = `[${level.toUpperCase()}]`
    const method = consoleMethod[level]
    console[method](prefix, ...args)
  }

export const logger = {
  debug: log('debug'),
  info: log('info'),
  warn: log('warn'),
  error: log('error'),
}
