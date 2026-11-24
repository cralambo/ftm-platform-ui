import {
  Box,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import type {
  BoardMemberProfile,
  CurrentUserResponse,
  EmployeeProfile,
  PartnerContactProfile,
} from "../user.types";
import CommonCard from "@/components/common/CommonCard";

interface ProfileDetailsProps {
  user: CurrentUserResponse;
}

interface DetailItemProps {
  label: string;
  value?: string | null;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{ overflowWrap: "anywhere", fontWeight: 600 }}
      >
        {value?.trim() || "Non renseigné"}
      </Typography>
    </Box>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "Non renseigné";

  // Évite les décalages de date liés au fuseau horaire
  const date = new Date(`${value.substring(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   EMPLOYEE PROFILE
========================================================= */

function EmployeeDetails({ profile }: { profile: EmployeeProfile }) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ spacing: 1, alignItems: "center" }}>
        <WorkOutlineIcon color="primary" />

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Informations professionnelles
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Matricule" value={profile.employee_number} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Acronyme" value={profile.acronym} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Département" value={profile.department?.name} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="Code département"
            value={profile.department?.code}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Poste occupé" value={profile.position?.name} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Code du poste" value={profile.position?.code} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="Date d'embauche"
            value={formatDate(profile.hire_date)}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Coordonnées
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="E-mail personnel" value={profile.personal_email} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="E-mail professionnel"
            value={profile.professional_email}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Téléphone" value={profile.phone} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DetailItem label="Adresse" value={profile.address} />
        </Grid>
      </Grid>
    </Stack>
  );
}

/* =========================================================
   PARTNER CONTACT PROFILE
========================================================= */

function PartnerContactDetails({
  profile,
}: {
  profile: PartnerContactProfile;
}) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ spacing: 1, alignItems: "center" }}>
        <BusinessOutlinedIcon color="primary" />

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Informations du partenaire
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="Organisation partenaire"
            value={profile.supportPartner?.name}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="Identifiant du partenaire"
            value={profile.supportPartner?.id}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Coordonnées
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Adresse e-mail" value={profile.email} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Téléphone" value={profile.phone} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DetailItem label="Adresse" value={profile.address} />
        </Grid>
      </Grid>
    </Stack>
  );
}

/* =========================================================
   BOARD MEMBER PROFILE
========================================================= */

function BoardMemberDetails({ profile }: { profile: BoardMemberProfile }) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ spacing: 1, alignItem: "center" }}>
        <BadgeOutlinedIcon color="primary" />

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Informations du mandat
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Fonction" value={profile.position} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="Date de nomination"
            value={formatDate(profile.appointment_date)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="Date de fin de mandat"
            value={formatDate(profile.end_date)}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Coordonnées
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="E-mail personnel" value={profile.personal_email} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="E-mail professionnel"
            value={profile.professional_email}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="Téléphone" value={profile.phone} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DetailItem label="Adresse" value={profile.address} />
        </Grid>
      </Grid>
    </Stack>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  let profileContent;

  switch (user.userType) {
    case "EMPLOYEE":
      profileContent = user.profile ? (
        <EmployeeDetails profile={user.profile} />
      ) : null;
      break;

    case "PARTNER_CONTACT":
      profileContent = user.profile ? (
        <PartnerContactDetails profile={user.profile} />
      ) : null;
      break;

    case "BOARD_MEMBER":
      profileContent = user.profile ? (
        <BoardMemberDetails profile={user.profile} />
      ) : null;
      break;

    case "ADMIN":
    case "USER":
      profileContent = (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <PersonOutlineIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
          />

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Aucun profil professionnel associé
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Ce compte ne possède pas de profil métier spécifique.
          </Typography>
        </Box>
      );
      break;

    default:
      profileContent = null;
  }

  return (
    <CommonCard>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ spacing: 1, alignItems: "center", mb: 2 }}>
          <PersonOutlineIcon color="primary" />

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Informations du profil
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {profileContent ?? (
          <Typography color="text.secondary">
            Aucune information de profil disponible.
          </Typography>
        )}
      </CardContent>
    </CommonCard>
  );
}
