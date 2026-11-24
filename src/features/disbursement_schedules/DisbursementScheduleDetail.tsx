import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  useDeleteActivityMutation,
  useGetDisbursementScheduleQuery,
  useGetScheduleActivitiesQuery,
} from "./disbursementApi";

import type { DisbursementActivity, EntityId } from "./disbursement.types";

import ActivityFormDialog from "./Activityformdialog";
import CommonTable from "@/components/common/CommonTable";
import CommonCard from "@/components/common/CommonCard";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const formatDate = (value?: string | null): string => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("fr-FR");
};

const formatNumber = (value?: number | string | null): string => {
  if (value == null || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return String(value);

  return new Intl.NumberFormat("fr-FR").format(number);
};

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      status?: number | string;
      data?: { message?: string };
      error?: string;
    };

    if (apiError.data?.message) {
      return apiError.data.message;
    }

    if (apiError.status === 409) {
      return "Impossible de supprimer cette activité : elle est peut-être utilisée dans un rapport.";
    }

    if (apiError.status === "FETCH_ERROR") {
      return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }

    if (apiError.status === "TIMEOUT_ERROR") {
      return "Le serveur met trop de temps à répondre.";
    }

    if (apiError.error) {
      return apiError.error;
    }
  }

  return "La suppression a échoué. Veuillez réessayer.";
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function DisbursementScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const scheduleId = id;

  const schedule = useGetDisbursementScheduleQuery(scheduleId as EntityId, {
    skip: !scheduleId,
  });

  const activities = useGetScheduleActivitiesQuery(scheduleId as EntityId, {
    skip: !scheduleId,
  });

  const [deleteActivity, { isLoading: deleting }] = useDeleteActivityMutation();

  const [formOpen, setFormOpen] = useState(false);

  const [editing, setEditing] = useState<DisbursementActivity | null>(null);

  const [toDelete, setToDelete] = useState<DisbursementActivity | null>(null);

  const [snack, setSnack] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (activity: DisbursementActivity) => {
    setEditing(activity);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!toDelete || !scheduleId) return;

    try {
      await deleteActivity({
        id: toDelete.id,
        scheduleId,
      }).unwrap();

      setSnack({
        message: "Activité supprimée avec succès.",
        severity: "success",
      });
    } catch (error: unknown) {
      setSnack({
        message: getErrorMessage(error),
        severity: "error",
      });
    } finally {
      setToDelete(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (!scheduleId) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          Identifiant du calendrier de décaissement introuvable.
        </Alert>

        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Retour
          </Button>
        </Box>
      </Stack>
    );
  }

  if (schedule.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (schedule.isError || !schedule.data) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          Impossible de charger le calendrier de décaissement.
        </Alert>

        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Retour
          </Button>
        </Box>
      </Stack>
    );
  }

  const s = schedule.data;
  const activityList = activities.data ?? [];
  const project = s?.project;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{ m: 3 }}>
      <Stack spacing={3}>
        {/* En-tête */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Retour">
            <IconButton aria-label="Retour" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Calendrier de décaissement — {s.reference}
          </Typography>
        </Stack>

        {/* Détail du projet */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
        </Stack>
        <CommonCard>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
              }}
            >
              <Info
                label="Numero de convention"
                value={project.agreement_number}
              />

              <Info
                label="Date de début"
                value={formatDate(project.start_date)}
              />

              <Info label="Date de fin" value={formatDate(project.end_date)} />

              <Info
                label="Date d'octroi"
                value={formatDate(project.granted_project?.grant_date)}
              />

              <Info
                label="Montant octroyé"
                value={formatNumber(project.granted_project?.grant_amount)}
              />
              <Info
                label="Partenaire d'appui"
                value={project.support_partner?.name}
              />
            </Box>
          </CardContent>
        </CommonCard>
        {/* Détail du calendrier */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Détail du calendrier
          </Typography>
        </Stack>
        <CommonCard>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
              }}
            >
              <Info label="Référence" value={s.reference} />

              <Info
                label="Date du décaissement"
                value={formatDate(s.disbursement_month)}
              />

              <Info
                label="Montant du décaissement"
                value={formatNumber(s.disbursement_amount)}
              />

              <Info label="Pourcentage" value={`${s.percentage} %`} />

              <Info
                label="Date d'envoi du rapport"
                value={formatDate(s.report_submission_date)}
              />
            </Box>
          </CardContent>
        </CommonCard>

        {/* En-tête des activités */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Activités
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Ajouter une activité
          </Button>
        </Stack>

        {/* Erreur de chargement des activités */}
        {activities.isError && (
          <Alert severity="error">
            Impossible de charger les activités.
            <Button
              size="small"
              onClick={() => activities.refetch()}
              sx={{ ml: 1 }}
            >
              Réessayer
            </Button>
          </Alert>
        )}

        {/* Tableau des activités */}
        <CommonTable>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Cible / Critère de succès</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {activities.isLoading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}

              {!activities.isLoading &&
                !activities.isError &&
                activityList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        color: "text.secondary",
                        py: 3,
                      }}
                    >
                      Aucune activité pour ce calendrier.
                    </TableCell>
                  </TableRow>
                )}

              {activityList.map((activity) => (
                <TableRow key={activity.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {activity.name}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        activity.type === "QUANTITATIVE"
                          ? "Quantitative"
                          : "Qualitative"
                      }
                      color={
                        activity.type === "QUANTITATIVE"
                          ? "primary"
                          : "secondary"
                      }
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell sx={{ maxWidth: 320 }}>
                    {activity.type === "QUANTITATIVE"
                      ? [
                          formatNumber(activity.target_quantity),
                          activity.unit ?? "",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      : activity.success_criteria || "—"}
                  </TableCell>

                  <TableCell sx={{ maxWidth: 320 }}>
                    {activity.description || "—"}
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        aria-label={`Modifier ${activity.name}`}
                        onClick={() => openEdit(activity)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Supprimer ${activity.name}`}
                        onClick={() => setToDelete(activity)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CommonTable>

        {/* Formulaire d'ajout / modification */}
        <ActivityFormDialog
          open={formOpen}
          scheduleId={scheduleId}
          activity={editing}
          onClose={handleCloseForm}
          onSaved={(message) => {
            setSnack({
              message,
              severity: "success",
            });
          }}
        />

        {/* Confirmation de suppression */}
        <Dialog
          open={toDelete !== null}
          onClose={() => {
            if (!deleting) {
              setToDelete(null);
            }
          }}
        >
          <DialogTitle>Supprimer l'activité ?</DialogTitle>

          <DialogContent>
            <DialogContentText>
              L'activité « {toDelete?.name} » sera définitivement supprimée.
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setToDelete(null)} disabled={deleting}>
              Annuler
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={confirmDelete}
              disabled={deleting}
              startIcon={
                deleting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DeleteIcon />
                )
              }
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification */}
        <Snackbar
          open={snack !== null}
          autoHideDuration={4000}
          onClose={(_, reason) => {
            if (reason !== "clickaway") {
              setSnack(null);
            }
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          {snack ? (
            <Alert
              severity={snack.severity}
              variant="filled"
              onClose={() => setSnack(null)}
            >
              {snack.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Stack>
    </Box>
  );
}
