export function validateName(name) {
    if(!name.trim()) return "Введите имя";
    if(name.length < 2) return "Имя слишком короткое";
    if(!/^[a-zA-Zа-яA-ЯёЁ\s-]+$/.test(name)) 
        return "Имя содержит недопустимые символы"; 
    return null;
}

export function validateGuests(guests) {
    const num = Number(guests);

    if (!num) return "Укажите количество гостей";
    if (!Number.isInteger(num)) return "Введите целое число";
    if (num < 1 || num > 20) return "От 1 до 20 гостей";

    return null;
}


export function validatePhone(phone) {
    if(!phone) return "Введите телефон";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 11) return "Введите полный номер телефона";
    return null;
}

export function validateDate(date) {
    if(!date) return "Выберите дату";

    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if(selected < today) return "Дата не может быть в прошлом";
    return null;
}
export function validateTime(time) {
    if (!time) return "Выберите время";
    return null;
}
