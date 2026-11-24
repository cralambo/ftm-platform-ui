import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import type { CurrentUserResponse } from "../user.types";

interface ProfileHeaderProps {
  user: CurrentUserResponse;
}

const USER_TYPE_LABELS: Record<string, string> = {
  EMPLOYEE: "Employé",
  PARTNER_CONTACT: "Partenaire",
  BOARD_MEMBER: "Conseil d'administration",
  ADMIN: "Administrateur",
  USER: "Utilisateur",
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const profile = user.profile;

  const firstname = profile?.firstname ?? user.firstname;
  const lastname = profile?.lastname ?? user.lastname;

  const fullName = `${firstname} ${lastname}`.trim();

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        background: "linear-gradient(120deg, #004D95 0%, #0069B4 100%)",
        color: "#fff",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          spacing: 2,
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Avatar
          sx={{
            width: 76,
            height: 76,
            bgcolor: "#80B334",
            fontSize: 28,
            fontWeight: 700,
            mr: 2,
          }}
        >
          {firstname?.charAt(0).toUpperCase() || "U"}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {fullName || user.email}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {user.email}
          </Typography>

          <Stack direction="row" sx={{ spacing: 1, mt: 1, flexWrap: "wrap" }}>
            <Chip
              label={USER_TYPE_LABELS[user.userType] ?? user.userType}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", mr: 1 }}
            />

            <Chip
              icon={
                user.enabled ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <BlockOutlinedIcon />
                )
              }
              label={user.enabled ? "Compte actif" : "Compte désactivé"}
              size="small"
              color={user.enabled ? "success" : "default"}
              sx={{ ml: 1 }}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
