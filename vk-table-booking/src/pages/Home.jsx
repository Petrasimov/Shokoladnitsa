import { Group } from '@vkontakte/vkui';
import BookingForm from '../components/BookingForm'

function Home({ onSuccess, onError }) {
    return (
        <Group>
            <BookingForm onSuccess={onSuccess} onError={onError} />
        </Group>
    );
}

export default Home;
