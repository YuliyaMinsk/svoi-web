/** Drops a leading `@` from a messenger handle; leaves bare handles untouched. */
const stripAt = (handle: string): string => handle.replace('@', '')

export const getTelegramLink = (username: string): string =>
  `https://t.me/${stripAt(username)}`

export const getWhatsAppLink = (phone: string, text?: string): string => {
  const digits = phone.replace(/[^\d]/g, '')
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}

export const getInstagramLink = (username: string): string =>
  `https://instagram.com/${stripAt(username)}`
