# Development Plan: «Свои» — Demo

**Источник:** PRD v0.3  
**Назначение:** план разработки demo пошагово - от пустого репозитория до готового локально работающего проекта. По этому плану пишутся спеки фич, по спекам - тесты.

---

## 1. Нарезка на фичи

Цель — каждый шаг проверяется тестами независимо, между шагами проект собирается и работает локально.

| # | Фича | Что делает | Зависит от | Почему отдельная |
|---|------|------------|------------|------------------|
| F0.1 | **project/init** | `create-next-app@latest` (Next.js 16: App Router и Turbopack по дефолту, ESLint Flat Config через `eslint.config.mjs`, AGENTS.md создается автоматически). TypeScript + Tailwind + `src/`-директория. Создание FSD-слоев внутри src/ (`src/{pages,features,entities,shared}/` + `src/app/styles/`), перенос `globals.css` в `src/app/styles/`, правка импорта в `layout.tsx`. `src/app/` остается роутером Next.js. `tsconfig.json` paths `@/* → ./src/*` уже настроен create-next-app. `.gitignore`, первый коммит. | — | Разовая стартовая настройка. Не должна смешиваться с продуктовыми фичами - если что-то здесь сломается, сломается все. |
| F0.2 | **tooling/openspec** | Установка `@fission-ai/openspec` как dev-зависимости. `npx openspec init` с выбором инструментов (Claude Code, Codex, GitHub Copilot). Заполнение `openspec/config.yaml` project context'ом (стек, FSD, TDD workflow, конвенции коммитов, палитра). Изучить структуру `openspec/specs/`, `openspec/changes/`, `.claude/skills/`, `.claude/commands/opsx/`. | F0.1 | OpenSpec - инфраструктура процесса разработки, не продуктовая фича. Должен быть готов до F3 (первая фича через TDD цикл). Project context критичен: без него AI-ассистенты генерируют спеки без знания стека. |
| F0.3 | **tooling/test-stack** | Установка Vitest + @vitejs/plugin-react + jsdom + RTL (react, jest-dom, user-event) + @vitest/ui. Установка Playwright + chromium. Конфиги: `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`. Создание папки `tests/` зеркалящей `src/`. Скрипты в `package.json` (`test`, `test:ui`, `test:e2e`). Smoke-тест - один passing assertion для проверки что pipeline работает. | F0.1 | Тестовый стек - инфраструктура. Должен быть готов до F3, когда начинается TDD цикл (тесты пишутся до кода). Изоляция конфигов от продуктовых фич означает что любые проблемы с настройкой Vitest/Playwright не блокируют разработку. |
| F1 | **shared/ui (shadcn)** | `npx shadcn@latest init`, настройка `components.json` с алиасами на `@/shared/ui`, `@/shared/lib/cn`. Установка компонентов `button` и `card`. | F0 | shadcn заводит свою инфраструктуру (`components.json`, `lib/utils`) — настроить до того как писать UI. Алиасы под FSD задаются здесь. |
| F2 | **shared/styles** | Подключение Manrope через `next/font/google`, CSS-переменные палитры Original в `globals.css` (`--background`, `--primary`, `--primary-hover`, `--radius`, `--shadow-card`), кастомизация `shared/ui/button.tsx` под палитру. | F1 | Дизайн-токены должны быть готовы до первого экрана. Кастомизация Button — отдельная задача от установки shadcn. |
| F3 | **entities/master/types + shared/config** | Все TS типы в `entities/master/model/types.ts` (`MasterConfig`, `ServiceConfig`, `ContactsConfig`, `BotMessage`, `Step`), public API через `index.ts`. Константа `MASTER` в `shared/config/master-config.ts`. Утилиты `deeplinks.ts` и `dev-log.ts` в `shared/lib/`. | F0 (типы независимы от UI) | Фундамент. Контракт данных фиксируем рано — спека и тесты на форму данных без поведения. |
| F4 | **app routing + pages stubs** | `app/layout.tsx` (шрифт, metadata, импорт `globals.css`). Заглушки `src/pages/home/` и `src/pages/master/` с `HomePage` и `MasterPage` (просто `<div>placeholder</div>`). Реэкспорты в `app/page.tsx` и `app/master/page.tsx`. | F2, F3 | Проверка что FSD-структура работает с Next.js. Если реэкспорты сломаны — лучше узнать до того как написан UI. |
| F5 | **entities/master/ui — MasterCard** | Компонент `MasterCard` в `entities/master/ui/`: круглое фото 80x80 через `next/image` + имя 18px weight 500 + город 14px muted. Props или дефолт из `MASTER`. | F2, F3 | Переиспользуемый кирпич — используется на нескольких экранах опроса. Изолируем отдельной фичей чтобы потом импортировать без дублирования. |
| F6 | **features/client-flow/ui — ScreenWelcome (статика)** | Компонент `ScreenWelcome` без логики переходов: контейнер + `MasterCard` + текст приветствия и описания услуги из `MASTER.service` + две shadcn Button (primary + outline). `onClick` — заглушки `console.log`. Подключение в `HomePage`. | F5 | Первый вертикальный срез: FSD + shadcn + палитра + типография + entity-компонент дают рабочий экран. Без state-машины и анимаций — отделяем верстку от логики. |
| F7 | **features/client-flow/model — useClientFlow** | Кастомный хук в `model/use-client-flow.ts`: `useState<Step>('welcome')`, функция `goTo(action: 'intent' \| 'reject')` с логикой переходов согласно state-машине из PRD 6.1. Public API. | F3 (тип `Step`) | State-машина — чистая логика без UI. Покрывается тестами отдельно от компонентов. Изоляция в хук — правильная архитектурная граница. |
| F8 | **features/client-flow/ui — ClientFlow container + animations** | Компонент `ClientFlow`: использует хук, рендерит экран по `step`, оборачивает в `AnimatePresence mode="wait"`, каждый экран в `motion.div` с fade+slide. `ScreenWelcome` переключается на использование `onIntent`/`onReject` props. Подключение `ClientFlow` в `HomePage` вместо ScreenWelcome. Заглушки для остальных шагов: `<div>Next: {step}</div>`. | F6, F7 | Добавление framer-motion и `AnimatePresence` — отдельная техническая задача. Также это момент превращения Welcome из статичного экрана в часть полноценного flow. |
| F9 | **features/client-flow/ui — ScreenNotify** | Компонент `ScreenNotify` согласно тексту PRD 6.2: заголовок "Здорово 🙏" + текст про уведомление + две кнопки. Подключение в `ClientFlow`, замена заглушки шага 'notify'. | F8 | Один экран = одна фича. Своя спека, свои тесты, свой коммит. |
| F10 | **features/client-flow/ui — ScreenPriority** | Компонент `ScreenPriority` согласно PRD 6.2: текст про ранний слот + две кнопки. Подключение в `ClientFlow`. | F8 | Один экран = одна фича. |
| F11 | **features/client-flow/ui — ScreenContact + deeplinks** | Компонент `ScreenContact`: заголовок + три кнопки мессенджеров + мелкий disclaimer. Каждая кнопка использует функцию из `deeplinks.ts` + контакты из `MASTER`, открывает мессенджер через `window.open(link, '_blank')` и вызывает переход на closure. | F8, F3 | Специфическая логика deep-link, требует тестирования на реальных устройствах. Изолируется в отдельную фичу из-за побочного эффекта (открытие внешнего приложения). |
| F12 | **features/client-flow/ui — ScreenClosure** | Финальный экран благодарности + опциональный шеринг (две кнопки-заглушки) + дисклеймер про demo внизу. Подключение в `ClientFlow`. | F8 | Один экран = одна фича. Закрывает happy path. |
| F13 | **features/client-flow/ui — ScreenClosureEarly** | Альтернативный финальный экран для отказа на Welcome. Минималистичный: "Спасибо, что заглянули 💛 Если что-то изменится — всегда рада видеть вас в своем кресле." Подключение для шага 'closureEarly'. | F8 | Альтернативная ветка flow. После этой фичи клиентский опрос полностью функционален. |
| F14 | **features/master-view/ui — TelegramChat shell** | Компонент `TelegramChat`: шапка ("Свои — Алина" + аватар бота 32x32, белый фон, граница снизу) + основная область с фоном `#EEEDEB` + неактивное поле ввода снизу (иконка прикрепления, плейсхолдер "Сообщение", иконка микрофона). Подключение в `MasterPage`. Без сообщений. | F4 (страница `/master`) | Стилизация под Telegram — тонкая работа с отступами/тенями/шрифтами. Отлаживается отдельно от логики сообщений. |
| F15 | **features/master-view/model + ui/BotMessage** | Конфиг `messages-config.ts` в `model/` — массив `BotMessage[]` согласно PRD 7.2 (тексты, timestamps, delayMs, типы). Компонент `BotMessage` в `ui/` — рендер одного пузыря: белый фон, скругление, тень, текст, время справа внизу. Поддержка переноса строк и типа `system` (центрированный разделитель). Анимация появления через framer-motion. | F14, F3 (`BotMessage`) | Разделение данных (конфиг) и презентации (компонент) — чистая архитектура. Связь через тип. |
| F16 | **features/master-view/ui — sequential rendering** | Логика в `TelegramChat`: чтение `messagesConfig`, последовательное появление сообщений через `setTimeout` + `useState` для индекса. Авто-прокрутка чата вниз при появлении нового. Cleanup всех таймеров на unmount. | F15 | Временная логика — отдельный аспект с граничными случаями (unmount во время воспроизведения, перезагрузка страницы). Тестируется отдельно. |
| F17 | **features/master-view/ui — ResponseCounter** | Компонент `ResponseCounter`: три цифры в ряд (14 ответов / 4 приоритет / 8 уведомлений) с подписями. Анимация числа от 0 до target через framer-motion `useMotionValue` + `useTransform`, длительность 2 секунды. Запуск при появлении на экране. Интеграция в `BotMessage` через тип/маркер. | F16 | Сложная анимация числа — изолированный компонент со своими тестами. Не зависит от F18 (карточка рекомендации). |
| F18 | **features/master-view/ui — RecommendationCard** | Компонент `RecommendationCard`: визуально выделенный блок с текстом рекомендации из PRD 7.3. Дизайн: усиленная тень, акцентная граница слева в терракот, иконка sparkles в заголовке. Интеграция в `BotMessage` через тип 'recommendation'. | F16 | Самый визуально выраженный блок мокапа — отдельная задача дизайна. Не зависит от F17. |
| F19 | **qa/final-pass** | Вычитка всех текстов (опечатки, грамматика, единый тон). Проверка обоих URL на iPhone, Android, desktop. Тест deep-link на реальных устройствах. Проверка mobile на 375x667. Lighthouse mobile > 80. Исправления в рамках этой фичи. | все предыдущие | QA, не разработка. Отдельная фаза с своими задачами и критерием готовности "demo можно показывать". |

---

## 2. Граф зависимостей

```
F0 ─┬─→ F1 ──→ F2 ─┐
    │              │
    └─→ F3 ────────┤
                   ▼
                   F4 ──→ F5 ──→ F6 ──→ F7 ──→ F8 ──┬─→ F9
                   │                                │
                   │                                ├─→ F10
                   │                                │
                   │                                ├─→ F11
                   │                                │
                   │                                ├─→ F12
                   │                                │
                   │                                └─→ F13
                   │
                   └─→ F14 ──→ F15 ──→ F16 ──┬─→ F17
                                             │
                                             └─→ F18
                   
                   F19 (после всего)
```

**Параллельность:**
- F9-F13 не зависят друг от друга, делаются в любом порядке
- F17 и F18 не зависят друг от друга, делаются в любом порядке
- Клиентский flow (F4-F13) и мокап мастера (F14-F18) — две почти независимые ветки после F4

---

## 3. Рекомендуемый порядок

```
F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → 
F9 → F10 → F11 → F12 → F13 → 
F14 → F15 → F16 → F17 → F18 → 
F19
```

**Обоснование:**

- **F0–F3 строго по порядку** — инфраструктура зависимая, проскочить нельзя
- **F4–F8 строго по порядку** — путь "от пустой страницы до первого живого экрана с переходами"
- **F9–F13 в любом порядке**, но в чеклисте по логике flow (Notify → Priority → Contact → Closure → ClosureEarly). Так можно тестировать happy path по мере добавления экранов
- **F14–F18 после клиентского flow** — чтобы не переключаться между визуально разными интерфейсами. Когда работаешь над Telegram-стилизацией, голова в Telegram-эстетике
- **F19 в самом конце** — тестирование когда все собрано

---

## 4. Детальные чеклисты по фичам

### F0. project/init

- [x] Запустить интерактивный промпт: `npx create-next-app@latest svoi-web` и выбрать «recommended defaults» (TypeScript + ESLint + Tailwind + App Router + AGENTS.md), либо `--yes` для пропуска. В Next.js 16: App Router и Turbopack включены по умолчанию (флаги `--app`, `--turbopack`, `--eslint` больше не нужны), AGENTS.md создается автоматически, конфиг ESLint - `eslint.config.mjs` (Flat Config), `next build` сам линт не запускает ✅ 2026-05-23
- [x] Подтвердить, что `src/`-директория выбрана в промпте (пункт «Would you like your code inside a `src/` directory?») ✅ 2026-05-23
- [x] Создать FSD-слои: `mkdir -p src/{pages,features,entities,shared/{ui,lib,config,assets}}` ✅ 2026-05-23
- [x] Перенести стили: `mkdir -p src/app/styles && mv src/app/globals.css src/app/styles/globals.css` ✅ 2026-05-23
- [x] Обновить импорт в `src/app/layout.tsx`: `import "./globals.css"` → `import "@/app/styles/globals.css"` ✅ 2026-05-23
- [x] Добавить README.md в каждый пустой FSD-слой (pages, features, entities, shared) с кратким описанием назначения - чтобы git зафиксировал папки и было понятно при онбординге ✅ 2026-05-23
- [x] Проверить `tsconfig.json` - alias `@/*` указывает на `./src/*`; `include` содержит `.next/dev/types/**/*.ts` (в Next.js 16 `next dev` пишет в `.next/dev`, `next build` - в `.next`) ✅ 2026-05-23
- [x] Проверить `package.json`: `"dev": "next dev"`, `"build": "next build"`, `"lint": "eslint"` (без `next lint` - он удален в v16) ✅ 2026-05-23
- [x] Проверить `.gitignore` (next/node/build/.env) ✅ 2026-05-23
- [x] Первый коммит: `chore: initial project setup with FSD structure` ✅ 2026-05-23
- [x] **Проверка:** `npm run dev` запускает дефолтную страницу Next.js на http://localhost:3000 без ошибок ✅ 2026-05-23

**Заметка об архитектурном решении:** `src/app/` остается папкой роутинга Next.js (layout.tsx, page.tsx, маршруты, styles/). Бизнес-логика и UI экранов живут в FSD-слоях `src/pages/`, `src/features/`, `src/entities/`, `src/shared/`. Заглушка `pages/` в корне не нужна - Next.js 13+ корректно работает с `src/app/` без этого.

**Заметка про Next.js 16 (актуально для последующих фич):**
- **Async Request APIs:** `params` и `searchParams` в `page.tsx`/`layout.tsx` теперь `Promise`. В этом плане динамических роутов нет (`/` и `/master` — статика), но если добавится `[id]` — принимать `{ params: Promise<{ id: string }> }` и делать `await params`. Helper `PageProps<'/route'>` генерируется через `npx next typegen`.
- **next/image defaults:** `images.qualities` по умолчанию `[75]` — для значений вне этого набора настраивать в `next.config.ts`. Локальные src без query-параметров работают как раньше (нужны они — `images.localPatterns`).
- **React 19.2 + React Compiler:** компилятор стабилен, но **не включаем** для demo (увеличивает время билда через Babel). `<ViewTransition>` из React 19.2 не используем — остаёмся на framer-motion.
- **`next build` output:** убраны метрики `size` и `First Load JS` — для оценки бандла использовать Chrome DevTools / Lighthouse напрямую (см. F19).

### F0.2. tooling/openspec

- [x] Установить OpenSpec локально: `npm install --save-dev @fission-ai/openspec` ✅ 2026-05-23
- [x] Инициализация: `npx openspec init`. На вопросе про инструменты выбрать **Claude Code, Codex, GitHub Copilot** (пробелом отмечать, Enter подтвердить) ✅ 2026-05-23
- [x] Убедиться что создались: `openspec/{config.yaml, specs/, changes/}`, `.claude/{skills/, commands/opsx/}`, `.codex/skills/`, `.github/{prompts/, skills/}`, `CLAUDE.md` с импортом `@AGENTS.md` ✅ 2026-05-23
- [x] Заполнить `openspec/config.yaml` блоком `context:` (стек, FSD-структура, тестовый стек, TDD workflow, конвенции коммитов, палитра Original). Контент: см. отдельный сниппет в этом плане ниже ✅ 2026-05-23
- [x] Заполнить блок `rules:` для `proposal` (фокус на одну фичу, ссылка на ID фичи, acceptance criteria для тестов) и `tasks` (TDD-aligned chunks, явная задача "write failing tests" перед "implement") ✅ 2026-05-23
- [x] Изучить структуру skill-файлов: `cat .claude/skills/openspec-propose/SKILL.md` и аналогичные - понять что AI-ассистент будет делать на каждой фазе ✅ 2026-05-23
- [x] Перезапустить VS Code/Cursor чтобы slash-команды `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore` стали доступны ✅ 2026-05-23
- [x] Коммит: `chore: setup OpenSpec with project context (Next.js 16, FSD, TDD)` ✅ 2026-05-23
- [x] **Проверка:** `npx openspec list` отрабатывает без ошибок (показывает пустой список активных changes - норма для старта) ✅ 2026-05-23

**Заметка про workflow:** для каждой продуктовой фичи (F3+) цикл будет следующий:
1. `/opsx:propose <feature-name>` или `npx openspec propose <feature-name>` - создается папка в `openspec/changes/<name>/` с proposal.md, design.md, tasks.md, дельта-спеками
2. Ревью созданных артефактов (особенно дельта-спек - это контракт фичи)
3. Написание тестов по acceptance criteria из спеки - они **падают красным** (RED)
4. Минимальный код, тесты становятся **зелеными** (GREEN)
5. Рефакторинг при сохранении зеленых тестов
6. `npx openspec archive <feature-name>` - дельты автоматически вливаются в `openspec/specs/`, change уходит в `openspec/changes/archive/`

### F0.3. tooling/test-stack

- [x] Установить Vitest и зависимости: `npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui` ✅ 2026-05-23
- [x] Установить Playwright: `npm install --save-dev --save-exact @playwright/test` + `npx playwright install chromium` (только Chromium, для demo достаточно, экономит ~500MB) ✅ 2026-05-23
- [x] Создать `vitest.config.ts` в корне с настройками: `plugins: [react()]`, `environment: 'jsdom'`, `setupFiles: ['./tests/setup.ts']`, `globals: true`, `include: ['tests/**/*.test.{ts,tsx}']` ✅ 2026-05-23
- [x] Создать `tests/setup.ts` с импортом `@testing-library/jest-dom/vitest` ✅ 2026-05-23
- [x] Создать `playwright.config.ts` в корне: `testDir: './tests/e2e'`, `use: { baseURL: 'http://localhost:3000' }`, `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }`, проекты только `chromium` ✅ 2026-05-23
- [x] Создать структуру папки `tests/` зеркалящей `src/`: `mkdir -p tests/{shared/{ui,lib},entities/master,features/{client-flow,master-view},pages/{home,master},e2e}` ✅ 2026-05-23
- [x] Создать `tests/README.md` объясняющий: тесты живут в отдельной папке, структура зеркалит src/, unit-тесты с расширением `.test.tsx`, e2e в `tests/e2e/` с `.spec.ts` ✅ 2026-05-23
- [x] Добавить в `.gitignore`: `playwright-report/`, `test-results/`, `.playwright/` ✅ 2026-05-23
- [x] Скрипты в `package.json`: `"test": "vitest"`, `"test:run": "vitest run"`, `"test:ui": "vitest --ui"`, `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"` ✅ 2026-05-23
- [x] Smoke-тест для Vitest: `tests/shared/lib/smoke.test.ts` с одним assertion (`expect(1 + 1).toBe(2)`) - проверяет что pipeline работает ✅ 2026-05-23
- [x] Smoke-тест для Playwright: `tests/e2e/smoke.spec.ts` который открывает `/` и проверяет что title содержит "Create Next App" (или что-то из дефолтной страницы) ✅ 2026-05-23
- [x] Запустить `npm run test:run` - smoke-тест проходит ✅ 2026-05-23
- [x] Запустить `npm run test:e2e` - smoke-тест проходит ✅ 2026-05-23
- [x] Коммит: `chore: setup test stack (Vitest + RTL + Playwright)` ✅ 2026-05-23
- [x] **Проверка:** оба smoke-теста проходят, `npm run test:ui` открывает UI Vitest, `npm run test:e2e:ui` открывает UI Playwright ✅ 2026-05-23

### F1. shared/ui (shadcn)

- [ ] `npx shadcn@latest init` с опциями: New York style, neutral base color, CSS variables yes
- [ ] Отредактировать `components.json` — алиасы на `@/shared/ui`, `@/shared/lib/cn`
- [ ] Переместить `cn` утилиту в `src/shared/lib/cn.ts` если CLI положил не туда
- [ ] `npx shadcn@latest add button` — проверить что попало в `src/shared/ui/`
- [ ] `npx shadcn@latest add card` — проверить что попало в `src/shared/ui/`
- [ ] **Проверка:** импорт `import { Button } from '@/shared/ui/button'` работает в любом файле

### F2. shared/styles

- [ ] Подключить Manrope через `next/font/google` в `app/layout.tsx`
- [ ] Применить шрифт глобально через CSS-переменную или класс на body
- [ ] Заменить shadcn-дефолтные CSS-переменные в `src/app/styles/globals.css` на палитру Original
- [ ] Добавить custom переменные `--primary-hover`, `--shadow-card`
- [ ] Открыть `src/shared/ui/button.tsx`, проверить что variant default использует `--primary`
- [ ] При необходимости подправить классы variant (radius, цвета)
- [ ] **Проверка:** на тестовой странице рендерится `<Button>Тест</Button>` с терракотовым фоном и Manrope

### F3. entities/master/types + shared/config

С этого шага включается полный OpenSpec + TDD цикл.

- [ ] Создать `src/entities/master/model/types.ts` со всеми типами из PRD раздел 5
- [ ] Создать `src/entities/master/index.ts` — public API с реэкспортами типов
- [ ] Создать `src/shared/config/master-config.ts` с константой `MASTER`
- [ ] Создать `src/shared/lib/deeplinks.ts` с функциями `getTelegramLink`, `getWhatsAppLink`, `getInstagramLink`
- [ ] Создать `src/shared/lib/dev-log.ts` с функцией `devLog`
- [ ] Положить заглушку фото в `public/master-photo.jpg` (stock или AI-сгенерированное)
- [ ] **Проверка:** `import { MASTER } from '@/shared/config/master-config'` работает, типы подсвечиваются

### F4. app routing + pages stubs

- [ ] Настроить `app/layout.tsx` — Manrope, импорт `globals.css`, базовая HTML-обертка, metadata
- [ ] Создать `src/pages/home/ui/HomePage.tsx` с заглушкой `<div>Welcome page placeholder</div>`
- [ ] Создать `src/pages/home/index.ts` — public API
- [ ] В `app/page.tsx` тонкий реэкспорт: `export { HomePage as default } from '@/pages/home'`
- [ ] Аналогично создать `src/pages/master/` со заглушкой
- [ ] В `app/master/page.tsx` реэкспорт
- [ ] **Проверка:** `/` показывает заглушку Welcome, `/master` показывает Master page

### F5. entities/master/ui — MasterCard

- [ ] Создать `src/entities/master/ui/MasterCard.tsx`
- [ ] Круглое фото 80x80 через `next/image`
- [ ] Имя 18px weight 500
- [ ] Город 14px muted color
- [ ] Принимает props или использует `MASTER` по умолчанию
- [ ] Добавить экспорт в `src/entities/master/index.ts`
- [ ] **Проверка:** вставить `<MasterCard />` на HomePage временно — рендерится круглое фото, имя, город

### F6. features/client-flow/ui — ScreenWelcome (статика)

- [ ] Создать `src/features/client-flow/ui/ScreenWelcome.tsx`
- [ ] Сверстать: контейнер + `MasterCard` + заголовок "Привет 💛 Я Алина, ваш мастер" + описание услуги из `MASTER.service` + две кнопки
- [ ] Кнопка "Интересно" — shadcn Button variant default, полная ширина
- [ ] Кнопка "Пока не интересно" — variant outline, полная ширина
- [ ] Контейнер: max-width 480px на десктопе, padding 24px по бокам на мобильном
- [ ] Заглушки `onClick` — `console.log`
- [ ] Заменить заглушку в HomePage на `<ScreenWelcome />`
- [ ] **Проверка:** на мобильном размере DevTools видишь верный layout, на десктопе центрированный контейнер

### F7. features/client-flow/model — useClientFlow

- [ ] Создать `src/features/client-flow/model/use-client-flow.ts`
- [ ] Реализовать хук с `useState<Step>('welcome')`
- [ ] Функция `goTo(action: 'intent' | 'reject')` с логикой переходов согласно PRD 6.1
- [ ] Экспортировать `useClientFlow` из `src/features/client-flow/index.ts`
- [ ] **Проверка:** в тестовом компоненте хук работает — все переходы между шагами корректны

### F8. features/client-flow/ui — ClientFlow container + animations

- [ ] Создать `src/features/client-flow/ui/ClientFlow.tsx`
- [ ] Использовать `useClientFlow`, рендерить компоненты по `step`
- [ ] Обернуть переходы в `AnimatePresence mode="wait"`
- [ ] Каждый экран обернуть в `motion.div` с анимацией fade+slide из PRD 8.5
- [ ] Передавать `onIntent` и `onReject` в `ScreenWelcome` как props
- [ ] Обновить `ScreenWelcome` — вместо console.log вызывать props
- [ ] Заменить `ScreenWelcome` в `HomePage` на `ClientFlow`
- [ ] Добавить заглушки для остальных шагов: `<div>Next screen: {step}</div>`
- [ ] **Проверка:** нажимаешь "Интересно" — плавно появляется заглушка с надписью "Next screen: notify"

### F9. features/client-flow/ui — ScreenNotify

- [ ] Создать `src/features/client-flow/ui/ScreenNotify.tsx`
- [ ] Сверстать: заголовок "Здорово 🙏" + текст про уведомление + две кнопки
- [ ] Подключить в `ClientFlow` — убрать заглушку для шага 'notify'
- [ ] "Да, напишите" → priority, "Просто посмотрю позже" → closure
- [ ] **Проверка:** пройти welcome → notify, обе кнопки переходят на правильные заглушки

### F10. features/client-flow/ui — ScreenPriority

- [ ] Создать `src/features/client-flow/ui/ScreenPriority.tsx`
- [ ] Сверстать согласно тексту из PRD 6.2
- [ ] Подключить в `ClientFlow`
- [ ] "Да, хочу" → contact, "Пока не уверена" → closure
- [ ] **Проверка:** пройти welcome → notify → priority, переходы корректны

### F11. features/client-flow/ui — ScreenContact + deeplinks

- [ ] Создать `src/features/client-flow/ui/ScreenContact.tsx`
- [ ] Сверстать: заголовок-вопрос + три кнопки мессенджеров + мелкий disclaimer внизу
- [ ] Каждая кнопка использует функцию из `deeplinks.ts` + `MASTER.contacts.*`
- [ ] При клике: открыть ссылку через `window.open(link, '_blank')` + вызвать `onContinue()` → closure
- [ ] **Проверка:** на десктопе клик по Telegram открывает t.me в новой вкладке, потом переходит на closure-заглушку

### F12. features/client-flow/ui — ScreenClosure

- [ ] Создать `src/features/client-flow/ui/ScreenClosure.tsx`
- [ ] Сверстать: благодарность + опциональный шеринг (две кнопки) + дисклеймер про demo
- [ ] Подключить в `ClientFlow`
- [ ] Кнопки шеринга — заглушки на demo (`console.log` достаточно)
- [ ] **Проверка:** пройти полный happy path welcome → notify → priority → contact → closure — корректный финальный экран

### F13. features/client-flow/ui — ScreenClosureEarly

- [ ] Создать `src/features/client-flow/ui/ScreenClosureEarly.tsx`
- [ ] Сверстать: минималистичный экран с текстом "Спасибо, что заглянули 💛"
- [ ] Подключить в `ClientFlow` для шага 'closureEarly'
- [ ] **Проверка:** на Welcome нажать "Пока не интересно" — попасть на ClosureEarly с правильным текстом

### F14. features/master-view/ui — TelegramChat shell

- [ ] Создать `src/features/master-view/ui/TelegramChat.tsx`
- [ ] Шапка: фиксированная сверху, белый фон, граница снизу, "Свои — Алина" + аватар 32x32 круглый
- [ ] Основная область: фон `#EEEDEB`, скролл при переполнении
- [ ] Поле ввода снизу: input disabled, иконка прикрепления слева, плейсхолдер "Сообщение", иконка микрофона справа
- [ ] Подключить в `MasterPage` вместо заглушки
- [ ] **Проверка:** открываешь `/master` — видишь визуально узнаваемый Telegram-чат (пустой)

### F15. features/master-view/model + ui/BotMessage

- [ ] Создать `src/features/master-view/model/messages-config.ts` — массив `BotMessage[]` согласно PRD 7.2
- [ ] Создать `src/features/master-view/ui/BotMessage.tsx`
- [ ] Рендер пузыря: белый фон, скругление, тень, текст, время справа внизу
- [ ] Поддержка переноса строк (\n в тексте → отдельные параграфы)
- [ ] Тип `system`: центрированный разделитель ("─── 12 минут назад ───")
- [ ] Анимация появления через framer-motion из PRD 8.5
- [ ] **Проверка:** рендерить статически 2-3 сообщения — выглядят как Telegram, анимация работает

### F16. features/master-view/ui — sequential rendering

- [ ] Обновить `TelegramChat.tsx`: использовать `messagesConfig`
- [ ] Через `useEffect` + `setTimeout` показывать сообщения по очереди согласно `delayMs`
- [ ] State `visibleCount` для индекса последнего видимого
- [ ] Авто-прокрутка чата вниз при появлении нового (`scrollIntoView`)
- [ ] Cleanup всех таймеров в `useEffect` return
- [ ] **Проверка:** открываешь `/master` — сообщения появляются с правильными задержками, чат прокручивается

### F17. features/master-view/ui — ResponseCounter

- [ ] Создать `src/features/master-view/ui/ResponseCounter.tsx`
- [ ] Layout: три цифры в ряд (14 / 4 / 8) с подписями (ответов / приоритет / уведомлений)
- [ ] Анимация через framer-motion `useMotionValue` + `useTransform`, от 0 до target за 2 секунды
- [ ] Запуск при появлении компонента (`useEffect` на mount)
- [ ] Добавить в `messages-config.ts` сообщение со специальной разметкой для счетчика
- [ ] В `BotMessage` условный рендер — если счетчик, показать `ResponseCounter` вместо обычного пузыря
- [ ] **Проверка:** на нужной секунде в чате появляется блок со счетчиком, числа докручиваются 0 → 14/4/8

### F18. features/master-view/ui — RecommendationCard

- [ ] Создать `src/features/master-view/ui/RecommendationCard.tsx`
- [ ] Сверстать визуально выделенный блок с текстом рекомендации из PRD 7.3
- [ ] Усиленная тень, акцентная граница слева в терракот, иконка sparkles в заголовке
- [ ] Добавить сообщение типа `'recommendation'` в `messages-config.ts`
- [ ] В `BotMessage` обработать тип `'recommendation'` — рендер `RecommendationCard` вместо обычного пузыря
- [ ] **Проверка:** на нужной секунде появляется карточка рекомендации, читаема, выделяется визуально

### F19. qa/final-pass

- [ ] Прочитать все тексты на всех экранах — опечатки, грамматика, единый тон
- [ ] Открыть `/` на iPhone (или DevTools iPhone SE 375x667) — все 6 экранов корректны
- [ ] Открыть `/` на Android — все 6 экранов корректны
- [ ] Открыть `/master` на обоих — сообщения появляются, счетчик работает, карточка читается
- [ ] Проверить deep-link на реальном телефоне — Telegram, WhatsApp, Instagram открываются
- [ ] Прогнать Lighthouse — performance > 80 на mobile
- [ ] Если что-то ломается — исправить в рамках этой фичи
- [ ] Финальный коммит: `feat: demo ready for showing`

---

## 5. Что делать когда стопоришься

**Если фича разрастается за 3+ часа:** скорее всего нарезана неправильно — попробуй разделить ее на две.

**Если непонятно что делать дальше:** вернись в PRD раздел 6.2 или 7.2 — там готовые тексты и логика. Если неоднозначно — решай по принципу "проще = лучше" и двигайся, на F19 поправишь.

**Если что-то не работает после изменения:** проверь что `npm run dev` запускался без ошибок ПЕРЕД изменением. Если все было ок — откатись к последнему коммиту и попробуй меньшим шагом.

**Коммиты:** один минимум на фичу. Если фича крупная (F6, F8, F16) — можно бить на 2-3 коммита. Префиксы: `feat:` для функциональности, `chore:` для инфраструктуры, `style:` для визуала.

---

## 6. Связь с PRD и спеками

**Этот документ:** что и в каком порядке делать.  
**PRD:** что именно должно получиться (тексты, типы, дизайн-токены, поведение).  
**Спеки фич:** детали реализации каждой конкретной фичи + критерии приемки для тестов.

При работе над фичей: открыты план + PRD + спека. План задает контекст, PRD — конкретику, спека — детальное руководство.