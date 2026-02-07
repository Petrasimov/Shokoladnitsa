import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@vkontakte/vkui/dist/vkui.css'
import './index.css'
import App from './App.jsx'
import bridge from '@vkontakte/vk-bridge';

// Инициализация VK Bridge
bridge.send('VKWebAppInit')
  .then(() => {
    console.log('✅ VK Bridge initialized');

    // Получаем информацию о пользователе
    return bridge.send('VKWebAppGetUserInfo');
  })
  .then((userInfo) => {
    console.log('👤 User:', userInfo);
  })
  .catch((error) => {
    console.error('❌ VK Bridge error:', error);
  });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
