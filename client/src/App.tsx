import "./App.css";
import React, { useRef, useState } from "react";

interface UserData {
  email: string;
  number: string;
}

const App: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [result, setResult] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatNumber = (value: string): string => {
    const cleanedValue = value.replace(/\D/g, "");
    const formattedValue = cleanedValue.replace(
      /(\d{2})(\d{2})(\d{2})/g,
      "$1-$2-$3"
    );
    return formattedValue;
  };

  const validateNumber = (value: string): boolean => {
    const cleanedValue = value.replace(/\D/g, "");
    return /^(\d{2}-\d{2}-\d{2}|\d{6})$/.test(cleanedValue);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setNumber(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      alert("Пожалуйста, введите email.");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, number }),
        signal: newAbortController.signal,
      });

      const data: UserData[] = await response.json();
      setResult(data);
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        console.log("Запрос отменен.");
      } else {
        console.error("Ошибка при запросе:", fetchError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />

        <label>Number:</label>
        <input
          type="text"
          value={number}
          onChange={(e) =>
            setNumber(
              e.target.value
                .replace(/\D/g, "")
                .replace(/(\d{2})(\d{2})/, "$1-$2")
            )
          }
        />
        <br />

        <button type="submit">
          {!loading ? "Request" : "Cancel the request"}
        </button>
      </form>

      {loading && <p>Загрузка...</p>}
      {result.length > 0 && (
        <div>
          <p>Query results:</p>
          {result.map((userData, index) => (
            <p key={index}>{`${index + 1}. "email": "${
              userData.email
            }", "number": "${userData.number}"`}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
