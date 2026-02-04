#!/bin/bash
# Claude Code Hooks
# Автоматические проверки и действия

# Hook: Before Commit
# Выполняется перед созданием коммита
pre_commit() {
    echo "🔍 Проверка кода перед коммитом..."

    # Проверка frontend
    if [ -d "vk-table-booking" ]; then
        echo "📦 Проверка Frontend..."
        cd vk-table-booking
        npm run lint 2>&1 | head -20
        cd ..
    fi

    # Проверка backend
    if [ -d "backend" ]; then
        echo "🐍 Проверка Backend..."
        # Можно добавить flake8 или black
    fi
}

# Hook: After Read File
# Выполняется после чтения файла
post_read() {
    local file=$1

    # Предупреждение при чтении чувствительных файлов
    if [[ $file == *.env* ]] || [[ $file == *credentials* ]]; then
        echo "⚠️  Внимание: Чтение конфиденциального файла!"
    fi
}

# Hook: Before Push
# Выполняется перед push в remote
pre_push() {
    echo "🚀 Подготовка к push..."

    # Проверка, что мы не пушим в main напрямую
    current_branch=$(git branch --show-current)
    if [ "$current_branch" = "main" ]; then
        echo "❌ Прямой push в main не рекомендуется. Используйте PR!"
        return 1
    fi

    echo "✅ Push разрешен для ветки: $current_branch"
}

# Вызов функций (раскомментировать при необходимости)
# pre_commit
# post_read "$@"
# pre_push
