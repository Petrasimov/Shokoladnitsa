import { useState } from 'react';
import {
    Checkbox,
    Div,
    FormItem,
    Input,
    Button,
    Textarea,
    Select,
    FormLayoutGroup,
} from '@vkontakte/vkui'
import {
    validateName,
    validateGuests,
    validatePhone,
    validateDate,
    validateTime
} from '../utils/validators'

const TIME_OPTIONS = (() => {
    const options = [];
    for (let h = 8; h <= 20; h++) {
        for (let m = 0; m < 60; m += 30) {
            const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            options.push({ label: value, value });
        }
    }
    return options;
})();

const formatPhone = (digits) => {
    if (digits.length === 0) return '+7';
    if (digits.length < 3) return `+7 (${digits}`;
    if (digits.length === 3) return `+7 (${digits})`;
    if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
};

const INITIAL_FORM = {
    name: '',
    guests: 1,
    phone: '',
    date: '',
    time: '',
    comment: ''
};

const INITIAL_AGREEMENTS = {
    personal: false,
    rules: false,
    notifications: false
};

function BookingForm({ onSuccess, onError }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});

    const [commentPlaceholder] = useState(() => {
        const variants = [
            "У окна",
            "В уголочке",
            "На диване",
            "Не возле входа",
            "У розетки",
        ];
        return variants[Math.floor(Math.random() * variants.length)];
    });

    const [agreements, setAgreements] = useState(INITIAL_AGREEMENTS);

    const validateFormData = () => {
        const newErrors = {
            name: validateName(form.name),
            guests: validateGuests(form.guests),
            phone: validatePhone(form.phone),
            date: validateDate(form.date),
            time: validateTime(form.time)
        }

        Object.keys(newErrors).forEach(
            key => newErrors[key] === null && delete newErrors[key]
        )

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    };

    const setToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setForm({...form, date: today});
    };

    const setTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const tomorrow = d.toISOString().split('T')[0];
        setForm({...form, date: tomorrow});
    };

    const handleChange = (field) => (e) => {
        setForm({...form, [field]: e.target.value});
        if(errors[field]) {
            setErrors({...errors, [field]: null});
        }
    };

    const handlePhoneChange = (e) => {
        const allDigits = e.target.value.replace(/\D/g, '');
        let cleaned = allDigits;
        if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
            cleaned = cleaned.slice(1);
        }
        cleaned = cleaned.slice(0, 10);
        const formatted = cleaned.length > 0 ? formatPhone(cleaned) : '';
        setForm({...form, phone: formatted});
        if (errors.phone) {
            setErrors({...errors, phone: null});
        }
    };

    const canSubmit =
        agreements.personal &&
        agreements.rules &&
        agreements.notifications;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        if(!validateFormData()) return;

        try {
            const response = await fetch('http://127.0.0.1:8001/api/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    phone: form.phone.replace(/\D/g, '')
                })
            })

            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }

            const data = await response.json();

            onSuccess(data);

            setForm(INITIAL_FORM);
            setErrors({});
            setAgreements(INITIAL_AGREEMENTS);

        } catch (error) {
            console.error('Ошибка отправки', error);
            onError('Не удалось отправить бронь. Попробуйте ещё раз.');
        }
    };

    return (
        <>
            <FormLayoutGroup mode="horizontal">
                <FormItem
                    top="Имя"
                    status={errors.name ? 'error' : 'default'}
                    bottom={errors.name}
                >
                    <Input value={form.name} onChange={handleChange('name')} />
                </FormItem>

                <FormItem
                    top="Гостей"
                    status={errors.guests ? 'error' : 'default'}
                    bottom={errors.guests}
                >
                    <Select
                        value={form.guests}
                        onChange={handleChange('guests')}
                        options={Array.from({ length: 12 }, (_, i) => ({
                            label: String(i + 1),
                            value: i + 1,
                        }))}
                    />
                </FormItem>
            </FormLayoutGroup>

            <FormItem
                top="Телефон"
                status={errors.phone ? 'error' : 'default'}
                bottom={errors.phone}
            >
                <Input
                    type="tel"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (___) ___-__-__"
                />
            </FormItem>

            <FormLayoutGroup mode="horizontal">
                <FormItem
                    top="Дата"
                    status={errors.date ? 'error' : 'default'}
                    bottom={errors.date}
                >
                    <Input type="date" value={form.date} onChange={handleChange('date')} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <Button size="s" mode="outline" onClick={setToday}>Сегодня</Button>
                        <Button size="s" mode="outline" onClick={setTomorrow}>Завтра</Button>
                    </div>
                </FormItem>

                <FormItem
                    top="Время"
                    status={errors.time ? 'error' : 'default'}
                    bottom={errors.time}
                >
                    <Select
                        value={form.time}
                        onChange={handleChange('time')}
                        placeholder="Выберите время"
                        options={TIME_OPTIONS}
                    />
                </FormItem>
            </FormLayoutGroup>

            <FormItem top="Комментарий">
                <Textarea
                    value={form.comment}
                    onChange={handleChange('comment')}
                    placeholder={commentPlaceholder}
                    rows={3}
                />
            </FormItem>

            <FormItem>
                <Div>
                    <Checkbox
                        checked={agreements.personal}
                        onChange={(e) =>
                            setAgreements({...agreements, personal: e.target.checked})
                        }
                    >
                        Согласен с условиями пользования
                    </Checkbox>

                    <Checkbox
                        checked={agreements.rules}
                        onChange={(e) =>
                            setAgreements({...agreements, rules: e.target.checked})
                        }
                    >
                        Ознакомлен с условиями пользования
                    </Checkbox>

                    <Checkbox
                        checked={agreements.notifications}
                        onChange={(e) =>
                            setAgreements({...agreements, notifications: e.target.checked})
                        }
                    >
                        Согласен получать уведомления о бронировании
                    </Checkbox>
                </Div>
            </FormItem>
            <FormItem>
                <Button
                    size="l"
                    stretched
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    Забронировать
                </Button>
            </FormItem>
        </>
    );
}

export default BookingForm;
