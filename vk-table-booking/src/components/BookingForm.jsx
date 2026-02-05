import React from 'react';
import { useState } from 'react';
import {
    FormItem,
    Input,
    Button,
    Textarea,
    Select,
    Group
} from '@vkontakte/vkui'
import {
    validateName,
    validateGuests,
    validatePhone,
    validateDate,
    validateTime
} from '../utils/validators'

function BookingForm() {
    const [form, setForm] = useState({
        name: '',
        guests: 1,
        phone: '',
        email: '',
        date: '',
        time: '',
        comment: ''
    })

    const validateForm = () => {
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
        return Object.keys(newErrors).lenght === 0
    }

    const [errors, setErrors] = useState({

    })

    const handleChange = (field) => (e) => {
        setForm({...form, [field]: e.target.value})
    }

    const handleSubmit = async () => {
        if(!validateForm()) return;

        try {
            const response = await fetch('http://127.0.0.1:8001/api/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            })

            const data = await response.json()

            alert('Бронь успешно отправлена')
            console.log(data)

        } catch (error) {
            console.error('Ошибка отправки', error)
            alert('Ошибка при отправке брони')
        }
    }

    return (
        <Group>
            <FormItem
             top="Имя"
             status={errors.name ? 'error' : 'default'}
             bottom={errors.name}
             >
                <Input value={form.name} onChange={handleChange('name')}/>
            </FormItem>

            <FormItem 
            top="Количество гостей"
            status={errors.guests ? 'error' : 'default'}
            bottom={errors.guests}
            >
                <Select 
                    value={form.guests}
                    onChange={handleChange('guests')}
                    options={[
                        {label: 1, value: 1},
                        {label: 2, value: 2},
                        {label: 3, value: 3},
                        {label: 4, value: 4},
                        {label: 5, value: 5},
                        {label: 6, value: 6},
                        {label: 7, value: 7},
                        {label: 8, value: 8},
                        {label: 9, value: 9},
                        {label: 10, value: 10},
                        {label: 11, value: 11},
                        {label: 12, value: 12}
                    ]}
                />
            </FormItem>

            <FormItem
             top="Телефон"
             status={errors.phone ? 'error' : 'default'}
             bottom={errors.phone}
             >
                <Input value={form.phone} onChange={handleChange('phone')}/>
            </FormItem>

            <FormItem
             top="Email">
                <Input value={form.email} onChange={handleChange('email')}/>
            </FormItem>

            <FormItem
             top="Дата"
             status={errors.date ? 'error' : 'default'}
             bottom={errors.date}>
                <Input type="date" value={form.date} onChange={handleChange('date')}/>
            </FormItem>

            <FormItem
             top="Время"
             status={errors.time ? 'error' : 'default'}
             bottom={errors.time}>
                <Input type="time" value={form.time} onChange={handleChange('time')}/>
            </FormItem>

            <FormItem top="Комментарий">
                <Textarea value={form.comment} onChange={handleChange('comment')}/>
            </FormItem>

            <FormItem top="Забронировать">
                <Button size='1' stretched onClick={handleSubmit}>
                    Забронировать
                </Button>
            </FormItem>
            
        </Group>
    );
}

export default BookingForm;