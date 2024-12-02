import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  async function closeApp() {
    try {
      const message = await invoke("close_app_in", { minutes: 5, appName: "Safari" });
      setGreetMsg(message);
      setTimeLeft(5 * 60); // 5 минут в секундах
      setTimerActive(true);
    } catch (error) {
      console.error("Ошибка при закрытии приложения:", error);
    }
  }

  function cancelTimer() {
    setTimerActive(false);
    setTimeLeft(null);
    setGreetMsg("Таймер отменен");
  }

  useEffect(() => {
    let interval: number;
    
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return null;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="container">
      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      <button onClick={closeApp}>Закрыть Safari через 5 минут</button>
      {timeLeft !== null && (
        <>
          <p>Осталось времени: {formatTime(timeLeft)}</p>
          <button onClick={cancelTimer}>Отменить таймер</button>
        </>
      )}
    </main>
  );
}

export default App;