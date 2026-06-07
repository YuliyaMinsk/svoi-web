export type Step =
  | 'welcome'
  | 'notify'
  | 'priority'
  | 'contact'
  | 'closure'
  | 'closureEarly';

export interface MasterConfig {
  name: string;
  photoUrl: string;
  city: string;
  service: ServiceConfig;
  contacts: ContactsConfig;
}

export interface ServiceConfig {
  name: string;
  description: string;
  price: number;
  currency: 'KZT' | 'PLN' | 'USD';
}

export interface ContactsConfig {
  telegram: string; // @username
  whatsapp: string; // +77071234567
  instagram: string; // @username
}

export interface BotMessage {
  id: string;
  text: string;
  timestamp: string;
  type: 'system' | 'response' | 'recommendation';
  delayMs: number;
}
