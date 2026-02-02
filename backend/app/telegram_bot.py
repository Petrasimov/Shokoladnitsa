import os
from telegram import (
    Bot, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup,
    Update)
from telegram.ext import (
    ApplicationBuilder,
    CallbackQueryHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

# === БД ===
from app.database import SessionLocal
from app.models import Reservation

# === ENV ===
BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

bot = Bot(token=BOT_TOKEN)

# ===============================
# Отправка обычного сообщения
# ===============================
def send_message(text, reply_markup=None):
    bot.send_message(
        chat_id=CHAT_ID,
        text=text,
        reply_markup=reply_markup
    )

# ===============================
# Кнопки для брони
# ===============================
def reservation_buttons(reservation_id: int):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton(
                "✅  Пришёл",
                callback_data=f"came:{reservation_id}"
            ),
            InlineKeyboardButton(
                "❌ Не Пришёл",
                callback_data=f"no:{reservation_id}"
            )
        ]
    ])

# ===============================
# Обработчик кнопок
# ===============================
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    data = query.data
    action, reservation_id = data.split(":")
    reservation_id = int(reservation_id)
    
    db = SessionLocal()
    
    try:
        reservation = db.query(Reservation).get(reservation_id)
        
        if not reservation:
            await query.message.reply_text("❌ Бронь не найдена")
            return
        
        # ===== КНОПКА «НЕ ПРИШЁЛ» =====
        if action == "no":
            reservation.appeared = False
            reservation.check_amout = 0
            db.commit()
            
            await query.message.reply_text(
                f"❌ Гость не пришёл\nБронь ID: {reservation_id}"
            )
            
        # ===== КНОПКА «ПРИШЁЛ» =====
        elif action == "came":
            context.user_data["wait_check"] = reservation_id
            
            await query.message.reply_text(
                "✅ Гость пришёл.\nВведите сумму чека:"
            )
    finally:
        db.close()
        
# ===============================
# Приём суммы чека
# ===============================
async def check_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "wait_check" not in context.userdata:
        return
    
    reservation_id = context.user_data.pop("wait_check")
    
    try:
        check_amout = int(update.message.text)
    except ValueError:
        await update.message.reply_text("Введите число")
        return
    
    db = SessionLocal()
    
    try:
        reservation = db.query(Reservation).get(reservation_id)
        reservation.appeared = True
        reservation.check = check_amout
        db.commit()
        
        await update.message.reply_text(
            f"💰 Чек сохранён: {check_amount}₽\nБронь ID: {reservation_id}"
        )
    finally:
        db.close()



# ===============================
# Запуск бота
# ===============================
def start_bot():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, check_handler)
    )

    print("🤖 Telegram bot started")
    app.run_polling()
    
    
if __name__ == "__main__":
    start_bot()


