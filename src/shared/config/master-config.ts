import type { MasterConfig } from '@/entities/master'

export const MASTER: MasterConfig = {
  name: 'Алина',
  photoUrl: '/master-photo.png',
  city: 'Алматы',
  service: {
    name: 'Японский маникюр',
    description:
      'Уход без покрытия, ногти становятся блестящими и крепкими сами по себе',
    price: 7000,
    currency: 'KZT',
  },
  contacts: {
    telegram: '@svoi_demo_bot',
    whatsapp: '+77071234567',
    instagram: '@svoi_demo',
  },
}
