# Аккаунты (Supabase)

Аккаунт необязателен: без входа всё работает как раньше. Вход только синхронизирует настройки `grif.*` (уровни, темп, строй, жанр, тесты и т. д.) между устройствами. План дня от аккаунта не зависит.

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
