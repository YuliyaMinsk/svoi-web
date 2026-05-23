# PRD: «Свои» — Demo v0.3

**Версия:** 0.3 | **Изменения от v0.2:** FSD-архитектура, shadcn в `src/shared/ui/`, компактный формат.

## 1. Что делаем

Интерактивный мокап продукта «Свои» для показа знакомым мастерам (3-5 человек) в формате 10-15 минут. Цель: мастер понимает идею и хочет попробовать concierge MVP.

Demo живет 2-3 недели, потом эволюционирует в продукт. Архитектура (FSD + shadcn) выбрана с заделом на продукт.

**Два URL:**
- `/` - клиентский опрос (5 экранов + 1 альтернативный финальный)
- `/master` - мокап стороны мастера в стиле Telegram-чата

**Демо-сценарий:** вымышленный мастер Алина, услуга - японский маникюр, 7000 ₸.

## 2. Scope

**Включено:**
- Клиентский опрос с переходами и анимацией
- Реальные deep-link на мессенджеры (открывают приложения зрителя)
- Мокап Telegram-чата с последовательным появлением сообщений
- Анимированный счетчик ответов мастера
- Карточка AI-рекомендации
- Mobile-first + desktop-центрирование

**НЕ включено:** backend, БД, auth, реальный AI, реальный бот, аналитика, A/B, multilang, мультимастера, темная тема, брендинг, свой домен.

## 3. Стек

| Слой | Технология |
|------|------------|
| Framework | Next.js 15 (App Router, client-only) |
| Язык | TypeScript strict |
| UI | shadcn/ui + Tailwind v4 |
| Анимации | framer-motion |
| Шрифт | Manrope (via next/font) |
| Архитектура | FSD ([feature-sliced design](https://fsd.how)) |
| Deploy | Vercel |

## 4. Архитектура (FSD + Next.js)

### 4.1 Принцип

`app/` и `pages/` в корне - только для Next.js роутинга. Вся логика - в `src/` по слоям FSD. В `app/page.tsx` лежат **тонкие реэкспорты** из `src/pages/`.

### 4.2 Структура проекта

```
svoi-demo/
├── app/                              # Next.js роутинг
│   ├── layout.tsx
│   ├── page.tsx                      # реэкспорт из @/pages/home
│   └── master/page.tsx               # реэкспорт из @/pages/master
├── pages/                            # пустая (требование Next.js)
│   └── README.md
├── src/
│   ├── app/
│   │   └── styles/globals.css        # Tailwind + CSS-переменные
│   ├── pages/
│   │   ├── home/
│   │   │   ├── index.ts              # public API
│   │   │   └── ui/HomePage.tsx
│   │   └── master/
│   │       ├── index.ts
│   │       └── ui/MasterPage.tsx
│   ├── features/
│   │   ├── client-flow/
│   │   │   ├── index.ts
│   │   │   ├── model/use-client-flow.ts    # state-машина
│   │   │   └── ui/
│   │   │       ├── ClientFlow.tsx          # контейнер
│   │   │       ├── ScreenWelcome.tsx
│   │   │       ├── ScreenNotify.tsx
│   │   │       ├── ScreenPriority.tsx
│   │   │       ├── ScreenContact.tsx
│   │   │       ├── ScreenClosure.tsx
│   │   │       └── ScreenClosureEarly.tsx
│   │   └── master-view/
│   │       ├── index.ts
│   │       ├── model/messages-config.ts    # последовательность сообщений
│   │       └── ui/
│   │           ├── TelegramChat.tsx
│   │           ├── BotMessage.tsx
│   │           ├── ResponseCounter.tsx
│   │           └── RecommendationCard.tsx
│   ├── entities/
│   │   └── master/
│   │       ├── index.ts
│   │       ├── model/types.ts              # MasterConfig, ServiceConfig
│   │       └── ui/MasterCard.tsx           # фото + имя
│   └── shared/
│       ├── ui/                             # shadcn кладет сюда + свои общие
│       │   ├── button.tsx
│       │   └── card.tsx
│       ├── lib/
│       │   ├── cn.ts                       # cn() helper
│       │   ├── deeplinks.ts
│       │   └── dev-log.ts
│       ├── config/master-config.ts         # MASTER константа
│       └── assets/master-photo.jpg
├── public/
├── components.json                   # конфиг shadcn
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

### 4.3 Реэкспорты

`app/page.tsx`:
```typescript
export { HomePage as default } from '@/pages/home'
```

`src/pages/home/index.ts`:
```typescript
export { HomePage } from './ui/HomePage'
```

`src/pages/home/ui/HomePage.tsx`:
```typescript
import { ClientFlow } from '@/features/client-flow'

export const HomePage = () => <ClientFlow />
```

Аналогично для `master`.

### 4.4 Ключевые конфиги

**`tsconfig.json` paths:**
```json
"paths": { "@/*": ["./src/*"] }
```

**`components.json` (shadcn):**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/lib/cn",
    "ui": "@/shared/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/lib/hooks"
  }
}
```

## 5. Типы и конфиг

`src/entities/master/model/types.ts`:
```typescript
export type Step =
  | 'welcome' | 'notify' | 'priority'
  | 'contact' | 'closure' | 'closureEarly'

export interface MasterConfig {
  name: string
  photoUrl: string
  city: string
  service: ServiceConfig
  contacts: ContactsConfig
}

export interface ServiceConfig {
  name: string
  description: string
  price: number
  currency: 'KZT' | 'PLN' | 'USD'
}

export interface ContactsConfig {
  telegram: string    // @username
  whatsapp: string    // +77071234567
  instagram: string   // @username
}

export interface BotMessage {
  id: string
  text: string
  timestamp: string
  type: 'system' | 'response' | 'recommendation'
  delayMs: number
}
```

`src/shared/config/master-config.ts`:
```typescript
import type { MasterConfig } from '@/entities/master'

export const MASTER: MasterConfig = {
  name: 'Алина',
  photoUrl: '/master-photo.jpg',
  city: 'Алматы',
  service: {
    name: 'Японский маникюр',
    description: 'Уход без покрытия, ногти становятся блестящими и крепкими сами по себе',
    price: 7000,
    currency: 'KZT',
  },
  contacts: {
    telegram: '@svoi_demo_bot',
    whatsapp: '+77071234567',
    instagram: '@svoi_demo',
  },
}
```

`src/shared/lib/deeplinks.ts`:
```typescript
export const getTelegramLink = (username: string) =>
  `https://t.me/${username.replace('@', '')}`

export const getWhatsAppLink = (phone: string, text?: string) => {
  const clean = phone.replace(/[^\d]/g, '')
  const param = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${clean}${param}`
}

export const getInstagramLink = (username: string) =>
  `https://instagram.com/${username.replace('@', '')}`
```

## 6. Клиентский опрос (URL `/`)

### 6.1 State-машина

```
   WELCOME
   ├─[Интересно]→ NOTIFY
   │                 ├─[Да, напишите]→ PRIORITY
   │                 │                    ├─[Да, хочу]→ CONTACT → CLOSURE
   │                 │                    └─[Не уверена]→ CLOSURE
   │                 └─[Просто посмотрю]→ CLOSURE
   └─[Пока не интересно]→ CLOSURE_EARLY
```

### 6.2 Тексты экранов

**Welcome:**
> [фото мастера]
> Привет 💛 Я Алина, ваш мастер
>
> Думаю добавить японский маникюр — это уход без покрытия, ногти становятся блестящими и крепкими сами по себе. Цена будет около 7000 ₸.
>
> Хочу понять, насколько вам это интересно, до того как буду закупаться материалами.
>
> **[Интересно]** **[Пока не интересно]**

**Notify:**
> Здорово 🙏
>
> Если запущу процедуру в следующем месяце — написать вам, чтобы вы знали?
>
> **[Да, напишите]** **[Просто посмотрю позже]**

**Priority:**
> Если запущу — смогу сначала взять только несколько человек, чтобы попробовать на знакомых лицах.
>
> Хотите быть среди первых?
>
> **[Да, хочу]** **[Пока не уверена]**

**Contact:**
> Куда удобнее написать вам, если запущу процедуру?
>
> **[Написать в Telegram]** **[Открыть WhatsApp]** **[Скопировать текст и открыть Instagram]**

*Под кнопками мелким серым: "это демо — настоящие кнопки откроют ваш мессенджер"*

**Closure:**
> Спасибо 💛
>
> Это правда помогает мне понять, стоит ли запускать.
> Если решусь — обязательно напишу вам.
>
> *P.S. Знаете подругу, которой это тоже было бы интересно?*
>
> **[Поделиться в WhatsApp]** **[Скопировать ссылку]**
>
> ---
> *Эта страница — демо продукта «Свои».*

**ClosureEarly:**
> Спасибо, что заглянули 💛
>
> Если что-то изменится — всегда рада видеть вас в своем кресле.

### 6.3 Поведение кнопок Contact

Все три кнопки на Contact:
1. Открывают соответствующий мессенджер через deep-link
2. Переводят на Closure

Для demo контакты в `MASTER.contacts` - заглушки. Мессенджер у зрителя откроется на профиль/пустую форму - это ожидаемо.

## 7. Мокап мастера (URL `/master`)

### 7.1 Визуал

Стилизация под Telegram-чат:
- Шапка чата: "Свои — Алина" + аватар бота
- Поле сообщений на фоне `#EEEDEB`
- Сообщения бота: белые пузыри, тень
- Поле ввода снизу (неактивное)

### 7.2 Последовательность сообщений

```
T+0s    Привет 👋 Готовим вашу страницу проверки спроса 
        на японский маникюр.

T+1.5s  Страница готова: svoi.kz/alina
        Можете отправлять клиенткам в сторис, директ, 
        WhatsApp.

T+3s    ─── 3 минуты назад ───
        1 человек открыл вашу страницу 👀

T+5s    ─── 12 минут назад ───
        Анна 💛 ответила "интересно"
        Хочет узнать о запуске.

T+7s    ─── 28 минут назад ───
        Айгуль захотела приоритетный слот 🌟
        Это сильный сигнал — она готова прийти первой.

T+9s    [счетчик: 14 ответов / 4 приоритет / 8 уведомлений]

T+11s   [карточка рекомендации]

T+13s   Что хотите сделать?
        [Запустить услугу] [Подождать еще]
```

### 7.3 Карточка рекомендации

```
✨ Похоже, спрос есть.

Из 87 девочек, увидевших вашу страницу:
- 54 открыли страницу
- 38 нажали "интересно"  
- 22 захотели узнать о запуске
- 11 захотели прийти первыми

Это сильный сигнал. 11 человек готовы записаться в 
первую неделю запуска, цена 7000 ₸ почти не пугает 
(только 4 ушли после узнавания цены).

Что бы я сделала на вашем месте:
Закупитесь на первые 10 процедур, откройте запись 
сначала тем 11, кто захотел приоритет.

Не пытайтесь охватить весь интерес сразу — типичный 
разрыв между "напишите мне" и реальной записью 50-60%.
```

### 7.4 Счетчик

При появлении блока значения начинаются с 0, за 2 секунды докручиваются до 14/4/8 через framer-motion `useMotionValue` + `useTransform`.

## 8. Дизайн

### 8.1 Палитра в `globals.css`

```css
@layer base {
  :root {
    --background: #FBF7F2;
    --foreground: #2D2A26;
    --card: #FFFFFF;
    --card-foreground: #2D2A26;
    --primary: #C97B5A;
    --primary-hover: #B36A4A;
    --primary-foreground: #FFFFFF;
    --muted: #F5F0E8;
    --muted-foreground: #6B6560;
    --border: #D6CFC7;
    --input: #D6CFC7;
    --ring: #C97B5A;
    
    --radius: 1rem;       /* 16px кнопки */
    --radius-lg: 1.5rem;  /* 24px карточки */
    --shadow-card: 0 4px 16px rgba(201, 123, 90, 0.08);
  }
}
```

### 8.2 Палитра Telegram-мокапа

Локально в компонентах `master-view`:
- Фон чата: `#EEEDEB`
- Шапка: `#FFFFFF`
- Сообщение: `#FFFFFF`
- Текст: `#1C1C1E`
- Время: `#8E8E93`
- Telegram-синий: `#2481CC`

### 8.3 Типографика

- Шрифт: Manrope (через `next/font`)
- Body: 18px mobile / 17px desktop
- Heading: 22px / weight 600
- Button: 17px / weight 500
- Line-height: 1.5 body / 1.3 heading

### 8.4 Размеры

- Контейнер mobile: 100% с padding 24px
- Контейнер desktop: max-width 480px, центр
- Button height: minimum 56px
- Радиусы: button 16px, card 24px
- Gap: 24px между блоками, 12px между кнопками

### 8.5 Анимации (framer-motion)

**Переход между экранами:**
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.3, ease: 'easeOut' }}
```

**Появление сообщения в Telegram:**
```typescript
initial={{ opacity: 0, scale: 0.8, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.25, ease: 'easeOut' }}
```

### 8.6 Запрещено

Градиенты AI/SaaS, dark mode, графики, таймеры обратного отсчета, FOMO ("осталось 3 места"), иконки lucide на кнопках опроса (только текст + эмодзи), toast, модалки.

## 9. Команды

```bash
# Создание
npx create-next-app@latest svoi-demo --typescript --tailwind --app --src-dir
cd svoi-demo

# Реорганизация структуры под FSD:
# 1. Переместить app/ из src/ в корень проекта
# 2. Создать пустую pages/ в корне с README.md
# 3. Создать src/{app,pages,features,entities,shared}/

# Зависимости
npm install framer-motion

# Инициализация shadcn (отвечать как в components.json выше)
npx shadcn@latest init
npx shadcn@latest add button card

# Запуск
npm run dev
```

## 10. Чеклист релиза

**Код:**
- [ ] FSD-структура развернута, реэкспорты работают
- [ ] shadcn инициализирован в `src/shared/ui/`
- [ ] CSS-переменные палитры в `globals.css`
- [ ] Кастомизация `button.tsx` под палитру

**Клиентский опрос:**
- [ ] 6 экранов сверстаны и связаны state-машиной
- [ ] Анимации переходов работают
- [ ] Deep-link кнопки открывают мессенджеры
- [ ] Дисклеймер про demo на Closure

**Мокап мастера:**
- [ ] Telegram-стилизация
- [ ] Сообщения появляются с задержками
- [ ] Счетчик анимируется от 0 до target
- [ ] Карточка рекомендации читаема

**Тестирование:**
- [ ] iPhone, Android, Desktop - оба URL
- [ ] Deep-link реально открывают мессенджеры
- [ ] Lighthouse Performance > 80 на mobile

**Готовность к показу:**
- [ ] Deploy на Vercel стабилен
- [ ] Закладки на телефоне
- [ ] Питч прорепетирован
- [ ] Вопросы интервью под рукой

## 11. Что переходит в продукт

**Остается:** FSD-структура, shadcn-инфраструктура, CSS-переменные палитры, типы (`MasterConfig`, `ServiceConfig`), компоненты экранов опроса (после кастомизации).

**Переписывается:** хардкод-данные → API (Supabase + FastAPI), мокап Telegram → реальный aiogram-бот, console.log → опциональная аналитика, один путь `/` → роутинг по мастерам.

**Добавляется:** Telegram Login Widget (auth), реальные AI-вызовы, БД, мультиязычность.