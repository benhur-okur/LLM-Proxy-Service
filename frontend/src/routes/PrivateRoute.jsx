import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
