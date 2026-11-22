# RiffGym

**RU** · [EN](#english)

Ежедневная тренировка на электрогитаре, акустике и бас-гитаре — техничный дэт-метал, блюз, джаз, фанк и фингерстайл, — устроенная как программа в тренажёрном зале.

**Открыть:** https://riffgym.app/ · английская версия: https://riffgym.app/#en

## Идея

- **Одна программа для всех.** Тренировка определяется датой: у всех, кто открыл RiffGym в этот день, план одинаковый. Удобно заниматься вместе с друзьями и обсуждать одно и то же.
- **Свои у каждого — время, инструмент и сложность.** Время сессии от 15 минут до 5 часов: при нехватке первыми выпадают блоки с конца плана, музыка, затем поддержка; фокус дня остаётся всегда. Жанр и инструмент выбирают библиотеку упражнений. Уровень сложности (1–5) выбирается прямо на упражнении и план не меняет.
- **Темп у каждого свой.** Программа задаёт не bpm, а протокол: как найти свой чистый темп и что с ним делать на этой неделе.

## Как устроена программа

| | Пн | Вт | Ср | Чт | Пт | Сб | Вс |
|---|---|---|---|---|---|---|---|
| Фокус | Ритм | Арпеджио | Левая рука | Ритм | Арпеджио | Левая рука | Связки |

- **База каждый день** плюс фокус дня, поддержка остальных навыков, связки и музыка (рифф дня, слух, сочинение).
- **Цикл 4 недели:** объём → наращивание → скорость (рывки) → разгрузка с тестами в последнее воскресенье.
- **Каждый цикл** меняется лад, **каждую неделю** — вариант упражнений.
- **42–44 упражнения** на каждую пару «жанр + инструмент»: у всех, кроме разминки, 5 уровней, у всех — табы с воспроизведением.
- **Рифф дня:** одинаковые для всех условия (размер, лад, техника, ограничение) для сочинения.
- **Обязательные паузы** и правила безопасности.

## Возможности

- Экраны: «Сегодня» (цикл, план дня, рифф), «Занятие» (таб крупно, таймер, тренер, метроном), «Упражнения» (библиотека с поиском), «Прогресс», «Профиль».
- Тренер ведёт подходы и отдых: играет пример, считает отсчёт, сам включает метроном с нужным делением и подсказывает темп.
- Метроном: нечётные размеры с акцентами групп, деление доли и свинг, рывки, лестница темпа.
- Гитара на 6, 7 и 8 струн, бас на 4, 5 и 6, любой строй вниз и drop — табы переносятся сами; в части упражнений гитары и акустики — открытые строи (DADGAD, open D, open G…).
- Память темпа и чистого темпа по каждому упражнению, тесты цикла с историей.
- Необязательный аккаунт: синхронизация настроек между устройствами и учёт занятий — минуты по дням цикла, выполнение плана по навыкам, рост чистого темпа, итог занятия с самочувствием и заметкой.
- Русский и английский, светлая и тёмная тема, работает на телефоне.

## Запуск и разработка

Статический сайт без сборки: `index.html`, стили в `css/`, код — обычные скрипты в `js/`. Его можно просто открыть в браузере.

Тесты на Playwright: `npm install`, `npx playwright install chromium`, затем `npm test`. Устройство кода и правила проекта — в [CLAUDE.md](CLAUDE.md), аккаунты и база — в [docs/accounts.md](docs/accounts.md).

Публикация на GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.

## Конфиденциальность

Без входа всё хранится только в браузере. Вход по ссылке в письме или через Google нужен лишь для синхронизации и статистики. Подробно — [privacy.html](privacy.html).

## Безопасность

Боль, жжение или онемение в руке — сразу стоп. Программа не заменяет преподавателя и врача.

## Лицензия

[CC BY-NC 4.0](LICENSE): можно делиться и переделывать с указанием автора, без коммерческого использования.

---

<a id="english"></a>

# RiffGym · daily guitar and bass workout

[RU](#riffgym) · **EN**

A daily workout for electric guitar, acoustic and bass — technical death metal, blues, jazz, funk and fingerstyle — built like a gym program.

**Open:** https://riffgym.app/#en

## The idea

- **One program for everyone.** The workout is set by the date: everyone who opens RiffGym on a given day gets the same plan, so you can train alongside friends.
- **Yours to set: time, instrument and difficulty.** Sessions run from 15 minutes to 5 hours; when time is short, blocks drop from the end of the plan, music first, then maintenance, and the day's focus always stays. Genre and instrument pick the exercise library. A difficulty level (1–5) is chosen right on the exercise and never changes the plan.
- **Tempo is personal.** The program prescribes protocols, not bpm: how to find your clean tempo and what to do with it this week.

## Structure

| | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| Focus | Rhythm | Arpeggios | Left hand | Rhythm | Arpeggios | Left hand | Combos |

- **Base every day**, plus the day's focus, maintenance of the other skills, combos and music (riff of the day, ear training, writing).
- **4-week cycle:** volume → build → speed (bursts) → deload with tests on the last Sunday.
- **Every cycle** brings a new scale, **every week** a new exercise variant.
- **42–44 exercises** for each genre and instrument, all with playable tabs and all but the warm-up with 5 levels.
- **Riff of the day:** the same songwriting conditions for everyone (meter, scale, technique, constraint).
- **Mandatory breaks** and safety rules.

## Features

- Screens: Today (cycle, today's plan, riff), Session (big tab, timer, coach, metronome), Exercises (searchable library), Progress, Profile.
- A coach runs sets and rest: plays an example, counts you in, switches the metronome on with the right subdivision and suggests tempo changes.
- Metronome: odd meters with group accents, subdivisions and swing, bursts, tempo ladder.
- 6-, 7- and 8-string guitar, 4-, 5- and 6-string bass, any down-tuning and drop tunings — tabs are moved for you; some guitar and acoustic exercises use open tunings (DADGAD, open D, open G…).
- Working and clean tempo memory for every exercise, cycle tests with history.
- Optional account: settings sync across devices and practice stats — minutes per day of the cycle, plan completion by skill, clean-tempo growth, and a session summary with how it felt and a note.
- Russian and English, light and dark themes, works on phones.

## Running and developing

A static site with no build step: `index.html`, styles in `css/`, code as plain scripts in `js/`. Open it in any browser.

Playwright tests: `npm install`, `npx playwright install chromium`, then `npm test`. Code layout and project rules are in [CLAUDE.md](CLAUDE.md) (Russian); accounts and the database in [docs/accounts.md](docs/accounts.md).

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.

## Privacy

Without signing in, everything stays in your browser. Signing in by email link or with Google is only for sync and stats. Details: [privacy.html](privacy.html).

## Safety

Pain, burning or numbness in the hand: stop right away. This program is not a substitute for a teacher or a doctor.

## License

[CC BY-NC 4.0](LICENSE): share and adapt with attribution, no commercial use.
