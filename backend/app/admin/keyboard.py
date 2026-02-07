from telegram import InlineKeyboardMarkup, InlineKeyboardButton

def admin_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("📤 Выгрузить данные", callback_data="export")
        ],
        [
            InlineKeyboardButton("📊 Статистика", callback_data="stats")
        ]
    ])
    

def stats_menu_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("📈 Брони по дням", callback_data="chart_bookings")
        ],
        [
            InlineKeyboardButton("👥 Гости по дням", callback_data="chart_guests")
        ],
        [
            InlineKeyboardButton("🟢 Пришли / 🔴 Не пришли", callback_data="chart_attendance")
        ],
        [
            InlineKeyboardButton("⏰ Популярное время", callback_data="chart_time")
        ],
        [
            InlineKeyboardButton("⬅️ Назад", callback_data="admin_back")
        ]
    ])