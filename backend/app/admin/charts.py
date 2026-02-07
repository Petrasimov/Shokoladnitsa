import matplotlib.pyplot as plt
from app.admin.stats import bookings_per_day, guests_per_day, came_vs_no_show, popular_times

def bookings_chart():
    data = bookings_per_day()

    dates = [d.strftime("%d.%m") for d, _ in data]
    counts = [c for _, c in data]
    
    plt.figure(figsize=(10, 5))
    plt.plot(dates, counts, marker="o")
    plt.title("Количество бронирований по дням")
    plt.xlabel("Дата")
    plt.ylabel("Бронирования")
    plt.grid(True)
    
    path = "bookings_chart.png"
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    
    return path

def chart_guests_per_day():
    from datetime import date
    data = guests_per_day(date.today().year, date.today().month)

    plt.figure(figsize=(10, 5))
    plt.plot(data["dates"], data["guests"], marker="o")

    plt.title("Количество гостей по дням")
    plt.xlabel("Дата")
    plt.ylabel("Гостей")
    plt.grid(True)

    path = "guests_per_day.png"

    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path

def chart_came_vs_no_show():
    data = came_vs_no_show()
    labels = ["Пришли", "Не пришли"]
    values = [data["came"], data["no_show"]]

    plt.figure(figsize=(6, 6))
    plt.pie(values, labels=labels, autopct="%1.1f%%", startangle=90)
    plt.title("Посещаемость")

    path = "attendance.png"

    plt.savefig(path)
    plt.close()

    return path

def chart_popular_time():
    data = popular_times()

    # Конвертируем time объекты в строки для отображения на графике
    time_labels = [t.strftime("%H:%M") for t in data["time"]]

    plt.figure(figsize=(10, 5))
    plt.bar(time_labels, data["count"])

    plt.title("Популярное время бронирований")
    plt.xlabel("Время")
    plt.ylabel("Количество броней")
    plt.xticks(rotation=45)
    plt.grid(axis="y")

    path = "popular_times.png"

    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path