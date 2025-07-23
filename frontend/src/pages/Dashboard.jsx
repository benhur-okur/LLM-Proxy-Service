import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  console.log("Dashboard çalıştı");

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;  // build-time'da gelecek

  // dashboard.jsx içindeki useEffect'i şu şekilde güncelleyin:

// dashboard.jsx içindeki useEffect'i şu şekilde güncelleyin:

const debugCookies = () => {
  console.log("=== COOKIE DEBUG ===");
  console.log("All cookies:", document.cookie);
  console.log("Access token cookie:", document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1]);
  console.log("==================");
};

// dashboard.jsx - useEffect'i şu şekilde güncelle:

useEffect(() => {
  console.log("=== DASHBOARD DEBUG ===");
  console.log("Current URL:", window.location.href);
  console.log("Referrer:", document.referrer);
  
  // Cookie durumunu kontrol et
  const debugCookies = () => {
    console.log("=== COOKIE DEBUG ===");
    console.log("All cookies:", document.cookie);
    
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    console.log("Parsed cookies:", cookies);
    console.log("Access token exists:", !!cookies.access_token);
    console.log("Access token secure exists:", !!cookies.access_token_secure);
    console.log("==================");
    
    return cookies;
  };
  
  const cookies = debugCookies();
  
  // Eğer cookie yoksa biraz bekle (redirect sürecinde olabilir)
  const fetchUserData = () => {
    const BACKEND_URL = "http://localhost:5000";
    
    console.log("Fetching from:", `${BACKEND_URL}/auth/me`);
    
    fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
      .then((res) => {
        console.log("Response status:", res.status);
        console.log("Response headers:", [...res.headers.entries()]);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Not authenticated`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Kullanıcı verisi alındı:", data);
        setUser(data);
      })
      .catch((error) => {
        console.error("Auth error:", error);
        console.log("Cookie durumu tekrar kontrol ediliyor...");
        debugCookies();
        
        // 3 saniye sonra tekrar dene (redirect gecikmesi için)
        setTimeout(() => {
          console.log("İkinci deneme yapılıyor...");
          debugCookies();
          // Bu sefer navigate etme, sadece log
        }, 3000);
        
        navigate("/login");
      });
  };
  
  // İlk denemeden önce biraz bekle
  const timer = setTimeout(fetchUserData, 1500);
  
  return () => clearTimeout(timer);
}, [navigate]);
  


  const handleLogout = () => {
    fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      navigate("/login");
    });
  };

  if (!user) {
    return (
      <div style={styles.loading}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hoşgeldin, {user.username}!</h1>
        <p style={styles.email}>📧 {user.email}</p>

        <button style={styles.button} onClick={handleLogout}>
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
