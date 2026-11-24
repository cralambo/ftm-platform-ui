import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/app/hooks";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useLoginMutation } from "./authApi";
import CommonBlueButton from "@/components/common/CommonBlueButton";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const schema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Adresse e-mail invalide")
    .required("E-mail obligatoire"),
  password: Yup.string().required("Mot de passe obligatoire"),
});

const loginTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#004D95",
    },
    background: {
      default: "#101624",
      paper: "#040509",
    },
  },
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
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 3,
            }}
          >
            {/* LOGO */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="Logo Tany Meva"
                sx={{
                  width: 150,
                  height: "auto",
                }}
              />
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="E-mail"
                  type="email"
                  size="small"
                  autoComplete="email"
                  autoFocus
                  {...fieldProps(formik, "email")}
                />

                <TextField
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  size="small"
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

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <CommonBlueButton
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
                  </CommonBlueButton>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
