// src/hooks/useModels.jsx
import { useState, useEffect } from "react";
import api from "../axios";

/**
 * Backend'de modeller için route iki farklı şekilde tanımlanmış olabilir:
 *  - "/models" (en sık)
 *  - "/config/models" (config blueprint ile)
 * Önce "/models" denenir, 404 gelirse "/config/models" ile tekrar denenir.
 */
export default function useModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchModels() {
      try {
        let response;
        try {
          response = await api.get("/models");
        } catch (err) {
          // Eğer 404 ise /config/models fallback dene
          const status = err?.response?.status;
          if (status === 404) {
            response = await api.get("/config/models");
          } else {
            throw err;
          }
        }

        if (!cancelled) {
          setModels(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error("[useModels] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchModels();
    return () => { cancelled = true; };
  }, []);

  return { models, loading, error };
}