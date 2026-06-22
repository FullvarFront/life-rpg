# Life RPG

Веб-приложение, отображающее жизнь как RPG-игру: пользователь вводит действие, AI (Groq) оценивает его сложность и начисляет опыт (XP), прогресс привязан к аккаунту.

## Стек
Next.js (App Router) + TypeScript (strict) + Tailwind CSS · БД и авторизация: Supabase (Postgres) · AI: Groq (бесплатный tier, модели Llama).

## Статус (MVP 2.0)
- [x] Каркас проекта (Next.js, TS strict, Tailwind, ESLint)
- [x] Игровая логика: диапазоны XP, `clampXp`, уровни (+ тесты Vitest)
- [x] AI-оценщик через Groq с фильтром бессмысленных/негативных действий
- [x] UI: форма ввода, XP-шкала, история действий
- [x] Авторизация по email+паролю (Supabase, `@supabase/ssr`)
- [x] База данных: таблицы `players`/`actions` с RLS, перенос XP и истории в БД
- [ ] Дальше: профиль/статистика, достижения, оформление

## Запуск
```bash
npm install
npm run dev      # http://localhost:3000
```
Нужны переменные окружения (см. `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GROQ_API_KEY`. Реальные значения — в `.env.local` (не коммитится). SQL-схема БД — в [`supabase/schema.sql`](supabase/schema.sql).

## Команды
- `npm run dev` — разработка
- `npm run build` — сборка
- `npm run lint` — линтер
- `npm test` — юнит-тесты игровой логики
- `npm run test:ai` — массовый прогон AI-оценки по `/api/evaluate` (нужен запущенный `npm run dev`)
