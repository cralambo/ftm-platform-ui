import {
  Box,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import type { CurrentUserResponse } from "../user.types";
import CommonCard from "@/components/common/CommonCard";

interface AccountInformationProps {
  user: CurrentUserResponse;
}

export default function AccountInformation({ user }: AccountInformationProps) {
  return (
    <CommonCard>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ spacing: 1, alignItems: "center", mb: 2 }}>
          <BadgeOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Informations du compte
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2.5}>
          <Box>
            <Stack
              direction="row"
              sx={{ spacing: 1, alignItems: "center", mb: 0.5 }}
            >
              <FingerprintOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Identifiant
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{ wordBreak: "break-all", fontWeight: 600 }}
            >
              {user.id}
            </Typography>
          </Box>

          <Box>
            <Stack
              direction="row"
              sx={{ spacing: 1, alignItems: "center", mb: 0.5 }}
            >
              <EmailOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Adresse e-mail
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user.email}
            </Typography>
          </Box>

          <Box>
            <Stack
              direction="row"
              sx={{ spacing: 1, alignItems: "center", mb: 1 }}
            >
              <SecurityOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Rôles et autorisations
              </Typography>
            </Stack>

            <Stack
              direction="row"
              useFlexGap
              sx={{ spacing: 1, flexWrap: "wrap" }}
            >
              {user.roles?.length ? (
                user.roles.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun rôle attribué
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </CommonCard>
  );
}
