// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext"; 
import { ApiKeyProvider } from "./contexts/ApiKeyContext"; // ✅ Import context
import APIKeyManager from "./pages/APIKeyManager"; 
import ChatPage from "./pages/ChatPage"; 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ApiKeyProvider> {/* ✅ Wrap children with APIKeyContext */}
          <Router>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />

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
      </AuthProvider>
    </ThemeProvider>
  );
}
