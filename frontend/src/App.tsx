import { useState, useEffect } from "react";
import "./App.css";
import { API_URL } from "./constants";

interface Data {
  count: number;
}

interface User {
  name: string;
  id: number;
}

function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User>();

  const handleClick = async () => {
    const response = await fetch(`${API_URL}/count/${count}`);
    const data = (await response.json()) as Data;
    setCount(data.count);
  };

  const handleLogin = async () => {
    const response = await fetch(`${API_URL}/login`);
    const user = (await response.json()) as User;
    setUser(user);
  };

  useEffect(() => {
    async function login() {
      await handleLogin();
    }

    login();
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="m-2">Hello, {user?.name}!</div>
        <div className="m-2">
          <button
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
            onClick={handleClick}
          >
            count is {count}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
