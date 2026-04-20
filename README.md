# ☕ Шоколадница — Система бронирования столиков

> **VK Mini App** для онлайн-бронирования столиков в кафе «Шоколадница» (ул. Спасская, 18).
> Работает внутри ВКонтакте — пользователи бронируют стол прямо в любимой соцсети.

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Возможности](#-возможности)
- [Архитектура](#-архитектура)
- [Стек технологий](#-стек-технологий)
- [Структура проекта](#-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Переменные окружения](#-переменные-окружения)
- [Запуск в разработке](#-запуск-в-разработке)
- [Запуск тестов](#-запуск-тестов)
- [API-эндпоинты](#-api-эндпоинты)
- [Нагрузочное тестирование](#-нагрузочное-тестирование)
- [Безопасность](#-безопасность)
- [Юридические документы](#-юридические-документы)
- [Деплой на сервер](#-деплой-на-сервер)
- [Мониторинг](#-мониторинг)

---

## 🎯 О проекте

**Шоколадница** — полноценная система бронирования столиков, реализованная как мини-приложение ВКонтакте. Гость открывает приложение прямо в VK, заполняет форму за 30 секунд, и сразу получает подтверждение. Официанты в кафе мгновенно получают уведомление в общий чат.

### Как это работает для гостя
1. Открывает мини-приложение в VK-сообществе кафе
2. Заполняет форму: имя, телефон, дата, время, количество гостей
3. Принимает условия использования и политику конфиденциальности
4. Нажимает «☕ Забронировать» → видит окно подтверждения
5. Получает уведомление в личные сообщения VK (если разрешил)
6. За час до визита — автоматическое напоминание
7. На следующий день — запрос обратной связи

### Как это работает для кафе
- Все бронирования мгновенно приходят в чат официантов ВКонтакте
- Каждый день в 9:00 — автоматическая сводка броней на сегодня
- При визите гостя — запрос в чат «Пришёл / Не пришёл»
- Администратор получает статистику, графики и CSV-выгрузку через VK-бота

---

## ✨ Возможности

### Для пользователя
- 📅 Выбор даты через удобный VKUI DatePicker
- ⏰ Слоты времени с 08:00 до 20:00, шаг 30 минут (прошедшее время скрыто)
- 📱 Автоформатирование номера телефона: `+7 (XXX) XXX-XX-XX`
- 💬 Комментарий к заказу с счётчиком символов (0/500)
- 🔔 Опциональные уведомления через личные сообщения VK
- ✅ Встроенные юридические документы (читаются прямо в приложении)
- 📋 Окно подтверждения с проверкой данных перед отправкой
- 🎉 Экран успеха с деталями бронирования
- 🌓 Поддержка тёмной и светлой темы VK

### Для бизнеса
- 📊 Уведомления в чат официантов с именем, телефоном, временем и числом гостей
- 📊 Ежедневная сводка броней в 9:00
- ✅ / ❌ Кнопки «Пришёл» / «Не пришёл» прямо в сообщении
- 📈 Статистика через VK-бота (`/stats`)
- 📉 Графики посещаемости и популярных времён
- 📁 Экспорт в CSV (`/export`)
- 🔍 Swagger UI с полной документацией API

### Технические
- ⚡ Async FastAPI + asyncpg — неблокирующая обработка запросов
- 🔄 Retry 5xx на фронтенде (1→2→4 сек, до 3 попыток)
- 🔁 Retry VK API при временных ошибках (коды 1, 6, 9, 10)
- 🛡️ Rate limiting: 3 запроса/мин на IP + 60 глобально
- 🚫 Защита от дублирующих бронирований (phone + date)
- 🐛 React ErrorBoundary с автоматической отправкой ошибок на сервер
- 📊 Prometheus-метрики (RPS, latency p50/p90/p99)
- 🔍 Sentry (Python + JS) — опционально

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│         VK Mini App (браузер)           │
│      React 19 + VKUI 7 + VK Bridge     │
└──────────────────┬──────────────────────┘
                   │ HTTPS /api/*
┌──────────────────▼──────────────────────┐
│                 VPS                     │
│                                         │
│  ┌──────────┐ ┌───────────┐ ┌────────┐  │
│  │ FastAPI  │ │ VK Bot    │ │Schedul-│  │
│  │:8001     │ │Long Poll  │ │er 60s  │  │
│  │(asyncpg) │ │(psycopg2) │ │(psyco- │  │
│  └────┬─────┘ └─────┬─────┘ │pg2)    │  │
│       │             │       └────┬───┘  │
│  ┌────▼─────────────▼────────────▼───┐  │
│  │         PostgreSQL :5432          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
    ┌─────────▼──────────┐
    │      VK API        │
    │ (сообщения гостям  │
    │  и официантам)     │
    └────────────────────┘
```

**3 параллельных процесса** (запускает `backend/start_all.py`):

| Процесс | Файл | БД-драйвер | Назначение |
|---|---|---|---|
| HTTP API | `app/main.py` | asyncpg (async) | Приём броней, метрики, health |
| VK Long Poll | `app/vk_bot_server.py` | psycopg2 (sync) | Входящие сообщения от администратора |
| Scheduler | `app/scheduler.py` | psycopg2 (sync) | Напоминания, подтверждения, сводки |

---

## 🛠️ Стек технологий

### Бэкенд
| Технология | Версия | Роль |
|---|---|---|
| Python | 3.11 | Рантайм |
| FastAPI | 0.128.1 | HTTP-фреймворк |
| Uvicorn | 0.40.0 | ASGI-сервер |
| SQLAlchemy | 2.0.46 | ORM (async + sync) |
| asyncpg | 0.31.0 | Async PostgreSQL драйвер |
| psycopg2-binary | 2.9.11 | Sync PostgreSQL драйвер |
| Pydantic | 2.12.5 | Валидация данных |
| httpx | 0.25.2 | VK API клиент |
| Alembic | 1.16.1 | Миграции БД |
| Sentry SDK | 2.54.0 | Мониторинг ошибок (опц.) |
| prometheus-fastapi-instrumentator | 7.1.0 | Prometheus-метрики |
| matplotlib | 3.10.0 | Графики для администратора |

### Фронтенд
| Технология | Версия | Роль |
|---|---|---|
| React | 19 | UI |
| VKUI | 7 | Дизайн-система VK |
| VK Bridge | latest | Интеграция с платформой VK |
| Vite | 7 | Сборщик |
| @sentry/react | latest | Мониторинг ошибок (опц.) |

---

## 📁 Структура проекта

```
Shokoladnitsa/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI: эндпоинты, middleware, rate limit
│   │   ├── models.py            # SQLAlchemy модели (Reservation, ScheduledTask, ...)
│   │   ├── schemas.py           # Pydantic схемы
│   │   ├── database.py          # Два engine: asyncpg (FastAPI) + psycopg2 (bot/scheduler)
│   │   ├── vk_bot.py            # Построение VK-сообщений
│   │   ├── vk_bot_server.py     # VK Long Poll — входящие сообщения
│   │   ├── scheduler.py         # Фоновые задачи: напоминания, сводки
│   │   └── admin/
│   │       ├── stats.py         # Статистика броней
│   │       ├── charts.py        # Графики matplotlib
│   │       ├── export.py        # Экспорт CSV
│   │       └── keyboard.py      # VK inline-клавиатуры
│   ├── migrations/              # Alembic-миграции
│   ├── tests/
│   │   ├── conftest.py          # Фикстуры: async SQLite override
│   │   ├── test_api.py          # 11 тестов API-эндпоинтов
│   │   ├── test_models.py       # 6 тестов ORM-моделей
│   │   ├── test_schemas.py      # 13 тестов Pydantic-схем
│   │   ├── test_performance.py  # Benchmark-тесты
│   │   └── test_load_simulation.py  # p50/p90/p99 + рекомендация сервера
│   ├── locustfile.py            # Locust: нагрузочное тестирование
│   ├── start_all.py             # Запуск всех 3 процессов
│   ├── requirements.txt
│   └── alembic.ini
│
├── vk-table-booking/
│   ├── src/
│   │   ├── App.jsx              # Корень: модалки, retry, submit логика
│   │   ├── main.jsx             # Точка входа: Sentry, ErrorBoundary, VK Bridge init
│   │   ├── index.css            # VKUI-переопределения, анимации
│   │   ├── pages/
│   │   │   └── Home.jsx         # Страница с формой
│   │   ├── components/
│   │   │   ├── BookingForm.jsx  # Форма бронирования
│   │   │   └── ErrorBoundary.jsx # React ErrorBoundary
│   │   └── utils/
│   │       ├── validators.js    # Клиентская валидация полей
│   │       └── legalTexts.js    # Тексты юридических документов
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── docs/
    ├── SERVER_SPEC.md           # Характеристики, потребление, рекомендации сервера
    └── legal/
        ├── privacy_policy.txt       # Политика конфиденциальности
        ├── user_agreement.txt       # Пользовательское соглашение
        ├── personal_data_consent.txt # Согласие на обработку ПД
        └── terms_of_use.txt         # Условия использования
```

---

## 🚀 Быстрый старт

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Клонировать репозиторий
```bash
git clone https://github.com/Petrasimov/Shokoladnitsa.git
cd Shokoladnitsa
```

### 2. Настроить бэкенд
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Настроить переменные окружения
```bash
cp .env.example .env
# Откройте .env и заполните значения (см. раздел ниже)
```

### 4. Применить миграции БД
```bash
alembic upgrade head
```

### 5. Настроить фронтенд
```bash
cd ../vk-table-booking
npm install
cp .env.example .env
# Укажите VITE_VK_GROUP_ID
```

---

## ⚙️ Переменные окружения

### `backend/.env`
```env
# База данных
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservation

# VK API (получить в настройках сообщества VK)
VK_COMMUNITY_TOKEN=vk1.a.xxxxxxxx
VK_GROUP_ID=234068981
VK_ADMIN_ID=555350645          # VK ID администратора
VK_WAITERS_CHAT_ID=2000000001  # ID чата официантов

# Кафе
CAFE_ADDRESS=ул.Спасская 18

# Опционально
SENTRY_DSN=https://xxxx@sentry.io/xxxx
APP_ENV=production
```

### `vk-table-booking/.env`
```env
VITE_VK_GROUP_ID=234068981

# Опционально
VITE_SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

---

## 💻 Запуск в разработке

### Бэкенд — все сервисы (API + VK бот + планировщик)
```bash
cd backend
python start_all.py
```

### Бэкенд — только API (без бота и планировщика)
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8001
```

### Фронтенд
```bash
cd vk-table-booking
npm run dev          # Vite dev server на порту 5173
```

### Тоннели для тестирования в VK Mini App

| Команда | Тоннель | Особенности |
|---|---|---|
| `npm run dev:tunnel` | ngrok | Только браузер (WebView даёт interstitial) |
| `npm run dev:tunnel:cf` | Cloudflare | Стабильный URL |
| `npm run dev:tunnel:lt` | localtunnel | Рекомендован для мобильных (без interstitial) |

> ⚠️ Для тестирования на **мобильном** используйте `dev:tunnel:lt` —
> ngrok показывает interstitial-страницу в WebView VK, блокирующую VK Bridge.

---

## 🧪 Запуск тестов

### Все тесты (30 тестов, ~3 сек)
```bash
cd backend
pytest tests/ -v
```

### По категориям
```bash
pytest tests/test_api.py -v        # 11 тестов API
pytest tests/test_models.py -v     # 6 тестов ORM-моделей
pytest tests/test_schemas.py -v    # 13 тестов валидации Pydantic
```

### Что тестируется
- Создание бронирования (валидные и невалидные данные)
- Rate limiting (превышение лимита → 429)
- Защита от дублей (одинаковые phone + date → 409)
- Валидация полей (имя, телефон, дата, время, гости)
- ORM-модели (Reservation, ScheduledTask, ErrorLog, RateLimitEntry)
- Pydantic-схемы (конвертация типов, edge cases)

> Тесты используют **SQLite in-memory** — PostgreSQL не требуется.

---

## 📡 API-эндпоинты

| Метод | URL | Описание |
|---|---|---|
| `POST` | `/api/reservation` | Создать бронирование |
| `POST` | `/api/error-report` | Отчёт об ошибке с фронтенда |
| `GET` | `/api/health` | Статус сервиса + БД + pending tasks |
| `GET` | `/api/metrics` | JSON-метрики (брони, ошибки, аптайм) |
| `GET` | `/api/metrics/prometheus` | Prometheus scrape (RPS, latency) |
| `GET` | `/api/docs` | Swagger UI (интерактивная документация) |
| `GET` | `/api/redoc` | ReDoc документация |

### Пример запроса `POST /api/reservation`
```json
{
  "name": "Иван Иванов",
  "phone": "9001234567",
  "date": "2026-03-20",
  "time": "19:00",
  "guests": 2,
  "comment": "У окна",
  "vk_user_id": 123456789,
  "vk_notifications": true
}
```

### Коды ответов
| Код | Ситуация |
|---|---|
| `200` | Бронирование создано |
| `409` | Уже есть бронь на этот телефон + дату |
| `422` | Невалидные данные (Pydantic) |
| `429` | Превышен rate limit |
| `500` | Внутренняя ошибка сервера |

---

## 📊 Нагрузочное тестирование

### Быстрый отчёт с рекомендацией сервера
```bash
# Запустить бэкенд, затем:
cd backend
python tests/test_load_simulation.py
```
Выдаёт: p50, p90, p99 латентность, RPS, RAM, конкретную рекомендацию по серверу.

### Locust (веб-интерфейс на :8089)
```bash
pip install locust
locust -f locustfile.py --host http://localhost:8001
```

### Locust headless (50 пользователей, 60 сек)
```bash
locust -f locustfile.py --host http://localhost:8001 --headless -u 50 -r 10 --run-time 60s
```

Подробные характеристики и рекомендации по серверу — в [docs/SERVER_SPEC.md](docs/SERVER_SPEC.md).

---

## 🛡️ Безопасность

### HTTP-заголовки (все `/api/*` маршруты)
```
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Защита от атак
| Угроза | Механизм защиты |
|---|---|
| Брутфорс / спам | Rate limit: 3 req/мин на IP (PostgreSQL) + 60 глобально (in-memory) |
| SQL-инъекции | SQLAlchemy ORM с параметризованными запросами |
| XSS | Content-Security-Policy, `X-XSS-Protection` |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` |
| Большие тела запросов | Лимит 64 KB (BodySizeLimitMiddleware) |
| Дублирующие брони | Проверка phone + date → HTTP 409 |
| MITM | TLS/HTTPS (Nginx + Let's Encrypt) |

### CORS (разрешённые источники)
```
http://localhost:5173
https://localhost:5173
*.ngrok-free.dev  *.loca.lt  *.trycloudflare.com  *.devtunnels.ms
```

---

## 📜 Юридические документы

Все документы встроены прямо в приложение — пользователь читает их в модальном окне перед бронированием.

| Документ | Файл |
|---|---|
| Политика конфиденциальности (ФЗ-152) | [docs/legal/privacy_policy.txt](docs/legal/privacy_policy.txt) |
| Пользовательское соглашение (публичная оферта) | [docs/legal/user_agreement.txt](docs/legal/user_agreement.txt) |
| Согласие на обработку персональных данных | [docs/legal/personal_data_consent.txt](docs/legal/personal_data_consent.txt) |
| Условия использования | [docs/legal/terms_of_use.txt](docs/legal/terms_of_use.txt) |

Пользователь должен принять **два чекбокса** перед отправкой формы:
1. ☐ Я принимаю [условия использования], [политику конфиденциальности] и [публичную оферту]
2. ☐ Я даю согласие на [обработку моих персональных данных]

---

## 🚢 Деплой на сервер

### Минимальные требования сервера
```
CPU:  1–2 vCPU
RAM:  1 GB (рекомендуется 2 GB)
SSD:  10–20 GB
ОС:   Ubuntu 22.04 LTS
```

### Схема деплоя
```
Internet → Nginx (443, SSL) → uvicorn :8001
                            → dist/ (статика фронтенда)
```

### Шаги деплоя
```bash
# 1. Установить зависимости
sudo apt install python3.11 python3.11-venv postgresql nginx certbot

# 2. Настроить PostgreSQL
sudo -u postgres createdb reservation
sudo -u postgres createuser shokoladnitsa

# 3. Клонировать и настроить проект
git clone https://github.com/Petrasimov/Shokoladnitsa.git
cd Shokoladnitsa/backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && nano .env
alembic upgrade head

# 4. Собрать фронтенд
cd ../vk-table-booking
npm install && npm run build
# dist/ → скопировать в /var/www/shokoladnitsa/

# 5. Настроить Nginx + SSL
certbot --nginx -d yourdomain.ru

# 6. Запустить как systemd-сервис
sudo systemctl enable shokoladnitsa
sudo systemctl start shokoladnitsa
```

### Nginx конфиг (пример)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.ru;

    root /var/www/shokoladnitsa;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📈 Мониторинг

### Health check
```bash
curl http://localhost:8001/api/health
# {"status": "ok", "db": true, "pending_tasks": 3, "uptime_seconds": 3600}
```

### JSON-метрики
```bash
curl http://localhost:8001/api/metrics
# {"reservations_total": 42, "reservations_today": 5, "came": 38, ...}
```

### Prometheus
```bash
curl http://localhost:8001/api/metrics/prometheus
# HELP http_requests_total Total HTTP requests
# ...
```

### Swagger UI
Откройте в браузере: `http://localhost:8001/api/docs`

---

## 🤖 Команды VK-бота (для администратора)

Администратор пишет боту в личные сообщения:

| Команда | Действие |
|---|---|
| `/stats` | Статистика броней (всего, пришли, не пришли) |
| `/export` | CSV-файл со всеми бронированиями |
| `/charts` | Графики: брони по дням, популярные времена |
| `/errors` | Последние технические ошибки |

Официанты получают в чат:
- 📋 Новое бронирование (мгновенно)
- ☕ Ежедневная сводка в 9:00
- Кнопки **✅ Пришёл** / **❌ Не пришёл** в момент визита

---

## 📋 VK Mini App — особенности платформы

> **Важно:** Приложение работает **только внутри ВКонтакте** (iframe/WebView).
> Открытие по прямой ссылке — нормальное поведение для разработки.

- **CSP meta-тег** в `index.html` **запрещён** — VK управляет iframe CSP сам
- **`allowedHosts: true`** (boolean) в `vite.config.js` — для тоннелей (Vite 7)
- **VK Bridge** инициализируется в `main.jsx` — читает VK user ID и цветовую схему
- **`vk_color_scheme`** в URL → тёмная/светлая тема (`space_gray` / `bright_light`)

---

## 🗂️ Дополнительная документация

| Файл | Описание |
|---|---|
| [docs/SERVER_SPEC.md](docs/SERVER_SPEC.md) | Детальные характеристики, потребление RAM, выбор сервера |
| [CLAUDE.md](CLAUDE.md) | Инструкции для AI-ассистентов (правила, архитектурные решения) |
| [VK_BOT_SETUP.md](VK_BOT_SETUP.md) | Настройка VK-бота и токенов |

---

## 📄 Лицензия

© 2026 Кафе «Шоколадница». Все права защищены.
Проект создан для внутреннего использования кафе «Шоколадница», ул. Спасская, 18.

---

<div align="center">
  Сделано с ☕ и 🍰 для кафе «Шоколадница»
</div>
