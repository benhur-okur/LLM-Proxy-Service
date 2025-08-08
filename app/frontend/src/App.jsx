// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ApiKeyProvider } from "./contexts/ApiKeyContext";

import { ConversationsProvider } from "./contexts/ConversationsContext";

import APIKeyManager from "./pages/APIKeyManager";
import ChatPage from "./pages/ChatPage";

import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";  // Tailwind/PostCSS hatası bittiğinde aç !

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConversationsProvider>
          <ApiKeyProvider>
            <Router>
              <ToastContainer position="top-right" autoClose={5000} theme="dark" />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                >
                  <Route
                    path="api-keys"
                    element={
                      <PrivateRoute>
                        <APIKeyManager />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="chat"
                    element={
                      <PrivateRoute>
                        <ChatPage />
                      </PrivateRoute>
                    }
                  />
                </Route>
              </Routes>
            </Router>
          </ApiKeyProvider>
        </ConversationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}