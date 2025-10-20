import React, { useEffect } from 'react';
import './App.css';
import MainScreen from './components/Main';

function App() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready(); // говорим Telegram, что приложение готово

    // Настройка кнопки
    tg.MainButton.setText('Отправить результат');
    tg.MainButton.show();

    const handleClick = () => {
      const data = {
        type: 'match_result',
        timestamp: Date.now(),
        message: 'Пример результата'
      };
      tg.sendData(JSON.stringify(data));
    };

    tg.MainButton.onClick(handleClick);

    return () => tg.MainButton.offClick(handleClick);
  }, []);

  return (
    <div className="App">
      <MainScreen />
    </div>
  );
}

export default App;
