# shadcn/ui — выжимка для этого проекта

> **Версии:** shadcn CLI `4.9.0` · radix-ui `1.4.3` · clsx `2.1.1` · tailwind-merge `3.6.0` · class-variance-authority `0.7.1` · lucide-react `1.17.0` · tw-animate-css `1.4.0`
> **Стек:** Next 16.2 · React 19.2 · Tailwind v4 · FSD
>
> ⚠️ Если установленная версия отличается — перечитать актуальный гайд и обновить выжимку.

## Модель работы

`add <name>` копирует **исходник компонента в репо** (`@/shared/ui`), это не npm-пакет — компоненты правим у себя. Примитивы тянутся из **единого** пакета `radix-ui` (не отдельные `@radix-ui/react-*`).

```bash
npx shadcn@latest add button card ...
```

## Куда падают файлы — aliases (FSD-маппинг)

Уже настроено в `components.json` под нашу FSD-структуру:

| alias        | путь                 |
| ------------ | -------------------- |
| `components` | `@/shared`           |
| `ui`         | `@/shared/ui`        |
| `utils`      | `@/shared/lib/cn`    |
| `lib`        | `@/shared/lib`       |
| `hooks`      | `@/shared/lib/hooks` |

`baseColor: "neutral"` зафиксирован при init. `style` изначально был `radix-nova`, в F2 переключён на **`radix-maia`** (тот же база `radix`, пресет Maia — фирменные pill-кнопки `rounded-4xl`). Смена пресета = `components.json` `style` + `npx shadcn add <comp> --overwrite` из корня проекта (база не менялась, Maia доступна и на `radix`, и на `base`). Палитра/шрифт перекрыты в F2 (терракот + Manrope).

## React 19 / Tailwind v4 конвенции

- Компоненты — **обычные функции без `forwardRef`/`displayName`**, типы через `React.ComponentProps<...>`.
- У примитивов `data-slot` для стилизации.
- Нет `tailwind.config.js` (Tailwind v4). `components.json.tailwind.config` пустой.
- `rsc: true` — CLI сам добавляет `"use client"` где нужно.

## globals.css (`src/app/styles/globals.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";      /* механизм 4.x; поэтому shadcn в dependencies, не dev */
@custom-variant dark (&:is(.dark *));
@theme inline { ... }               /* токены-переменные */
:root { --background: oklch(...); ... }   /* цвета в oklch */
.dark { ... }                       /* тёмная тема через класс .dark, НЕ prefers-color-scheme */
```

Шрифты: `--font-sans` / `--font-heading`.

## `cn` — `src/shared/lib/cn.ts`

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Повторный init (если понадобится)

`init` требует **обязательно** передавать `-p <preset>` — без него команда виснет на интерактивном промпте даже с `-y`. База: `-b radix|base` (`neutral` — это цвет, не база).

```bash
npx shadcn@latest init -b radix -p nova -y
```
