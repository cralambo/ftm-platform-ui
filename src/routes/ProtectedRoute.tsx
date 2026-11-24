import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAppSelector } from "@/app/hooks";
import { useRefreshMutation } from "@/features/Auth/authApi";

export default function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.accessToken);
  const location = useLocation();

  const [refresh] = useRefreshMutation();
  const [checking, setChecking] = useState(true);

  const started = useRef(false);

  useEffect(() => {
    if (token) {
      setChecking(false);
      return;
    }

    if (started.current) return;

    started.current = true;

    const restoreSession = async () => {
      try {
        await refresh().unwrap();
      } catch (error) {
        console.error("Échec de restauration de session :", error);
      } finally {
        setChecking(false);
      }
    };

    void restoreSession();
  }, [token, refresh]);

  if (checking) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
