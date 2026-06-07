import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { devLog } from '@/shared/lib/dev-log'

describe('devLog', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('logs in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    devLog('hello')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('hello')
  })

  it('logs in the test environment', () => {
    vi.stubEnv('NODE_ENV', 'test')
    devLog('hello')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('hello')
  })

  it('is silent in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    devLog('hello')
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('forwards all arguments unchanged, in order', () => {
    vi.stubEnv('NODE_ENV', 'development')
    devLog('a', 1, { b: 2 })
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('a', 1, { b: 2 })
  })
})
