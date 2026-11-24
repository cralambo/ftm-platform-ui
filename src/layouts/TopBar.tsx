import {
  Box,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Typography,
  Badge,
} from "@mui/material";

import { useContext, useState } from "react";
import type { JSX, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ColorModeContext, tokens } from "../theme";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CircularProgress from "@mui/material/CircularProgress";

// Adapte ce chemin à ton fichier API
import { useLogoutMutation } from "@/features/Auth/authApi";

const TopBar = (): JSX.Element => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    handleClose();

    try {
      await logout().unwrap();
    } catch {
      // La mutation nettoie déjà la session locale
      // dans onQueryStarted, même si le serveur échoue.
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f0f0f0 !important"
            : colors.primary[600] + " !important",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex" }}>
        <IconButton
          onClick={colorMode.toggleColorMode}
          aria-label="Changer le thème"
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <IconButton aria-label="Notifications">
          <NotificationsOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={() => navigate("/memorandums/pending-validation")}
          title="Mémorandums à valider"
        >
          <Badge color="error" max={99}>
            <AssignmentTurnedInOutlinedIcon />
          </Badge>
        </IconButton>

        <IconButton aria-label="Paramètres">
          <SettingsOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={handleMenuOpen}
          aria-label="Menu utilisateur"
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <PersonOutlinedIcon />
        </IconButton>

        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem disabled>
            <Typography variant="body2">Mon compte</Typography>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/profile");
            }}
          >
            <ListItemIcon>
              <AccountCircleOutlinedIcon />
            </ListItemIcon>
            Profile
          </MenuItem>

          <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
            <ListItemIcon>
              {isLoggingOut ? (
                <CircularProgress size={20} />
              ) : (
                <LogoutOutlinedIcon />
              )}
            </ListItemIcon>

            {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default TopBar;
