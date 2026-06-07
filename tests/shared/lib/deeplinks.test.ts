import { describe, it, expect } from 'vitest';

import {
  getTelegramLink,
  getWhatsAppLink,
  getInstagramLink,
} from '@/shared/lib/deeplinks';

describe('getTelegramLink', () => {
  it('strips a leading @ from the username', () => {
    expect(getTelegramLink('@svoi_demo_bot')).toBe(
      'https://t.me/svoi_demo_bot',
    );
  });

  it('returns the URL unchanged when there is no leading @', () => {
    expect(getTelegramLink('svoi_demo_bot')).toBe('https://t.me/svoi_demo_bot');
  });
});

describe('getWhatsAppLink', () => {
  it('strips every non-digit character and adds no query when text is omitted', () => {
    expect(getWhatsAppLink('+7 (707) 123-45-67')).toBe(
      'https://wa.me/77071234567',
    );
  });

  it('URL-encodes prefilled text (spaces, Cyrillic, emoji)', () => {
    const text = 'Привет! Хочу записаться 💛';
    expect(getWhatsAppLink('+77071234567', text)).toBe(
      `https://wa.me/77071234567?text=${encodeURIComponent(text)}`,
    );
  });

  it('treats empty text as no text (no ?text= query)', () => {
    expect(getWhatsAppLink('+77071234567', '')).toBe(
      'https://wa.me/77071234567',
    );
  });
});

describe('getInstagramLink', () => {
  it('strips a leading @ from the username', () => {
    expect(getInstagramLink('@svoi_demo')).toBe(
      'https://instagram.com/svoi_demo',
    );
  });

  it('returns the URL unchanged when there is no leading @', () => {
    expect(getInstagramLink('svoi_demo')).toBe(
      'https://instagram.com/svoi_demo',
    );
  });
});
