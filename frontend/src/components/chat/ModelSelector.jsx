import { useEffect, useState } from "react";
import axios from "../../axios"; // Global axios instance
import { Loader2, Plus } from "lucide-react";

export default function ModelSelector({ onAddModel, activeModels = [] }) {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("/models");
        const data = response.data;
        console.log("Gelen model verisi:", data);
  
        if (Array.isArray(data)) {
          setModels(data);
        } else if (data?.models && Array.isArray(data.models)) {
          setModels(data.models);
        } else {
          throw new Error("Model verisi hatalı formatta");
        }
  
        // 🔧 YÜKLEME BİTTİ
        setLoading(false);
      } catch (err) {
        console.error("Model listesi alınamadı:", err);
        setError("Model listesi alınamadı");
        setLoading(false); // ❗ hata durumunda da loading bitmeli
      }
    };
  
    fetchModels();
  }, []);
  

  const handleAddModel = () => {
    if (!selectedModel || activeModels.includes(selectedModel)) return;
    onAddModel(selectedModel);
    setSelectedModel("");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="animate-spin h-4 w-4" />
        Modeller yükleniyor...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (models.length === 0) {
    return <p className="text-sm text-gray-500">Henüz ekli model yok.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          Model seçin
        </option>
        {models.map((model) => (
          <option
            key={model.name}
            value={model.name}
            disabled={activeModels.includes(model.name)}
          >
            {model.display_name || model.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleAddModel}
        disabled={!selectedModel || activeModels.includes(selectedModel)}
        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Ekle
      </button>
    </div>
  );
}
