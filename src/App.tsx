import React, { useEffect } from 'react';
import './App.css';
import MainScreen from './components/Main';

function App() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready(); // сообщаем Telegram, что приложение готово

    // 🔽 гарантированно скрыть системную кнопку (если где-то раньше показывали)
    try {
      tg.MainButton.hide();
      // на всякий случай снимаем любые старые обработчики
      // (если были задеплоены раньше)
      tg.MainButton.offClick?.(() => {});
    } catch (_) {
      /* ignore */
    }
  }, []);

  return (
    <div className="App">
      <MainScreen />
    </div>
  );
}

export default App;
