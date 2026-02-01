import React from 'react';
import { Group, Header } from '@vkontakte/vkui';
import BookingForm from '../components/BookingForm'

function Home() {
    return (
        <Group header={<Header mode="secondary">Бронирование столика</Header>}>
            <BookingForm    />
        </Group>
    );
}

export default Home;