# Аккаунты RiffGym на Supabase: план

Статус: черновик плана, код не написан. Решения, помеченные **[решение автора]**, нужно принять до реализации.

## 1. Цели и границы

- Приложение остаётся статическим `index.html` на GitHub Pages, без сборки. Supabase подключается одним скриптом `@supabase/supabase-js` с CDN (точная версия, например `@supabase/supabase-js@2.x.y`), либо прямыми `fetch` к REST/Auth API.
- **Без аккаунта всё работает как сейчас** (локальный режим, `localStorage`). Аккаунт — только для синхронизации между устройствами и (позже) платных функций.
- План дня по-прежнему зависит только от даты (концепция не меняется). В облако уходят только пользовательские настройки и результаты.
- Секреты: в репозиторий кладём только `SUPABASE_URL` и `anon` (publishable) key — они публичны по замыслу, защиту дают RLS-политики. `service_role` (secret) key **никогда** не попадает в репозиторий, в `index.html`, в issues и логи; живёт только в Supabase Dashboard и в секретах Edge Functions.

## 2. Вход

| Способ | Плюсы | Минусы |
|---|---|---|
| Email magic link (OTP) | без паролей, без внешних провайдеров | письмо может уйти в спам; нужен свой SMTP для продакшена (встроенный в Supabase сильно ограничен по числу писем) |
| Google OAuth | один клик | нужен проект в Google Cloud, экран согласия, проверка домена |

Рекомендация: оба. Magic link — базовый, Google — дополнительный. Пароли не используем.

Детали:
- `redirectTo` = `https://survivaldimon.github.io/grif-trainer/` (и кастомный домен, если появится). В Supabase → Auth → URL Configuration добавить его в Site URL и Redirect URLs, плюс `http://localhost:*` для отладки.
- Поток PKCE (`flowType: 'pkce'`), сессия в `localStorage` под ключом самого supabase-js (`sb-<ref>-auth-token`). Это **новый ключ вне префикса `grif.`** — инвариант в CLAUDE.md и тест `localStorage` нужно будет обновить **[решение автора]**, либо задать `storageKey: 'grif.auth'`.
- После возврата по ссылке хэш адреса содержит токены/код — его надо убрать (`history.replaceState`), иначе он сломает разбор адреса (`#bass-en`). Важно: в PKCE в адрес приходит `?code=`, а не хэш — конфликт с нашим хэш-роутингом меньше.
- UI: в панели `#settings` блок «Аккаунт»: «Войти» (email + кнопка Google), после входа — email, «Синхронизировано …», «Выйти», «Удалить аккаунт».
- SMTP: подключить свой (Resend, Postmark, Brevo и т. п.), отправитель вида `no-reply@<домен>` **[решение автора: домен и сервис]**.

## 3. Схема данных

Все таблицы в схеме `public`, ключ — `auth.users.id`.

```sql
-- профиль и настройки (одна строка на пользователя)
create table public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  settings   jsonb not null default '{}'::jsonb,  -- lang, inst, strings, hand, gstrings, tuning, theme, time
  updated_at timestamptz not null default now()
);

-- данные по упражнениям: уровень и темп
create table public.exercise_state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ex_key     text not null,           -- как в grif.lvl / grif.bpmEx: 'B1', 'bass.B1'
  lvl        smallint check (lvl between 1 and 5),
  bpm        smallint check (bpm between 20 and 400),
  updated_at timestamptz not null default now(),
  primary key (user_id, ex_key)
);

-- результаты тестов цикла (история, а не только последнее значение)
create table public.test_results (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  test_id    text not null,          -- T1..T5, BT1..BT5
  day_index  int  not null,
  value      jsonb not null,
  created_at timestamptz not null default now()
);

-- права на платные функции; пишет только сервер (вебхук оплаты)
create table public.entitlements (
  user_id    uuid not null references auth.users(id) on delete cascade,
  feature    text not null,          -- 'tempo_memory', ...
  source     text not null,          -- 'manual', 'paddle', 'kaspi', ...
  valid_until timestamptz,           -- null = бессрочно
  created_at timestamptz not null default now(),
  primary key (user_id, feature)
);
```

Профиль создаётся триггером `on auth.users insert` (функция `security definer`, `search_path = ''`).

### RLS

```sql
alter table public.profiles       enable row level security;
alter table public.exercise_state enable row level security;
alter table public.test_results   enable row level security;
alter table public.entitlements   enable row level security;

-- свои строки: чтение и запись
create policy own_rw on public.profiles       for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_rw on public.exercise_state for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_rw on public.test_results   for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- права: только чтение своих; запись — только service_role (обходит RLS)
create policy own_r on public.entitlements for select to authenticated
  using ((select auth.uid()) = user_id);
```

Роль `anon` не получает ни одной политики — без входа API отдаёт пусто. Проверка: Supabase Security Advisor без предупреждений.

### Платная функция «запоминание темпа»

Клиентской проверке доверять нельзя (код открыт). Поэтому серверная граница:
- колонку `bpm` в `exercise_state` можно писать только при наличии права: отдельная политика/триггер `before insert or update` — если `new.bpm is not null` и нет действующей строки `entitlements(feature='tempo_memory')`, то `new.bpm := old.bpm` (или ошибка);
- локально (без аккаунта) темп в `grif.bpmEx` **[решение автора]**: либо оставить бесплатным локально (платно = синхронизация темпа), либо прятать в UI. Честнее и проще первое: «платно» = хранение и синхронизация в облаке. Локальный режим всё равно не защитить.
- выдача прав: вебхук платёжного провайдера → Edge Function (с `service_role` из секретов) → `upsert` в `entitlements`. Провайдер **[решение автора]**: для ИП в РК — Kaspi/CloudPayments/ioka/Freedom Pay для местных карт; Paddle или Lemon Squeezy как Merchant of Record для иностранцев (они сами платят НДС/VAT ЕС).

## 4. Синхронизация с локальным режимом

Что синхронизируем:

| Ключ `grif.*` | Куда | Примечание |
|---|---|---|
| `lang`, `inst`, `strings`, `hand`, `gstrings`, `tuning`, `theme`, `time` | `profiles.settings` | одним jsonb |
| `lvl` | `exercise_state.lvl` | по `ex_key` |
| `bpmEx` | `exercise_state.bpm` | платная часть |
| `tests` | `test_results` | история |
| `bpm` (метроном) | не синхронизируем | состояние текущей сессии |

Правила:
1. Источник правды для работы — по-прежнему `localStorage`; облако — копия. Приложение не ждёт сети: рисуется из локального, затем подтягивает облако.
2. Каждая запись в `grif.*` помечается временем (`grif.sync` = `{key: ts}`); при синхронизации побеждает более поздняя запись **по каждому полю** (last-write-wins). Для `tests` — объединение без удаления.
3. Первый вход на устройстве с локальными данными: если в облаке пусто — загрузить локальное; если в облаке есть данные — слить по правилу 2 (без диалога). **[решение автора]**: или спрашивать «оставить локальные / взять облачные».
4. Отправка: с задержкой ~2 с после изменения (debounce) и при `visibilitychange=hidden`; ошибки сети молча копятся в очереди `grif.syncQueue` и повторяются.
5. Выход: облачные данные не удаляются, локальные остаются (устройство продолжает работать в локальном режиме).
6. Удаление аккаунта: Edge Function `delete-account` (через `service_role` вызывает `auth.admin.deleteUser`), каскад удаляет все строки. Требование GDPR и закона РК.
7. `localStorage` по-прежнему — каждое обращение в `try/catch`; если хранилище недоступно, синхронизация отключается.

## 5. Изменения в репозитории (при реализации)

- `index.html`: раздел «аккаунт» (клиент, вход, sync), блок в `#settings`, тексты RU/EN (EN без кириллицы), ссылки на Terms/Privacy в подвале и в форме входа (с фразой «Входя, вы принимаете…»).
- `docs/legal/*` → опубликовать как `terms.html`/`privacy.html` или рендерить markdown — GitHub Pages отдаёт `.md` как текст, поэтому нужны HTML-версии.
- `supabase/migrations/0001_init.sql` — схема и RLS из раздела 3 (без секретов).
- `supabase/functions/delete-account`, `supabase/functions/payment-webhook`.
- Тесты: синхронизация с замоканным `fetch` (без реального Supabase), ключи `localStorage`, EN без кириллицы в блоке аккаунта. CLAUDE.md обновить (архитектура, инварианты, ключи).
- Cloudflare Web Analytics: менять не нужно, но упомянуть в политике (уже сделано в черновике).

## 6. Шаги развёртывания

1. Supabase: выбрать регион (Frankfurt `eu-central-1` — проще для GDPR) **[решение автора]**; включить Email (magic link), отключить пароли и регистрацию по паролю.
2. Свой SMTP, шаблоны писем RU/EN, rate limit.
3. Google Cloud: OAuth client (Web), redirect `https://<ref>.supabase.co/auth/v1/callback`, экран согласия со ссылками на Terms/Privacy.
4. URL Configuration: Site URL и Redirect URLs.
5. Применить миграцию (SQL Editor или `supabase db push`), проверить Security Advisor.
6. Задеплоить Edge Functions, секреты через `supabase secrets set` (не в git).
7. Вписать `SUPABASE_URL` и anon key в `index.html`.
8. Подписать DPA Supabase (в Dashboard → Legal), зафиксировать в политике.
9. Опубликовать Terms/Privacy после проверки юристом; только после этого включать вход.
10. Казахстан: проверить требование локализации персональных данных граждан РК (ст. 12 п. 2 Закона «О персональных данных и их защите» — хранение базы на территории РК) и уведомление/регистрацию у уполномоченного органа. **Это может сделать Supabase-в-ЕС недопустимым для пользователей из РК** — вопрос юристу №1.

## 7. Риски

- Локализация данных РК (см. выше).
- Встроенный SMTP Supabase не для продакшена.
- Бесплатный план Supabase ставит проект на паузу после недели без активности.
- Хэш-роутинг + OAuth-редирект: покрыть тестом.
