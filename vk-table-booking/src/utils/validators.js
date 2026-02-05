export function validateName(name) {
    if(!name.trim()) return "Введите имя";
    if(name.length < 2) return "Имя слишком короткое";
    if(!/^[a-zA-Zа-яA-ЯёЁ\s-]+$/.test(name)) 
        return "Имя содержит недопустимые символы"; 
    return null;
}

export function validateGuests(guests){
    if(!guests) return "Укажите количество гостей";
    if(Number.isInteger(+guests)) return "Введите число";
    if (+guests < 1 || +guests > 20) return "От 1 до 20 гостей";
    return null;
}

export function validatePhone(phone) {
    if(!phone) return "Введите телефон";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) return "Неверный номер телефона";
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
    if(!time) return "Выберите время";
    if(date) {
        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        if (selectedDateTime < now)
            return "Время не может быть в прошлом";
    }
    
    return null;
}
