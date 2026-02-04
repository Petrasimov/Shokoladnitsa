# Shokoladnitsa - Система бронирования столиков

## Описание проекта
VK Mini App для бронирования столиков в сети кафе "Шоколадница" с интеграцией Telegram бота.

## Архитектура

### Frontend (vk-table-booking/)
- **Фреймворк**: React 19
- **UI библиотека**: VKUI 7.11
- **Интеграция**: VK Bridge 2.15
- **Сборщик**: Vite 7
- **Линтер**: ESLint 9

### Backend (backend/)
- **Фреймворк**: FastAPI 0.128
- **База данных**: PostgreSQL (psycopg2-binary)
- **ORM**: SQLAlchemy 2.0
- **Валидация**: Pydantic 2.12
- **Сервер**: Uvicorn
- **Интеграция**: Telegram Bot

## Структура проекта

```
Shokoladnitsa/
├── vk-table-booking/          # Frontend VK Mini App
│   ├── src/                   # Исходный код React
│   ├── public/                # Статические файлы
│   ├── package.json           # Зависимости npm
│   ├── vite.config.js         # Конфигурация Vite
│   └── eslint.config.js       # Конфигурация ESLint
│
├── backend/                   # Backend API
│   ├── app/
│   │   ├── main.py           # Точка входа FastAPI
│   │   ├── database.py       # Настройка БД
│   │   ├── models.py         # SQLAlchemy модели
│   │   ├── schemas.py        # Pydantic схемы
│   │   └── telegram_bot.py   # Telegram Bot интеграция
│   ├── requirements.txt      # Python зависимости
│   └── venv/                 # Виртуальное окружение
│
└── .claude/                   # Конфигурация Claude Code
```

## Текущая разработка

**Ветка**: `TG-Integration`
**Основная ветка**: `main`

Ведется работа над интеграцией Telegram бота с системой бронирования.

## Важные паттерны и соглашения

### Backend
- Используется async/await для асинхронных операций
- Pydantic схемы для валидации данных API
- SQLAlchemy модели для работы с БД
- FastAPI роутеры для организации эндпоинтов

### Frontend
- Компоненты VKUI для UI
- VK Bridge для работы с VK API
- React hooks для управления состоянием

## Команды разработки

### Frontend
```bash
cd vk-table-booking
npm run dev      # Запуск dev сервера
npm run build    # Сборка продакшн версии
npm run lint     # Проверка кода
```

### Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload  # Запуск FastAPI сервера
```

## База данных
- PostgreSQL
- Подключение настроено в `backend/app/database.py`
- Модели в `backend/app/models.py`

## API
- REST API на FastAPI
- Документация: `/docs` (Swagger)
- Схемы валидации в `backend/app/schemas.py`
