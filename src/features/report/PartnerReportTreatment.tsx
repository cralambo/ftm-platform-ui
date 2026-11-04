import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";

import {
  useGetPartnerReportDetailQuery,
  useUpdatePartnerReportMutation,
  useSubmitPartnerReportMutation,
} from "./partnerReportApi";

import CommonCard from "@/components/CommonCard";
import TechnicalReportSection from "./components/TechnicalReportSection";
import FinancialReportSection from "./components/FinancialReportSection";
import GeneralReportAttachments from "./components/GeneralReportAttachments";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/CommonGreyButton";
import CommonBlueButton from "@/components/CommonBlueButton";

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
  console.log("PartnerReportTreatment chargé");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // États locaux
  const [comments, setComments] = useState("");
  const [tab, setTab] = useState(0);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const [hasAllRequiredDocuments, setHasAllRequiredDocuments] = useState(false);

  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isReportSaved, setIsReportSaved] = useState(false);

  // Chargement du rapport
  const { data, isLoading, isError, refetch } = useGetPartnerReportDetailQuery(
    id ?? "",
    {
      skip: !id,
    },
  );

  // Mutation de mise à jour
  const [updateReport, { isLoading: isSaving }] =
    useUpdatePartnerReportMutation();

  // Mutation de soumission
  const [submitReport, { isLoading: isSubmitting }] =
    useSubmitPartnerReportMutation();

  const report = data?.report;
  const summary = data?.financial_summary;

  const isDraft = report?.status === "DRAFT";
  const isBusy = isSaving || isSubmitting;

  // Vérification temporaire
  console.log("Report status:", report?.status);
  console.log("Is draft:", isDraft);

  // Synchronisation des commentaires
  useEffect(() => {
    if (report) {
      setComments(report.general_comments ?? "");
      setSaveError(null);
      setSaveSuccess(false);
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [report?.id, report?.general_comments]);

  // Enregistrement du brouillon
  const handleSaveDraft = async () => {
    if (!report || !isDraft || isBusy) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateReport({
        id: report.id,
        general_comments: comments,
      }).unwrap();

      setIsDraftSaved(true);
      setIsReportSaved(false);
      setSaveSuccess(true);

      await refetch();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du brouillon :", error);

      setSaveError(
        "Impossible d'enregistrer le brouillon. Vérifiez votre connexion et vos autorisations.",
      );
    }
  };

  const handleSaveReport = async () => {
    if (!report || !isDraft || isBusy) {
      return;
    }

    if (!hasAllRequiredDocuments) {
      setSaveError(
        "Veuillez ajouter toutes les pièces justificatives obligatoires.",
      );
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Enregistrer les commentaires généraux.
      await updateReport({
        id: report.id,
        general_comments: comments,
      }).unwrap();

      setIsReportSaved(true);
      setSaveSuccess(true);

      await refetch();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du rapport :", error);

      setIsReportSaved(false);

      setSaveError(
        "Impossible d'enregistrer le rapport. Vérifiez les données et réessayez.",
      );
    }
  };

  // Soumission du rapport
  const handleSubmit = async () => {
    if (!report || !isDraft || isBusy) {
      return false;
    }

    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await submitReport({
        id: report.id,
        general_comments: comments.trim() || null,
      }).unwrap();

      setSubmitSuccess(true);
      setConfirmSubmitOpen(false);

      await refetch();

      return true;
    } catch (error) {
      console.error("Erreur complète lors de la soumission :", error);

      const apiError = error as {
        status?: number | string;
        data?: {
          message?: string;
          detail?: string;
          error?: string;
          errors?: Record<string, string>;
          title?: string;
        };
      };

      const backendMessage =
        apiError?.data?.message ??
        apiError?.data?.detail ??
        apiError?.data?.error ??
        apiError?.data?.title;

      const validationErrors = apiError?.data?.errors;

      const message = validationErrors
        ? Object.entries(validationErrors)
            .map(([field, message]) => `${field} : ${message}`)
            .join("\n")
        : (backendMessage ??
          `Échec de la soumission (HTTP ${apiError?.status ?? "inconnu"}). Consultez les logs du serveur.`);

      setSubmitError(message);
      setConfirmSubmitOpen(false);

      return false;
    }
  };

  // Retours conditionnels après les Hooks
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* En-tête */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
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

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            spacing: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Chip
            label={statusLabels[report.status] ?? report.status}
            color={isDraft ? "warning" : "info"}
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Notifications */}
      {submitError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setSubmitError(null)}
        >
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Votre rapport a été soumis avec succès.
        </Alert>
      )}

      {saveError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setSaveError(null)}
        >
          {saveError}
        </Alert>
      )}

      {saveSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSaveSuccess(false)}
        >
          Les commentaires ont été enregistrés.
        </Alert>
      )}

      {!isDraft && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ce rapport n’est plus en brouillon. Les modifications ne sont plus
          autorisées à ce stade du workflow.
        </Alert>
      )}

      {/* Informations générales */}
      <Box sx={{ mb: 3 }}>
        <CommonCard>
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
        </CommonCard>
      </Box>

      {/* Contenu du rapport */}
      <Box>
        <CommonCard>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tab}
              onChange={(_, value: number) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  color: colors.grey[300],
                  fontWeight: 600,
                  textTransform: "none",
                  minHeight: 48,
                  transition: "all 0.2s ease",
                },
                "& .MuiTab-root.Mui-selected": {
                  color: colors.bluePrimary[500],
                  fontWeight: 700,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: colors.bluePrimary[500],
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              <Tab label="COMMENTAIRES" />
              <Tab label="RAPPORT TECHNIQUE" />
              <Tab label="RAPPORT FINANCIER" />
              <Tab label="JUSTIFICATIFS" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Onglet 1 : Commentaires */}
            {tab === 0 && (
              <Stack spacing={2}>
                <Typography variant="h6">Observations générales</Typography>

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
                  disabled={!isDraft || isBusy}
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
                    onClick={() => void handleSaveDraft()}
                    disabled={!isDraft || isBusy}
                  >
                    {isSaving
                      ? "Enregistrement..."
                      : "Enregistrer le brouillon"}
                  </Button>
                </Box>
              </Stack>
            )}

            {/* Onglet 2 : Rapport technique */}
            {tab === 1 && (
              <Stack spacing={2}>
                <TechnicalReportSection
                  reportId={report.id}
                  scheduleId={report.disbursement_schedule_id}
                  readOnly={!isDraft || isBusy}
                />
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
                        <CommonCard sx={{ height: "100%" }}>
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
                        </CommonCard>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Divider />

                <FinancialReportSection
                  reportId={report.id}
                  readOnly={!isDraft || isBusy}
                />
              </Stack>
            )}

            {/* Onglet 4 : Justificatifs */}
            {tab === 3 && (
              <Stack spacing={2}>
                <Typography variant="h6">Pièces justificatives</Typography>

                <Typography variant="body2" color="text.secondary">
                  Ajoutez les documents généraux qui justifient le rapport :
                  courriers, rapports complémentaires, photos ou autres pièces.
                </Typography>

                <GeneralReportAttachments
                  reportId={report.id}
                  readOnly={!isDraft || isBusy}
                  onRequiredDocumentsChange={setHasAllRequiredDocuments}
                />
              </Stack>
            )}
          </CardContent>
        </CommonCard>
      </Box>
      <Box sx={{ mt: 3 }}>
        <CommonCard>
          <CardContent>
            {isDraft && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{
                  spacing: 2,
                  justifyContent: "flex-end",
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <Box sx={{ mr: 1 }}>
                  <CommonGreyButton
                    variant="outlined"
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={() => void handleSaveReport()}
                    disabled={
                      !isDraftSaved || !hasAllRequiredDocuments || isBusy
                    }
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </CommonGreyButton>
                </Box>

                <Box sx={{ ml: 1 }}>
                  <CommonBlueButton
                    variant="contained"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SendIcon />
                      )
                    }
                    onClick={() => setConfirmSubmitOpen(true)}
                    disabled={
                      !isReportSaved || !hasAllRequiredDocuments || isBusy
                    }
                  >
                    Soumettre le rapport
                  </CommonBlueButton>
                </Box>
              </Stack>
            )}
          </CardContent>
        </CommonCard>
      </Box>

      {/* Dialogue de confirmation */}
      <Dialog
        open={confirmSubmitOpen}
        onClose={() => {
          if (!isSubmitting) {
            setConfirmSubmitOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmer la soumission du rapport</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Vous êtes sur le point de soumettre votre rapport partenaire pour
            vérification.
            {"\n\n"}
            Avant de continuer, assurez-vous que les informations techniques,
            financières et les pièces justificatives sont complètes.
            {"\n\n"}
            Après la soumission, vous ne pourrez plus modifier directement les
            informations tant que le rapport ne sera pas retourné pour
            correction.
            {"\n\n"}
            Voulez-vous continuer ?
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmSubmitOpen(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || isSaving}
          >
            {isSubmitting
              ? "Soumission en cours..."
              : "Confirmer la soumission"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
