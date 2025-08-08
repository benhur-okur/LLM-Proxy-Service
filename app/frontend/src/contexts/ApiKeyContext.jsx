// src/contexts/ApiKeyContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

const ApiKeyContext = createContext();

export function ApiKeyProvider({ children }) {
  const [apiKeys, setApiKeys] = useState([]);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await api.get("/apikeys/");
        setApiKeys(res.data); // [{ model_name: "openai", key_value: "sk-..." }]
      } catch (err) {
        console.error("API anahtarları alınamadı", err);
      }
    };

    fetchKeys();
  }, []);

  function getApiKeyForModel(modelName) {
    const entry = apiKeys.find((key) => key.model_name === modelName);
    return entry?.key_value || null;
  }

  return (
    <ApiKeyContext.Provider value={{ apiKeys, getApiKeyForModel }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  return useContext(ApiKeyContext);
}
