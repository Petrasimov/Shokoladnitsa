# Быстрые команды для разработки

## 🚀 Запуск проекта

### Frontend
```bash
# Установка зависимостей
cd vk-table-booking && npm install

# Запуск dev сервера (обычно http://localhost:5173)
cd vk-table-booking && npm run dev

# Production build
cd vk-table-booking && npm run build
```

### Backend
```bash
# Создание виртуального окружения (если нет)
cd backend && python -m venv venv

# Активация venv
# Windows:
cd backend && venv\Scripts\activate
# Linux/Mac:
cd backend && source venv/bin/activate

# Установка зависимостей
cd backend && pip install -r requirements.txt

# Запуск FastAPI сервера
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔍 Линтинг и проверки

### Frontend
```bash
# ESLint проверка
cd vk-table-booking && npm run lint

# ESLint автофикс
cd vk-table-booking && npm run lint -- --fix
```

### Backend
```bash
# Flake8 (если установлен)
cd backend && flake8 app/

# Black форматирование (если установлен)
cd backend && black app/
```

## 📊 База данных

### Создание миграций (если используется Alembic)
```bash
cd backend && alembic revision --autogenerate -m "description"
cd backend && alembic upgrade head
```

### Прямое подключение к PostgreSQL
```bash
psql -U username -d database_name
```

## 🔧 Git Workflow

### Создание новой фичи
```bash
git checkout -b feature/название-фичи
# ... работа над кодом ...
git add .
git commit -m "feat: описание изменений"
git push -u origin feature/название-фичи
```

### Обновление из main
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

### Создание Pull Request
```bash
gh pr create --title "Название PR" --body "Описание изменений"
```

## 🧪 Тестирование

### Frontend (если есть тесты)
```bash
cd vk-table-booking && npm test
```

### Backend (если есть pytest)
```bash
cd backend && pytest
cd backend && pytest --cov=app tests/
```

## 📦 Управление зависимостями

### Frontend
```bash
# Добавить пакет
cd vk-table-booking && npm install package-name

# Обновить зависимости
cd vk-table-booking && npm update
```

### Backend
```bash
# Установить пакет
cd backend && pip install package-name

# Обновить requirements.txt
cd backend && pip freeze > requirements.txt
```

## 🐛 Отладка

### Проверка портов
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :8000
lsof -i :5173
```

### Логи
```bash
# Backend логи (если используется uvicorn)
cd backend && uvicorn app.main:app --reload --log-level debug

# Telegram bot логи
# Проверить в backend/app/telegram_bot.py
```

## 🔄 Очистка

### Frontend
```bash
cd vk-table-booking && rm -rf node_modules dist && npm install
```

### Backend
```bash
cd backend && find . -type d -name __pycache__ -exec rm -r {} +
cd backend && rm -rf venv && python -m venv venv
```

## 📝 Полезные алиасы

Можно добавить в `.bashrc` или `.zshrc`:

```bash
# Frontend
alias vk-dev="cd ~/Documents/GitHub/Shokoladnitsa/vk-table-booking && npm run dev"
alias vk-build="cd ~/Documents/GitHub/Shokoladnitsa/vk-table-booking && npm run build"

# Backend
alias api-start="cd ~/Documents/GitHub/Shokoladnitsa/backend && source venv/bin/activate && uvicorn app.main:app --reload"
alias api-shell="cd ~/Documents/GitHub/Shokoladnitsa/backend && source venv/bin/activate"
```
