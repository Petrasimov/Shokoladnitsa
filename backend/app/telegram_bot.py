import os
from telegram import (
    Bot,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update
)
from telegram.ext import (
    ApplicationBuilder,
    CallbackQueryHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

from app.database import SessionLocal
from app.models import Reservation

BOT_TOKEN='8586731486:AAFvqsu22ESq4hxVfBJAVxFgJmtvN5gYu6M'

CHAT_ID='-5040090195'

bot = Bot(token=BOT_TOKEN)

async def send_message(text, reply_markup=None):
    await bot.send_message(
        chat_id=CHAT_ID,
        text=text,
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

def reservation_buttons(reservation_id: int):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Пришёл", callback_data=f"came:{reservation_id}"),
            InlineKeyboardButton("❌ Не пришёл", callback_data=f"no:{reservation_id}")
        ]
    ])

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    action, reservation_id = query.data.split(":")
    reservation_id = int(reservation_id)

    db = SessionLocal()
    try:
        reservation = db.get(Reservation, reservation_id)

        if not reservation:
            await query.message.reply_text("❌ Бронь не найдена")
            return

        if action == "no":
            reservation.appeared = False
            reservation.check = 0
            db.commit()

            await query.message.reply_text(
                f"❌ *Гость не пришёл*\n\n🆔 Бронь №{reservation_id}",
                parse_mode="Markdown"
            )

        elif action == "came":
            context.user_data["wait_check"] = reservation_id
            await query.message.reply_text(
                "✅ *Гость пришёл*\n\n💰 Введите сумму чека (₽):",
                parse_mode="Markdown"
            )

    finally:
        db.close()

async def check_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "wait_check" not in context.user_data:
        return

    reservation_id = context.user_data.pop("wait_check")

    try:
        check_amount = int(update.message.text)
    except ValueError:
        await update.message.reply_text(
            "⚠️ Пожалуйста, введите *число* — сумму чека в рублях",
            parse_mode="Markdown"
        )
        context.user_data["wait_check"] = reservation_id  # Возвращаем состояние ожидания
        return

    db = SessionLocal()
    try:
        reservation = db.query(Reservation).get(reservation_id)

        if not reservation:
            await update.message.reply_text("❌ Бронь не найдена")
            return

        reservation.appeared = True
        reservation.check = check_amount
        db.commit()

        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=(
                f"💾 *Чек сохранён*\n\n"
                f"💰 Сумма: {check_amount} ₽\n"
                f"🆔 Бронь №{reservation_id}"
            ),
            parse_mode="Markdown"
        )


    finally:
        db.close()

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
