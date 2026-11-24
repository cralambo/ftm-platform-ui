import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import {
  useGetFinancialReportItemsQuery,
  useGetFinancialSummaryQuery,
  useCreateFinancialReportItemMutation,
  useUpdateFinancialReportItemMutation,
  useDeleteFinancialReportItemMutation,
  type FinancialReportItem,
  type FinancialReportItemRequest,
} from "@/features/report/financialReportApi";

import CommonTable from "@/components/common/CommonTable";
import CommonCard from "@/components/common/CommonCard";
import FinancialExpenseAttachments from "./FinancialExpenseAttachments";
import CommonBlueButton from "@/components/common/CommonBlueButton";

interface FinancialReportSectionProps {
  reportId: string;
  readOnly?: boolean;
}

const emptyForm: FinancialReportItemRequest = {
  designation: "",
  quantity: "1",
  unit_amount: "",
  observations: "",
};

function formatAmount(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return String(value ?? "0");

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function FinancialReportSection({
  reportId,
  readOnly = false,
}: FinancialReportSectionProps) {
  const {
    data: items = [],
    isLoading: loadingItems,
    error: itemsError,
  } = useGetFinancialReportItemsQuery(reportId, {
    skip: !reportId,
  });

  const {
    data: summary,
    isLoading: loadingSummary,
    error: summaryError,
  } = useGetFinancialSummaryQuery(reportId, {
    skip: !reportId,
  });

  const [createItem, { isLoading: creating }] =
    useCreateFinancialReportItemMutation();

  const [updateItem, { isLoading: updating }] =
    useUpdateFinancialReportItemMutation();

  const [deleteItem, { isLoading: deleting }] =
    useDeleteFinancialReportItemMutation();

  const [form, setForm] = useState<FinancialReportItemRequest>(emptyForm);

  const [editForm, setEditForm] =
    useState<FinancialReportItemRequest>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const busy = creating || updating || deleting;

  const handleFormChange = (
    field: keyof FinancialReportItemRequest,
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setCreateError(null);
  };

  const handleEditChange = (
    field: keyof FinancialReportItemRequest,
    value: string,
  ) => {
    setEditForm((previous) => ({ ...previous, [field]: value }));
  };

  const validate = (values: FinancialReportItemRequest): string | null => {
    if (!values.designation.trim()) {
      return "La désignation est obligatoire.";
    }

    if (!values.quantity.trim() || !Number.isFinite(Number(values.quantity))) {
      return "Veuillez saisir une quantité valide.";
    }

    if (Number(values.quantity) <= 0) {
      return "La quantité doit être supérieure à zéro.";
    }

    if (
      !values.unit_amount.trim() ||
      !Number.isFinite(Number(values.unit_amount))
    ) {
      return "Veuillez saisir un prix unitaire valide.";
    }

    if (Number(values.unit_amount) < 0) {
      return "Le prix unitaire ne peut pas être négatif.";
    }

    return null;
  };

  const handleCreate = async () => {
    const validationError = validate(form);

    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createItem({
        reportId,
        body: {
          ...form,
          designation: form.designation.trim(),
          quantity: form.quantity.trim(),
          unit_amount: form.unit_amount.trim(),
          observations: form.observations?.trim() || "",
        },
      }).unwrap();

      setOpenCreateDialog(false);
      setForm({ ...emptyForm });
      setSuccessMessage("Dépense ajoutée avec succès.");
    } catch {
      setCreateError("Impossible d'ajouter cette dépense.");
    }
  };

  const startEdit = (item: FinancialReportItem) => {
    setEditingId(item.id);

    setEditForm({
      designation: item.designation,
      quantity: String(item.quantity),
      unit_amount: String(item.unit_amount),
      observations: item.observations ?? "",
    });

    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleUpdate = async (itemId: string) => {
    const validationError = validate(editForm);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateItem({
        reportId,
        itemId,
        body: {
          ...editForm,
          designation: editForm.designation.trim(),
          quantity: editForm.quantity.trim(),
          unit_amount: editForm.unit_amount.trim(),
          observations: editForm.observations?.trim() || "",
        },
      }).unwrap();

      setEditingId(null);
      setSuccessMessage("Dépense modifiée avec succès.");
    } catch {
      setErrorMessage("Impossible de modifier cette dépense.");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteItem({ reportId, itemId }).unwrap();

      if (editingId === itemId) {
        setEditingId(null);
      }

      setSuccessMessage("Dépense supprimée avec succès.");
    } catch {
      setErrorMessage("Impossible de supprimer cette dépense.");
    }
  };

  if (loadingItems || loadingSummary) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (itemsError || summaryError || !summary) {
    return (
      <Alert severity="error">
        Impossible de charger les dépenses ou le récapitulatif budgétaire.
      </Alert>
    );
  }

  const budgetStatus =
    {
      WITH_REMAINDER: "Budget disponible",
      FULLY_CONSUMED: "Budget entièrement consommé",
      OVER_BUDGET: "Dépassement budgétaire",
    }[summary.budget_status] ?? summary.budget_status;

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Rapport financier
      </Typography>

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Résumé budgétaire */}
      <Grid container spacing={2}>
        {[
          {
            label: "Référence du décaissement",
            value: summary.schedule_reference,
          },
          {
            label: "Budget autorisé",
            value: formatAmount(summary.budget_amount),
          },
          {
            label: "Total des dépenses",
            value: formatAmount(summary.total_expenses),
          },
          {
            label: "Solde restant",
            value: formatAmount(summary.remaining_amount),
          },
          {
            label: "Dépassement",
            value: formatAmount(summary.overrun_amount),
          },
          {
            label: "Taux de consommation",
            value: `${summary.consumption_rate} %`,
          },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <CommonCard>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </CommonCard>
          </Grid>
        ))}
      </Grid>

      <Alert
        severity={
          summary.budget_status === "OVER_BUDGET"
            ? "error"
            : summary.budget_status === "FULLY_CONSUMED"
              ? "warning"
              : "info"
        }
      >
        Situation budgétaire : {budgetStatus}
      </Alert>

      {/* Bouton d'ouverture du Dialog */}
      {!readOnly && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <CommonBlueButton
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={busy}
            onClick={() => {
              setForm({ ...emptyForm });
              setCreateError(null);
              setOpenCreateDialog(true);
            }}
          >
            Ajouter une dépense
          </CommonBlueButton>
        </Box>
      )}

      {/* Dialog d'ajout */}
      <Dialog
        open={openCreateDialog}
        onClose={() => {
          if (!busy) setOpenCreateDialog(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Ajouter une dépense
          <IconButton
            aria-label="Fermer"
            onClick={() => setOpenCreateDialog(false)}
            disabled={busy}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {createError && (
              <Alert severity="error" onClose={() => setCreateError(null)}>
                {createError}
              </Alert>
            )}

            <TextField
              label="Désignation"
              value={form.designation}
              onChange={(e) => handleFormChange("designation", e.target.value)}
              disabled={busy}
              required
              fullWidth
              autoFocus
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Quantité"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  disabled={busy}
                  slotProps={{ htmlInput: { min: 0, step: "any" } }}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Prix unitaire"
                  type="number"
                  value={form.unit_amount}
                  onChange={(e) =>
                    handleFormChange("unit_amount", e.target.value)
                  }
                  disabled={busy}
                  slotProps={{ htmlInput: { min: 0, step: "any" } }}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Observations"
              value={form.observations ?? ""}
              onChange={(e) => handleFormChange("observations", e.target.value)}
              disabled={busy}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenCreateDialog(false)}
            disabled={busy}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            startIcon={
              creating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            onClick={() => void handleCreate()}
            disabled={busy}
          >
            {creating ? "Ajout en cours..." : "Ajouter la dépense"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tableau des dépenses */}
      <TableContainer component={Paper} variant="outlined">
        <CommonTable>
          <TableHead>
            <TableRow>
              <TableCell>Désignation</TableCell>
              <TableCell align="right">Quantité</TableCell>
              <TableCell align="right">Prix unitaire</TableCell>
              <TableCell align="right">Montant total</TableCell>
              <TableCell>Observations</TableCell>
              <TableCell sx={{ minWidth: 250, fontWeight: 700 }}>
                Pièces justificatives
              </TableCell>
              {!readOnly && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={readOnly ? 6 : 7} align="center">
                  Aucune dépense enregistrée.
                </TableCell>
              </TableRow>
            )}

            {items.map((item) => {
              const editing = editingId === item.id;

              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    {editing ? (
                      <TextField
                        size="small"
                        value={editForm.designation}
                        onChange={(e) =>
                          handleEditChange("designation", e.target.value)
                        }
                        disabled={busy}
                        fullWidth
                      />
                    ) : (
                      item.designation
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {editing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) =>
                          handleEditChange("quantity", e.target.value)
                        }
                        disabled={busy}
                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                        sx={{ minWidth: 90 }}
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {editing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.unit_amount}
                        onChange={(e) =>
                          handleEditChange("unit_amount", e.target.value)
                        }
                        disabled={busy}
                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                        sx={{ minWidth: 120 }}
                      />
                    ) : (
                      formatAmount(item.unit_amount)
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatAmount(item.total_amount)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {editing ? (
                      <TextField
                        size="small"
                        value={editForm.observations ?? ""}
                        onChange={(e) =>
                          handleEditChange("observations", e.target.value)
                        }
                        disabled={busy}
                        multiline
                        minRows={1}
                        fullWidth
                      />
                    ) : (
                      item.observations || "—"
                    )}
                  </TableCell>

                  <TableCell sx={{ minWidth: 250, verticalAlign: "top" }}>
                    <FinancialExpenseAttachments
                      reportId={reportId}
                      financialItemId={item.id}
                      readOnly={readOnly}
                    />
                  </TableCell>

                  {!readOnly && (
                    <TableCell align="right">
                      {editing ? (
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <IconButton
                            color="primary"
                            aria-label="Enregistrer les modifications"
                            disabled={busy}
                            onClick={() => void handleUpdate(item.id)}
                          >
                            <SaveOutlinedIcon />
                          </IconButton>

                          <IconButton
                            aria-label="Annuler la modification"
                            disabled={busy}
                            onClick={() => setEditingId(null)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <IconButton
                            aria-label="Modifier la dépense"
                            disabled={busy}
                            onClick={() => startEdit(item)}
                          >
                            <EditOutlinedIcon />
                          </IconButton>

                          <IconButton
                            color="error"
                            aria-label="Supprimer la dépense"
                            disabled={busy}
                            onClick={() => void handleDelete(item.id)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </CommonTable>
      </TableContainer>
    </Stack>
  );
}
