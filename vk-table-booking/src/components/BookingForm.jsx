import { useState, useMemo } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    Checkbox,
    FormItem,
    Input,
    Button,
    Textarea,
    Select,
    FormLayoutGroup,
    DateInput,
    Link,
    ModalCard,
    ModalRoot,
} from '@vkontakte/vkui';
import {
    validateName,
    validateGuests,
    validatePhone,
    validateDate,
    validateTime,
} from '../utils/validators';
import {
    PRIVACY_POLICY_TEXT,
    USER_AGREEMENT_TEXT,
    PERSONAL_DATA_CONSENT_TEXT,
} from '../utils/legalTexts';

// Генерация слотов времени: 08:00, 08:30, ..., 20:00
const ALL_TIME_SLOTS = (() => {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
        for (let m = 0; m < 60; m += 30) {
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    return slots;
})();

/** Минимальная дата — сегодня (в формате YYYY-MM-DD) */
const getTodayStr = () => new Date().toISOString().split('T')[0];

/** Проверяет, является ли строка датой сегодняшнего дня */
const isToday = (dateStr) => {
    if (!dateStr) return false;
    return dateStr === getTodayStr();
};

/** Конвертирует строку YYYY-MM-DD в объект Date (полночь локального времени) */
const dateStrToDate = (str) => {
    if (!str) return undefined;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
};

/** Конвертирует объект Date в строку YYYY-MM-DD */
const dateToStr = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/** Форматирует цифры телефона в читаемый вид: +7 (XXX) XXX-XX-XX */
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
    comment: '',
};

const INITIAL_AGREEMENTS = {
    // Согласие с условиями использования и политикой конфиденциальности
    termsAndPrivacy: false,
    // Согласие на обработку персональных данных
    personalData: false,
    // Согласие на уведомления через VK (опционально — не блокирует кнопку)
    notifications: false,
};

function BookingForm({ onRequestConfirm, isSubmitting }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [agreements, setAgreements] = useState(INITIAL_AGREEMENTS);

    // Модальное окно с юридическим текстом
    const [legalModal, setLegalModal] = useState(null); // null | 'privacy' | 'terms' | 'consent'

    // Рандомный плейсхолдер для комментария
    const [commentPlaceholder] = useState(() => {
        const variants = ['У окна', 'В уголочке', 'На диване', 'Не возле входа', 'У розетки'];
        return variants[Math.floor(Math.random() * variants.length)];
    });

    // Кнопка активна только если заполнены обязательные поля И приняты оба обязательных соглашения
    const canSubmit = useMemo(() => {
        const phoneDigits = form.phone.replace(/\D/g, '');
        return (
            form.name.trim().length > 0 &&
            phoneDigits.length >= 10 &&
            form.date.length > 0 &&
            form.time.length > 0 &&
            agreements.termsAndPrivacy &&
            agreements.personalData
        );
    }, [form.name, form.phone, form.date, form.time, agreements.termsAndPrivacy, agreements.personalData]);

    // Фильтрация слотов времени: если дата — сегодня, убираем прошедшие
    const availableTimeSlots = useMemo(() => {
        if (!isToday(form.date)) return ALL_TIME_SLOTS;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return ALL_TIME_SLOTS.filter(slot => {
            const [h, m] = slot.split(':').map(Number);
            return h * 60 + m > currentMinutes;
        });
    }, [form.date]);

    /** Валидация всех полей формы */
    const validateFormData = () => {
        const newErrors = {
            name: validateName(form.name),
            guests: validateGuests(form.guests),
            phone: validatePhone(form.phone),
            date: validateDate(form.date),
            time: validateTime(form.time),
        };
        Object.keys(newErrors).forEach(key => newErrors[key] === null && delete newErrors[key]);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDateChange = (date) => {
        const str = dateToStr(date);
        setForm({ ...form, date: str });
        if (errors.date) setErrors({ ...errors, date: null });
    };

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        if (errors[field]) setErrors({ ...errors, [field]: null });
    };

    const handlePhoneChange = (e) => {
        const allDigits = e.target.value.replace(/\D/g, '');
        let cleaned = allDigits;
        if (cleaned.startsWith('7') || cleaned.startsWith('8')) cleaned = cleaned.slice(1);
        cleaned = cleaned.slice(0, 10);
        const formatted = cleaned.length > 0 ? formatPhone(cleaned) : '';
        setForm({ ...form, phone: formatted });
        if (errors.phone) setErrors({ ...errors, phone: null });
    };

    // Обработчик чекбокса уведомлений — запрашивает разрешение через VK Bridge
    const handleNotificationsChange = async (e) => {
        if (e.target.checked) {
            try {
                await bridge.send('VKWebAppAllowMessagesFromGroup', {
                    group_id: Number(import.meta.env.VITE_VK_GROUP_ID),
                });
                setAgreements({ ...agreements, notifications: true });
            } catch {
                setAgreements({ ...agreements, notifications: false });
            }
        } else {
            setAgreements({ ...agreements, notifications: false });
        }
    };

    const handleSubmit = () => {
        if (isSubmitting) return;
        if (!validateFormData()) return;

        const cleanPhone = form.phone.replace(/\D/g, '');

        onRequestConfirm({
            payload: {
                name: form.name,
                guests: form.guests,
                phone: cleanPhone,
                date: form.date,
                time: form.time,
                comment: form.comment || null,
                vk_user_id: window.vkUser?.id ?? null,
                vk_notifications: agreements.notifications,
            },
            displayData: {
                name: form.name,
                guests: form.guests,
                phone: form.phone,
                date: form.date,
                time: form.time,
                comment: form.comment || null,
            },
        });
    };

    // Получаем текст для модального окна
    const getLegalContent = () => {
        if (legalModal === 'privacy') return { title: '🔒 Политика конфиденциальности', text: PRIVACY_POLICY_TEXT };
        if (legalModal === 'terms') return { title: '📄 Пользовательское соглашение', text: USER_AGREEMENT_TEXT };
        if (legalModal === 'consent') return { title: '✅ Согласие на обработку ПД', text: PERSONAL_DATA_CONSENT_TEXT };
        return null;
    };

    const legalContent = getLegalContent();

    return (
        <>
            {/* Модальное окно с юридическим документом */}
            {legalContent && (
                <ModalRoot activeModal="legal" onClose={() => setLegalModal(null)}>
                    <ModalCard
                        id="legal"
                        onClose={() => setLegalModal(null)}
                        title={legalContent.title}
                        actions={
                            <Button size="l" mode="primary" stretched onClick={() => setLegalModal(null)}>
                                Понятно
                            </Button>
                        }
                    >
                        <div style={{
                            whiteSpace: 'pre-wrap',
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: 'var(--vkui--color_text_primary)',
                            maxHeight: '60vh',
                            overflowY: 'auto',
                            padding: '4px 0',
                        }}>
                            {legalContent.text}
                        </div>
                    </ModalCard>
                </ModalRoot>
            )}

            {/* ── Поля формы ── */}
            <FormLayoutGroup mode="horizontal">
                <FormItem
                    top="👤 Имя"
                    status={errors.name ? 'error' : 'default'}
                    bottom={errors.name}
                >
                    <Input
                        value={form.name}
                        onChange={handleChange('name')}
                        maxLength={100}
                    />
                </FormItem>

                <FormItem
                    top="👥 Гостей"
                    status={errors.guests ? 'error' : 'default'}
                    bottom={errors.guests}
                >
                    <Select
                        value={form.guests}
                        onChange={handleChange('guests')}
                        options={Array.from({ length: 20 }, (_, i) => ({
                            label: String(i + 1),
                            value: i + 1,
                        }))}
                    />
                </FormItem>
            </FormLayoutGroup>

            <FormItem
                top="📱 Телефон"
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
                    top="📅 Дата"
                    status={errors.date ? 'error' : 'default'}
                    bottom={errors.date}
                >
                    <DateInput
                        value={dateStrToDate(form.date)}
                        onChange={handleDateChange}
                        disablePast
                        minDateTime={new Date()}
                        closeOnChange
                    />
                </FormItem>

                <FormItem
                    top="⏰ Время"
                    status={errors.time ? 'error' : 'default'}
                    bottom={errors.time}
                >
                    <Select
                        value={form.time}
                        onChange={handleChange('time')}
                        placeholder="Выберите время"
                        options={availableTimeSlots.map(t => ({ label: t, value: t }))}
                    />
                </FormItem>
            </FormLayoutGroup>

            <FormItem
                top="💬 Комментарий"
                bottom={
                    <span style={{
                        float: 'right',
                        color: form.comment.length > 450
                            ? 'var(--vkui--color_text_negative)'
                            : 'var(--vkui--color_text_secondary)',
                        fontSize: 13,
                    }}>
                        {form.comment.length}/500
                    </span>
                }
            >
                <Textarea
                    value={form.comment}
                    onChange={handleChange('comment')}
                    placeholder={commentPlaceholder}
                    rows={3}
                    maxLength={500}
                />
            </FormItem>

            {/* ── Раздел согласий ── */}

            {/* 1. Условия использования + политика конфиденциальности */}
            <FormItem>
                <Checkbox
                    checked={agreements.termsAndPrivacy}
                    onChange={(e) => setAgreements({ ...agreements, termsAndPrivacy: e.target.checked })}
                >
                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                        Я принимаю{' '}
                        <Link
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLegalModal('terms'); }}
                            style={{ color: 'var(--vkui--color_text_link)' }}
                        >
                            пользовательское соглашение
                        </Link>
                        {' '}и{' '}
                        <Link
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLegalModal('privacy'); }}
                            style={{ color: 'var(--vkui--color_text_link)' }}
                        >
                            политику конфиденциальности
                        </Link>
                        {' '}кафе «Шоколадница» *
                    </span>
                </Checkbox>
            </FormItem>

            {/* 2. Согласие на обработку персональных данных */}
            <FormItem>
                <Checkbox
                    checked={agreements.personalData}
                    onChange={(e) => setAgreements({ ...agreements, personalData: e.target.checked })}
                >
                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                        Я даю{' '}
                        <Link
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLegalModal('consent'); }}
                            style={{ color: 'var(--vkui--color_text_link)' }}
                        >
                            согласие на обработку персональных данных
                        </Link>
                        {' '}(имя, телефон) *
                    </span>
                </Checkbox>
            </FormItem>

            {/* 3. Уведомления через VK — опционально */}
            <FormItem>
                <Checkbox
                    checked={agreements.notifications}
                    onChange={handleNotificationsChange}
                >
                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                        🔔 Получать уведомления о бронировании через VK
                    </span>
                </Checkbox>
            </FormItem>

            {/* Подсказка об обязательных полях */}
            <FormItem>
                <div style={{ fontSize: 11, color: 'var(--vkui--color_text_tertiary)', paddingLeft: 4 }}>
                    * — обязательно для оформления бронирования
                </div>
            </FormItem>

            {/* ── Кнопка бронирования ── */}
            <FormItem>
                <Button
                    size="l"
                    stretched
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    loading={isSubmitting}
                >
                    ☕ Забронировать
                </Button>
            </FormItem>
        </>
    );
}

export default BookingForm;