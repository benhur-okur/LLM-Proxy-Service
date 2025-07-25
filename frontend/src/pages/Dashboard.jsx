import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      console.log("isAuthenticated false, ana sayfaya yönlendiriliyorsun");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // isAuthenticated null ise (kontrol devam ediyor) yükleniyor göster
  if (isAuthenticated === null) {
    return (
      <div style={styles.loading}>
        <p>Yükleniyor... - isAuthenticated null</p>
      </div>
    );
  }

  // isAuthenticated true ama user yoksa da yükleniyor göster (örnek: veri henüz gelmedi)
  if (!user) {
    return (
      <div style={styles.loading}>
        <p>Yükleniyor... - user gelemedi</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hoşgeldin, {user.username}!</h1>
        <p style={styles.email}>📧 {user.email}</p>

        <button style={styles.button} onClick={logout}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    color: "#202124",
    marginBottom: "10px",
  },
  email: {
    fontSize: "16px",
    color: "#5f6368",
    marginBottom: "30px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4285F4",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    fontFamily: "'Inter', sans-serif",
    color: "#555",
  },
};
