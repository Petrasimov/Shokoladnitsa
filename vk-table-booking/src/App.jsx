import { useState } from 'react'
import {
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  Panel,
  PanelHeader,
  ModalCard,
  Button,
  Text,
} from '@vkontakte/vkui'
import Home from './pages/Home'

function App() {
  const [activeModal, setActiveModal] = useState('welcome')
  const [reservationData, setReservationData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const closeModal = () => setActiveModal(null)

  const handleSuccess = (data) => {
    setReservationData(data)
    setActiveModal('success')
  }

  const handleError = (message) => {
    setErrorMessage(message)
    setActiveModal('error')
  }

  return (
    <ConfigProvider>
      <AppRoot>
        <SplitLayout>
          <SplitCol autoSpaced>
            <View activePanel='home'>
              <Panel id='home'>
                <PanelHeader>Бронирование столов</PanelHeader>
                <Home onSuccess={handleSuccess} onError={handleError} />
              </Panel>
            </View>
          </SplitCol>
        </SplitLayout>

        <ModalCard
          open={activeModal === 'welcome'}
          onClose={closeModal}
          title="👋 Добро пожаловать!"
          description="Здесь вы можете быстро и удобно забронировать столик ☕ Заполните форму ниже — это займёт меньше минуты."
          actions={
            <Button size="l" mode="primary" stretched onClick={closeModal}>
              Понятно 👍
            </Button>
          }
        />

        <ModalCard
          open={activeModal === 'success'}
          onClose={closeModal}
          title="🎉 Бронирование успешно!"
          description="Мы уже ждём вас в кофейне ☕"
          actions={
            <Button
              size="l"
              stretched
              mode="commerce"
              component="a"
              href="https://vk.com/shokokirov?w=app5898182_-156166947"
              target="_blank"
            >
              🎁 Получить подарок
            </Button>
          }
        >
          {reservationData && (
            <Text>
              <b>👤 Имя:</b> {reservationData.name}<br />
              <b>👥 Гостей:</b> {reservationData.guests}<br />
              <b>📞 Телефон:</b> {reservationData.phone}<br />
              <b>📅 Дата:</b> {reservationData.date}<br />
              <b>⏰ Время:</b> {reservationData.time}
            </Text>
          )}
        </ModalCard>

        <ModalCard
          open={activeModal === 'error'}
          onClose={closeModal}
          title="😔 Ошибка"
          description={errorMessage}
          actions={
            <Button size="l" mode="primary" stretched onClick={closeModal}>
              Понятно
            </Button>
          }
        />
      </AppRoot>
    </ConfigProvider>
  )
}

export default App
