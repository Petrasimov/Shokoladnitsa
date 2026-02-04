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

    const handleChange = (field) => (e) => {
        setForm({...form, [field]: e.target.value})
    }

    const handleSubmit = async () => {
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
            <FormItem top="Имя">
                <Input value={form.name} onChange={handleChange('name')}/>
            </FormItem>

            <FormItem top="Количество гостей">
                <Select 
                    value={form.guests}
                    onChange={handleChange('guests')}
                    options={[
                        {label: 1, value: 1},
                        {label: 2, value: 2},
                        {label: 3, value: 3},
                        {label: 4, value: 4},
                        {label: 5, value: 5},
                        {label: 6, value: 6}
                    ]}
                />
            </FormItem>

            <FormItem top="Телефон">
                <Input value={form.phone} onChange={handleChange('phone')}/>
            </FormItem>

            <FormItem top="Email">
                <Input value={form.email} onChange={handleChange('email')}/>
            </FormItem>

            <FormItem top="Дата">
                <Input type="date" value={form.date} onChange={handleChange('date')}/>
            </FormItem>

            <FormItem top="Время">
                <Input type="time" value={form.time} onChange={handleChange('time')}/>
            </FormItem>

            <FormItem top="Комментарий">
                <Textarea value={form.comment} onChange={handleChange('comment')}/>
            </FormItem>

            <FormItem top="Имя">
                <Button size='1' stretched onClick={handleSubmit}>
                    Забронировать
                </Button>
            </FormItem>
            
        </Group>
    );
}

export default BookingForm;