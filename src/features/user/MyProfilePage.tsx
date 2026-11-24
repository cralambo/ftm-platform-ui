import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useGetCurrentUserQuery } from "./userApi";
import ProfileHeader from "./components/ProfileHeader";
import AccountInformation from "./components/AccountInformation";
import ProfileDetails from "./components/ProfileDetails";

export default function MyProfilePage() {
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user) {
    return (
      <Alert severity="error">
        Impossible de récupérer les informations de votre profil.
      </Alert>
    );
  }

  return (
    <Box sx={{ m: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Mon profil
        </Typography>

        <ProfileHeader user={user} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 3,
          }}
        >
          <AccountInformation user={user} />
          <ProfileDetails user={user} />
        </Box>
      </Stack>
    </Box>
  );
}
