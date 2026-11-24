import type { JSX } from "react/jsx-runtime";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { tokens } from "@/theme";

const Home = (): JSX.Element => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={1}
        sx={{
          p: 4,
          boxShadow: "none",
          borderRadius: 1,
          bgcolor: (theme) =>
            theme.palette.mode === "light" ? "#ffffff" : colors.primary[600], // slate-800
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Bienvenue sur la plateforme de gestion des projets
        </Typography>

        <Typography sx={{ color: "text.secondary" }}>
          Cette plateforme permet aux partenaires, aux employés de la Fondation
          Tany Meva ainsi qu'aux membres du Conseil d'Administration de gérer
          les projets, les calendriers de décaissement, les rapports techniques
          et financiers ainsi que les circuits de validation.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <GavelOutlinedIcon />
          <Typography variant="h5" sx={{ ml: 1 }}>
            Conditions générales d'utilisation
          </Typography>
        </Box>

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Accès personnel"
              secondary="Chaque utilisateur est responsable de son identifiant et de son mot de passe. Le partage de compte est strictement interdit."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Confidentialité"
              secondary="Toutes les informations consultées ou téléchargées sur cette plateforme sont confidentielles et réservées aux personnes autorisées."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Exactitude des informations"
              secondary="Les utilisateurs s'engagent à fournir des informations exactes, complètes et à jour lors de la soumission des rapports."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Respect des échéances"
              secondary="Les rapports techniques et financiers doivent être transmis dans les délais prévus par le calendrier de décaissement."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Circuit de validation"
              secondary="Les rapports suivent le circuit officiel de validation de la Fondation. Toute tentative de contournement est interdite."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Protection des documents"
              secondary="Les documents déposés sur la plateforme ne doivent pas être modifiés ou supprimés sans autorisation."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Traçabilité"
              secondary="Toutes les opérations (création, modification, validation, rejet, téléchargement) sont enregistrées à des fins d'audit."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Respect des droits d'accès"
              secondary="Chaque utilisateur ne peut accéder qu'aux informations correspondant à son rôle et à ses autorisations."
            />
          </ListItem>
        </List>

        <Alert severity="warning" sx={{ mt: 3 }}>
          En utilisant cette plateforme, vous reconnaissez avoir pris
          connaissance des présentes conditions générales d'utilisation et vous
          vous engagez à les respecter. Toute utilisation abusive ou frauduleuse
          peut entraîner la suspension ou la suppression de votre accès.
        </Alert>
      </Paper>
    </Box>
  );
};

export default Home;
