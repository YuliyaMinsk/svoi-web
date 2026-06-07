import { describe, it, expect } from 'vitest'
import { MASTER } from '@/shared/config/master-config'

describe('MASTER demo configuration', () => {
  it('has all required string fields non-empty', () => {
    const strings = [
      MASTER.name,
      MASTER.photoUrl,
      MASTER.city,
      MASTER.service.name,
      MASTER.service.description,
      MASTER.contacts.telegram,
      MASTER.contacts.whatsapp,
      MASTER.contacts.instagram,
    ]
    for (const value of strings) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('has a positive service price', () => {
    expect(typeof MASTER.service.price).toBe('number')
    expect(MASTER.service.price).toBeGreaterThan(0)
  })

  it('has a currency within the closed union', () => {
    expect(['KZT', 'PLN', 'USD']).toContain(MASTER.service.currency)
  })

  it('points photoUrl at the served placeholder', () => {
    expect(MASTER.photoUrl).toBe('/master-photo.png')
  })
})
