import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useRefreshMutation } from "@/features/Auth/authApi";
import { setCredentials } from "@/features/Auth/authSlice";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
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
        const response = await refresh().unwrap();
        dispatch(setCredentials(response));
      } catch (error) {
        console.error("Échec du refresh :", error);
      } finally {
        setChecking(false);
      }
    };

    void restoreSession();
  }, [token, refresh, dispatch]);

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
