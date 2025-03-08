import { useState } from "react";
import "./App.css";
import { API_URL } from "./constants";

interface Data {
  count: number;
}

function App() {
  const [count, setCount] = useState(0);

  const handleClick = async () => {
    const response = await fetch(`${API_URL}/count/${count}`);
    const data = (await response.json()) as Data;
    setCount(data.count);
  };

  return (
    <>
      <div className="min-h-screen flex flex-row items-center justify-center">
        <button
          className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleClick}
        >
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
