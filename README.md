# Свои

Инструмент проверки спроса на новые услуги для микробизнеса. Мастер 
проверяет интерес клиентов к новой услуге через мягкую предзапись - 
до вложений в обучение и материалы.

Стартовый сегмент: бьюти-мастера в Казахстане.

## Статус

Demo (concierge MVP подход). Цель - показать механику 3-5 знакомым 
мастерам и собрать обратную связь до полноценной разработки продукта.

## Стек

- Next.js 15 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS v4
- framer-motion
- FSD (feature-sliced design) архитектура
- Vitest + React Testing Library + Playwright
- OpenSpec для spec-driven development

## Документация

- [PRD](./docs/prd/svoi-demo-prd-v0.3.md) - продуктовое описание demo
- [Development plan](./docs/development-plan/svoi-demo-development-plan.md) - нарезка на фичи F0-F19
- [Decisions](./docs/decisions/) - архитектурные решения (ADR-style)

## Запуск

​```bash
npm install
npm run dev
​```

Откроется на http://localhost:3000

- `/` - клиентский опрос
- `/master` - мокап стороны мастера

## Контекст

Проект разрабатывается в рамках курса rsschool по SaaS-разработке 
(альтернативная идея вместо референсного проекта). Архитектура 
выбрана с заделом на эволюцию demo в продакшен-продукт.