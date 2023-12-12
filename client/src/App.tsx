import "./App.css";
import React, { useEffect, useRef, useState } from "react";

interface UserData {
  email: string;
  number: string;
}

const App: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  let [number, setNumber] = useState<string>("");
  const [result, setResult] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [validNumber, setValidNumber] = useState<boolean>(true);
  const [validEmail, setValidEmail] = useState<boolean>(true);
  const [emptyEmail, setEmptyEmail] = useState<boolean>(true);
  const [isSubmited, setIsSubmited] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatNumber = (value: string): string => {
    const cleanedValue = value.replace(/[^\d-]/g, "");
    let formattedValue = cleanedValue.replace(/(\d{2})(\d{2})/g, "$1-$2");

    if (formattedValue.length >= 8) {
      formattedValue = formattedValue.substring(0, 8);
    }

    return formattedValue;
  };

  const validateNumber = (value: string): boolean => {
    const cleanedValue = value.replace(/[^\d-]/g, "");
    return /^(\d{2}-\d{2}-\d{2}|\d{6})$/.test(cleanedValue);
  };

  const validateEmail = (value: string) => {
    return /^((.*\s)?<[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+\.[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+>|[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+\.[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+)$/.test(
      value
    );
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    if (validateNumber(formattedValue)) {
      setValidNumber(true);
    } else {
      setValidNumber(false);
    }
    setNumber(formattedValue);
  };

  const handleEmailChane = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value.trim();
    if (validateEmail(emailValue)) {
      setValidEmail(true);
    } else {
      if (emailValue === "") {
        setEmptyEmail(true);
        setValidEmail(true);
      } else {
        setEmptyEmail(false);
        setValidEmail(false);
      }
    }
    setEmail(emailValue);
  };

  useEffect(() => {
    validNumber ? console.log("Validno") : console.log("Not");
  }, [validNumber]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmited(true);
    if (!validNumber || !validEmail || emptyEmail) {
      alert("The form failed validation!");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    setLoading(true);

    try {
      number = number.replace(/\D/g, "");
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
      setIsSubmited(false);
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        console.log("Request canceled.");
      } else {
        console.error("Query error:", fetchError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" value={email} onChange={handleEmailChane} />
        {emptyEmail && isSubmited && <p>Required field</p>}
        {!validEmail && isSubmited && <p>Invalid email</p>}
        <br />

        <label>Number:</label>
        <input type="text" value={number} onChange={handleNumberChange} />
        {!validNumber && isSubmited && <p>Invalid number</p>}
        <br />

        <button type="submit">
          {!loading ? "Request" : "Cancel the request"}
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {result.length > 0 && (
        <div>
          <p>Query results:</p>
          {result.map((userData, index) => (
            <p key={index}>{`${index + 1}. email: ${
              userData.email
            }, phone number: ${userData.number.replace(
              /(\d{2})(\d{2})(\d{2})/g,
              "$1-$2-$3"
            )}`}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
