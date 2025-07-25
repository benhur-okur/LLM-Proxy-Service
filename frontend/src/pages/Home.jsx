import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    const result = isLogin
      ? await login(email, password)
      : await register(username, email, password);

    if (!result.success) {
      alert(result.message);
    } else if (!isLogin) {
      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      setIsLogin(true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 w-full max-w-md"
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => document.documentElement.classList.toggle("dark")}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md text-sm"
          >
            🌙 / ☀️
          </button>
        </div>

        {/* Logo */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            LLM Proxy Service
          </h1>
        </div>

        {/* Başlık */}
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {isLogin ? "Giriş Yap" : "Kayıt Ol"}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Gelişmiş API proxy yönetimine hoş geldiniz
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>

        {/* veya */}
        <div className="my-5 text-center text-gray-400 dark:text-gray-500 text-sm">veya</div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-3 rounded-lg transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Google ile Giriş Yap
          </span>
        </button>

        {/* Alt Link */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {isLogin ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
