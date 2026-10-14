import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/app/hooks";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useLoginMutation } from "./authApi";

const schema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Adresse e-mail invalide")
    .required("E-mail obligatoire"),
  password: Yup.string().required("Mot de passe obligatoire"),
});

export default function Login() {
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [login, { error, isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/home";

  console.log("TOKEN FROM REDUX:", token);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      // En cas de succès, le token est dans le store : la redirection se fait plus bas
      await login(values)
        .unwrap()
        .catch(() => undefined);
    },
  });

  if (token) return <Navigate to={from} replace />;

  const status = (error as FetchBaseQueryError | undefined)?.status;
  const errorMessage = error
    ? status === 401 || status === 403
      ? "E-mail ou mot de passe incorrect"
      : getErrorMessage(error)
    : null;

  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Connexion
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Connectez-vous à FTM Platform
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} noValidate>
            <Stack spacing={1}>
              <TextField
                label="E-mail"
                type="email"
                autoComplete="email"
                autoFocus
                {...fieldProps(formik, "email")}
              />
              <TextField
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...fieldProps(formik, "password")}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Afficher le mot de passe"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : undefined
                }
              >
                Se connecter
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
