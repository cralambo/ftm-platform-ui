import { useNavigate } from "react-router-dom";
import { Button, Container, Paper, Stack, Typography } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 10,
          p: 5,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <BlockIcon color="error" sx={{ fontSize: 72 }} />

          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Accès refusé
          </Typography>

          <Typography color="text.secondary">
            Vous ne disposez pas des permissions nécessaires pour accéder à
            cette page.
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/home", { replace: true })}
          >
            Retour à l'accueil
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
