import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Auth durumu kontrol ediliyor (ilk yükleme)
  if (isAuthenticated === null) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="inline-flex items-center gap-3 text-muted-foreground">
          <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
          <span className="text-sm">Oturum kontrol ediliyor…</span>
        </div>
      </div>
    );
  }

  // Oturum yoksa login sayfasına gönder (geldiği yeri de state ile taşı)
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Oturum varsa geçişe izin ver
  return children;
};

export default PrivateRoute;