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
        guests: '1',
        phone: '',
        email: '',
        date: '',
        time: '',
        comment: ''
    })

    const handleChange = (field) => (e) => {
        setForm({...form, [field]: e.target.value})
    }

    const handleSubmit = () => {
        console.log('Бронирование:', form)
        alert('Демо: данные выведены в консоль')
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
                />
            </FormItem>

            <FormItem top="Телефон">
                <Input value={form.phone} onChange={handleChange('phone')}/>
            </FormItem>

            <FormItem top="Email">
                <Input value={form.email} onChange={handleChange('email')}/>
            </FormItem>

            <FormItem top="Дата">
                <Input type="date" />
            </FormItem>

            <FormItem top="Время">
                <Input type="time" />
            </FormItem>

            <FormItem top="Имя">
                <Button size='1' stretched onClick={handleSubmit}/>
            </FormItem>
            
        </Group>
    );
}

export default BookingForm;