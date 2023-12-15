import "./App.css";
import React, { useRef, useState } from "react";

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
  const [emptyResult, setEmptyResult] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatNumber = (value: string): string => {
    const cleanedValue = value.replace(/[^\d-]/g, "");
    let formattedValue = cleanedValue.replace(
      /(\d{2})(\d{2})(\d{2})/g,
      "$1-$2-$3"
    );

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

  const handleEmailChane = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value.trim();

    if (validateEmail(emailValue)) {
      setValidEmail(true);
      setEmptyEmail(false);
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    if (validateNumber(formattedValue)) {
      setValidNumber(true);
    } else {
      setValidNumber(false);
    }
    setNumber(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmited(true);

    if (!validNumber || !validEmail || emptyEmail) {
      return;
    }

    setLoading(true);
    setEmptyResult("");
    setResult([]);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    let newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

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
      !data.length && setEmptyResult("Nothing found");
      setResult(data);
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        console.log("Request canceled.");
      } else {
        console.error("Query error:", fetchError);
      }
    } finally {
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
      setLoading(false);
      setIsSubmited(false);
    }
  };

  return (
    <div className="page">
      <h1 className="head">The search form</h1>
      <form onSubmit={handleSubmit} className="form">
        <label className="label">Email:</label>
        <input
          type="text"
          className="input"
          value={email}
          onChange={handleEmailChane}
        />
        <div className="errorBox">
          {emptyEmail && isSubmited && <p className="error">Required field</p>}
          {!validEmail && isSubmited && <p className="error">Invalid email</p>}
        </div>

        <label className="label">Number:</label>
        <input
          type="text"
          className="input"
          value={number}
          onChange={handleNumberChange}
        />
        <div className="errorBox">
          {!validNumber && isSubmited && (
            <p className="error">Invalid number</p>
          )}
        </div>

        <button type="submit" className="button">
          {!loading ? "Request" : "Cancel the request"}
        </button>
      </form>

      <h2 className="headInfo">
        {loading ? (
          <p className="textInfo">Loading...</p>
        ) : (
          <p className="textInfo">Query results:</p>
        )}
      </h2>

      <div className="output">
        {result.length > 0 ? (
          result.map((userData, index) => (
            <p key={index}>{`${index + 1}. email: ${
              userData.email
            }, phone number: ${userData.number.replace(
              /(\d{2})(\d{2})(\d{2})/g,
              "$1-$2-$3"
            )}`}</p>
          ))
        ) : (
          <p>{emptyResult}</p>
        )}
      </div>
    </div>
  );
};

export default App;
