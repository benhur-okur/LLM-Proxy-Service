import React, { useEffect, useState } from "react";
import axios from "../axios"; // Global axios instance

const PROVIDERS = ["openai", "anthropic", "gemini", "grok"];

const APIKeyManager = () => {
  const [apiKeys, setApiKeys] = useState({});
  const [validationStatus, setValidationStatus] = useState({});

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await axios.get("/apikeys/");
      const keyMap = {};
      res.data.forEach((key) => {
        keyMap[key.model_name] = key;
      });
      setApiKeys(keyMap);
    } catch (err) {
      console.error("API keys fetch failed", err);
    }
  };

  const handleSave = async (model) => {
    const keyValue = apiKeys[model]?.key_value || "";
    if (!keyValue) return;

    try {
      setValidationStatus((prev) => ({ ...prev, [model]: "validating" }));

      const validateRes = await axios.post("/apikeys/validate", {
        model_name: model,
        key_value: keyValue,
      });

      if (!validateRes.data.valid) {
        setValidationStatus((prev) => ({ ...prev, [model]: "invalid" }));
        return;
      }

      const existing = apiKeys[model];
      if (existing?.id) {
        await axios.put(`/apikeys/${existing.id}`, {
          model_name: model,
          key_value: keyValue,
        });
      } else {
        const res = await axios.post("/apikeys/", { //hatanın oluştugu kod bloğu
          model_name: model,
          key_value: keyValue,
        });
        setApiKeys((prev) => ({
          ...prev,
          [model]: { model_name: model, key_value: keyValue, id: res.data.id },
        }));
      }

      setValidationStatus((prev) => ({ ...prev, [model]: "valid" }));
      fetchApiKeys();
    } catch (err) {
      console.error("Validation error:", err);
      setValidationStatus((prev) => ({ ...prev, [model]: "error" }));
    }
  };

  const handleDelete = async (model) => {
    try {
      const key = apiKeys[model];
      if (key?.id) {
        await axios.delete(`/apikeys/${key.id}`);
        setApiKeys((prev) => ({ ...prev, [model]: null }));
        setValidationStatus((prev) => ({ ...prev, [model]: null }));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleChange = (model, value) => {
    setApiKeys((prev) => ({
      ...prev,
      [model]: {
        ...prev[model],
        model_name: model,
        key_value: value,
      },
    }));
    setValidationStatus((prev) => ({ ...prev, [model]: null }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        API Anahtarlarınızı Yönetin
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200">
                Model
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200">
                API Anahtarı
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-200">
                Durum
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-200">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {PROVIDERS.map((model) => (
              <tr key={model}>
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <span className="capitalize text-gray-800 dark:text-gray-100 font-semibold">
                    {model}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={apiKeys[model]?.key_value || ""}
                    onChange={(e) => handleChange(model, e.target.value)}
                    placeholder="₿••••••••••••"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  {validationStatus[model] === "validating" && (
                    <span className="text-yellow-500 animate-pulse">⏳</span>
                  )}
                  {validationStatus[model] === "valid" && (
                    <span className="text-green-500">✔️</span>
                  )}
                  {validationStatus[model] === "invalid" && (
                    <span className="text-red-500">❌</span>
                  )}
                  {validationStatus[model] === "error" && (
                    <span className="text-red-400">⚠️</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center flex justify-center space-x-2">
                  <button
                    onClick={() => handleSave(model)}
                    className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm transition"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => handleDelete(model)}
                    className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg text-sm transition"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default APIKeyManager;
