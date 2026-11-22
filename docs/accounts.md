# Аккаунты (Supabase)

Аккаунт необязателен: без входа всё работает как раньше. Вход синхронизирует настройки `grif.*` (уровни, темп, строй, жанр, тесты и т. д.) между устройствами и включает учёт занятий для экрана «Прогресс». План дня от аккаунта не зависит.

## Текущий проект
`riffgym`, ref `ixispdikcquoinknyoxh`, eu-central-1. Схема выполнена, Site URL и Redirect URLs заданы, вход по почте включён. Письма входа идут через Resend SMTP от `RiffGym <no-reply@riffgym.app>`, лимит 60 писем в час. `support@riffgym.app` пересылается Cloudflare Email Routing. Google — в процессе (шаг 4). Политика и условия — `privacy.html`, `terms.html`.

## Настройка
1. В панели Supabase создать проект (регион поближе к пользователям).
2. SQL Editor → выполнить `docs/supabase.sql`.
3. Authentication → URL Configuration: Site URL `https://riffgym.app`, Redirect URLs `https://riffgym.app/` (и `http://localhost:*` для отладки).
4. Authentication → Providers: Email (magic link) включён по умолчанию; Google — Client ID/Secret из Google Cloud Console, redirect `https://<ref>.supabase.co/auth/v1/callback`.
5. Settings → API: скопировать Project URL и **anon / publishable** key в `window.RIFFGYM_SUPABASE` в `index.html`. Этот ключ публичный, данные защищает RLS.
   Никогда не класть в код `service_role` и личные токены `sbp_…`.

## Как работает
- `lsSet` пишет `grif.sync` — время последнего изменения и шлёт событие `grif:ls`.
- При входе: если в облаке запись новее локальной — она применяется и страница перезагружается; иначе локальные настройки отправляются в облако.
- Дальше каждое изменение отправляется через 2 с.
- Supabase-клиент (`@supabase/supabase-js` с jsDelivr) грузится только если заданы url и key; сессию он хранит в своём ключе `sb-…` localStorage.

## Учёт занятий и «Прогресс» (этапы 5–6 редизайна, 2026-11-22)
- Таблицы `practice_log` (сегмент плана: день, жанр, инструмент, упражнение, группа, уровень, вариант, план и сыграно в секундах, bpm, `plan_min`, `clean_bpm`) и `practice_sessions` (итог: самочувствие 1–5, заметка). RLS: только свои строки (select, insert, delete). Схема — `docs/supabase.sql`.
- Пишет только вошедший пользователь: `js/practice.js` кладёт записи в очередь `grif.logq`, блок «Аккаунт» в `index.html` отправляет её (`sendLog`: после входа, по событию `grif:log`, при `online`); `upsert` по `user_id, client_id` не дублирует повтор.
- Экран «Прогресс» (`js/progress.js`) читает журнал через `__grifStore.fetchLog(from)` — текущий и прошлый цикл, по 1000 строк — и добавляет неотправленную очередь.
- Удаление аккаунта (`on delete cascade`) удаляет и журнал. Политика — `privacy.html`.
