import { useState, useEffect } from "react";
import axios from "axios"; // burda axios ile ilgili bir hata olabilir sonra dikkta et !

export default function useModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await axios.get("/models", { withCredentials: true });
        setModels(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  return { models, loading, error };
}
