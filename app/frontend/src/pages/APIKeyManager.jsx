import React, { useEffect, useState } from "react";
import api from "../axios"; // Global axios instance
import { toast } from "react-toastify"; // en üste ekle

const PROVIDERS = ["openai", "anthropic", "gemini", "grok"];

const APIKeyManager = () => {
  const [apiKeys, setApiKeys] = useState({});
  const [validationStatus, setValidationStatus] = useState({});

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await api.get("/apikeys/");
      const keyMap = {};
      res.data.forEach((key) => {
        keyMap[key.model_name] = key;
      });
      setApiKeys(keyMap);
    } catch (err) {
      console.error("API keys fetch failed", err);
    }
  };

  const getDocsLink = (model) => {
    switch (model.toLowerCase()) {
      case "openai":
        return "https://platform.openai.com/account/api-keys";
      case "anthropic":
        return "https://console.anthropic.com/settings/keys";
      case "gemini":
        return "https://aistudio.google.com/app/apikey";
      case "grok":
        return "https://openrouter.ai/";
      default:
        return "#";
    }
  };
  

  const handleSave = async (model) => {
    const keyValue = apiKeys[model]?.key_value || "";
    if (!keyValue) return;

    try {
      setValidationStatus((prev) => ({ ...prev, [model]: "validating" }));

      const validateRes = await api.post("/apikeys/validate", {
        model_name: model,
        key_value: keyValue,
      });

      console.log(`[Validate Response for ${model}]`, validateRes.data);

      // ❌ Geçersiz key durumu
      if (!validateRes.data.valid) {
        setValidationStatus((prev) => ({ ...prev, [model]: "invalid" }));

        // 🧠 Kullanıcıyı bilgilendirici popup mesajı
        toast.error(
          <>
            <div className="text-sm font-medium">
              <strong>{model}</strong> API anahtarı doğrulanamadı.
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {validateRes.data.error || "Geçersiz anahtar girdiniz."}
            </div>
            <a
              href={getDocsLink(model)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-300 text-xs mt-2 inline-block"
            >
              {model} için geçerli bir API key alın
            </a>
          </>
        );

        return;
      }

      // ✅ Eğer key zaten varsa güncelle
      const existing = apiKeys[model];
      if (existing?.id) {
        await api.put(`/apikeys/${existing.id}`, {
          model_name: model,
          key_value: keyValue,
        });
      } else {
        const res = await api.post("/apikeys/", {
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

      toast.success(`${model} API anahtarı başarıyla kaydedildi.`);
    } catch (err) {
      console.error("Validation error:", err);
      setValidationStatus((prev) => ({ ...prev, [model]: "error" }));
      toast.error("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  };


  const handleDelete = async (model) => {
    try {
      const key = apiKeys[model];
      if (key?.id) {
        await api.delete(`/apikeys/${key.id}`);
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
