import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  useGetPartnerReportDetailQuery,
  useUpdatePartnerReportMutation,
} from "./partnerReportApi";

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  IN_VERIFICATION: "En vérification",
  IN_VALIDATION: "En validation",
  VALIDATED: "Validé",
  REJECTED: "Rejeté",
  RETURNED: "Retourné pour correction",
};

const formatAmount = (value: unknown): string => {
  if (typeof value !== "number" && typeof value !== "string") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "Non renseigné";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  return date.toLocaleString("fr-FR");
};

export default function PartnerReportTreatment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [comments, setComments] = useState("");
  const [tab, setTab] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data, isLoading, isError, refetch } = useGetPartnerReportDetailQuery(
    id ?? "",
    {
      skip: !id,
    },
  );

  const [updateReport, { isLoading: isSaving }] =
    useUpdatePartnerReportMutation();

  const report = data?.report;
  const summary = data?.financial_summary;

  // Synchroniser les commentaires lorsque le rapport est chargé.
  useEffect(() => {
    if (report) {
      setComments(report.general_comments ?? "");
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [report?.id, report?.general_comments]);

  const handleSave = async () => {
    if (!report || report.status !== "DRAFT" || isSaving) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateReport({
        id: report.id,
        general_comments: comments,
      }).unwrap();

      setSaveSuccess(true);
      await refetch();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du rapport :", error);

      setSaveError(
        "Impossible d'enregistrer les commentaires. Vérifiez votre connexion et vos autorisations, puis réessayez.",
      );
    }
  };

  // Les retours conditionnels sont placés après tous les Hooks.
  if (!id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Identifiant du rapport absent de l’URL.</Alert>

        <Button
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !report) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void refetch()}>
              Réessayer
            </Button>
          }
        >
          Impossible de charger le rapport. Vérifiez l’accès à l’API et les
          autorisations de votre compte.
        </Alert>

        <Button
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Box>
    );
  }

  const isDraft = report.status === "DRAFT";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* En-tête */}
      <Stack
        sx={{
          direction: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          spacing: 2,
          mb: 3,
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 1 }}
          >
            Retour
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Traitement du rapport partenaire
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              mt: 1,
              overflowWrap: "anywhere",
            }}
          >
            Référence : {report.id}
          </Typography>
        </Box>

        <Chip
          label={statusLabels[report.status] ?? report.status}
          color={isDraft ? "warning" : "info"}
          variant="outlined"
        />
      </Stack>

      {!isDraft && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ce rapport n’est plus en brouillon. Les modifications peuvent être
          limitées par les règles du workflow.
        </Alert>
      )}

      {/* Informations générales */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Informations générales
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography color="text.secondary" variant="body2">
                Identifiant du rapport
              </Typography>

              <Typography sx={{ overflowWrap: "anywhere" }}>
                {report.id}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography color="text.secondary" variant="body2">
                Calendrier de décaissement
              </Typography>

              <Typography sx={{ overflowWrap: "anywhere" }}>
                {report.disbursement_schedule_id ?? "Non renseigné"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography color="text.secondary" variant="body2">
                Créé le
              </Typography>

              <Typography>{formatDate(report.created_at)}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography color="text.secondary" variant="body2">
                Dernière modification
              </Typography>

              <Typography>{formatDate(report.updated_at)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contenu du rapport */}
      <Card variant="outlined">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={(_, value: number) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Commentaires" />
            <Tab label="Rapport technique" />
            <Tab label="Rapport financier" />
            <Tab label="Justificatifs" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Onglet 1 : Commentaires */}
          {tab === 0 && (
            <Stack spacing={2}>
              <Typography variant="h6">Observations générales</Typography>

              {saveError && (
                <Alert severity="error" onClose={() => setSaveError(null)}>
                  {saveError}
                </Alert>
              )}

              {saveSuccess && (
                <Alert severity="success" onClose={() => setSaveSuccess(false)}>
                  Les commentaires ont été enregistrés.
                </Alert>
              )}

              <TextField
                label="Commentaires du partenaire"
                value={comments}
                onChange={(event) => {
                  setComments(event.target.value);
                  setSaveSuccess(false);
                  setSaveError(null);
                }}
                fullWidth
                multiline
                minRows={5}
                disabled={!isDraft || isSaving}
                placeholder="Décrivez les résultats, les difficultés rencontrées ou les observations utiles..."
              />

              <Box>
                <Button
                  variant="contained"
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={() => void handleSave()}
                  disabled={!isDraft || isSaving}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer le brouillon"}
                </Button>
              </Box>
            </Stack>
          )}

          {/* Onglet 2 : Rapport technique */}
          {tab === 1 && (
            <Stack spacing={2}>
              <Typography variant="h6">Rapport technique</Typography>

              <Alert severity="info">
                Les activités prévues, les résultats obtenus et les preuves
                doivent être chargés depuis les endpoints techniques du backend.
                Ils ne figurent pas dans le type PartnerReportWithSummary
                actuellement fourni.
              </Alert>
            </Stack>
          )}

          {/* Onglet 3 : Rapport financier */}
          {tab === 2 && (
            <Stack spacing={2}>
              <Typography variant="h6">Synthèse financière</Typography>

              {!summary || Object.keys(summary).length === 0 ? (
                <Alert severity="info">
                  Aucune synthèse financière disponible pour ce rapport.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {Object.entries(summary).map(([key, value]) => (
                    <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {key.replaceAll("_", " ")}
                          </Typography>

                          <Typography
                            variant="h6"
                            sx={{
                              mt: 1,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {typeof value === "number"
                              ? formatAmount(value)
                              : value === null
                                ? "—"
                                : typeof value === "string" &&
                                    value.trim() !== "" &&
                                    Number.isFinite(Number(value))
                                  ? formatAmount(value)
                                  : String(value)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <Divider />

              <Alert severity="info">
                La saisie des dépenses et le calcul du solde nécessitent les
                endpoints des lignes financières. Les montants calculés devront
                être validés côté serveur.
              </Alert>
            </Stack>
          )}

          {/* Onglet 4 : Justificatifs */}
          {tab === 3 && (
            <Stack spacing={2}>
              <Typography variant="h6">Pièces justificatives</Typography>

              <Alert severity="info">
                L’ajout, le téléchargement et la suppression des justificatifs
                seront raccordés aux endpoints de gestion des pièces jointes du
                backend.
              </Alert>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
