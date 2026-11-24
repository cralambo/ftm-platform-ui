import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useGetScheduleActivitiesQuery } from "@/features/disbursement_schedules/disbursementApi";

import {
  useGetTechnicalReportItemsQuery,
  useUpsertTechnicalReportItemMutation,
  type UpsertTechnicalReportItemRequest,
} from "@/features/report/technicalReportApi";

import CommonTable from "@/components/common/CommonTable";
import TechnicalActivityAttachments from "./TechnicalActivityAttachments";
import CommonBlueButton from "@/components/common/CommonBlueButton";

interface TechnicalReportSectionProps {
  reportId: string;
  scheduleId?: string;
  readOnly?: boolean;
}

export default function TechnicalReportSection({
  reportId,
  scheduleId,
  readOnly = false,
}: TechnicalReportSectionProps) {
  const {
    data: activities = [],
    isLoading: loadingActivities,
    error: activitiesError,
  } = useGetScheduleActivitiesQuery(String(scheduleId ?? ""), {
    skip: !scheduleId,
  });

  const {
    data: technicalItems = [],
    isLoading: loadingItems,
    error: itemsError,
  } = useGetTechnicalReportItemsQuery(reportId, {
    skip: !reportId,
  });

  const [saveItem, { isLoading: saving }] =
    useUpsertTechnicalReportItemMutation();

  const [drafts, setDrafts] = useState<
    Record<string, UpsertTechnicalReportItemRequest>
  >({});

  const [savingActivityId, setSavingActivityId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const itemsByActivityId = new Map(
    technicalItems.map((item) => [item.disbursement_activity_id, item]),
  );

  const getValues = (activityId: string): UpsertTechnicalReportItemRequest => {
    const savedItem = itemsByActivityId.get(activityId);

    return (
      drafts[activityId] ?? {
        achieved_quantity: savedItem?.achieved_quantity ?? "",
        achieved_unit: savedItem?.achieved_unit ?? "",
        result_description: savedItem?.result_description ?? "",
        observations: savedItem?.observations ?? "",
      }
    );
  };

  const updateDraft = (
    activityId: string,
    field: keyof UpsertTechnicalReportItemRequest,
    value: string,
  ) => {
    setDrafts((previous) => ({
      ...previous,
      [activityId]: {
        ...getValues(activityId),
        [field]: value,
      },
    }));

    setSaveError(null);
    setSuccessMessage(null);
  };

  const handleSave = async (activityId: string) => {
    const values = getValues(activityId);
    const quantity = values.achieved_quantity?.trim() ?? "";

    if (quantity !== "" && !Number.isFinite(Number(quantity))) {
      setSaveError("La quantité atteinte doit être un nombre valide.");
      return;
    }

    if (quantity !== "" && Number(quantity) < 0) {
      setSaveError("La quantité atteinte ne peut pas être négative.");
      return;
    }

    setSaveError(null);
    setSuccessMessage(null);
    setSavingActivityId(activityId);

    try {
      await saveItem({
        reportId,
        activityId,
        body: {
          achieved_quantity: quantity || null,
          achieved_unit: values.achieved_unit?.trim() || null,
          result_description: values.result_description?.trim() || null,
          observations: values.observations?.trim() || null,
        },
      }).unwrap();

      setDrafts((previous) => {
        const next = { ...previous };
        delete next[activityId];
        return next;
      });

      setSuccessMessage("Résultat technique enregistré avec succès.");
    } catch {
      setSaveError(
        "Échec de l'enregistrement. Vérifiez les données et réessayez.",
      );
    } finally {
      setSavingActivityId(null);
    }
  };

  if (loadingActivities || loadingItems) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (activitiesError || itemsError) {
    return (
      <Alert severity="error">
        Impossible de charger les activités ou les résultats du rapport
        technique.
      </Alert>
    );
  }

  if (activities.length === 0) {
    return (
      <Alert severity="info">
        Aucune activité n'est associée à ce calendrier de décaissement.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Rapport technique
      </Typography>

      {saveError && (
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <CommonTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, fontWeight: 700 }}>
                Activité
              </TableCell>

              <TableCell sx={{ minWidth: 200, fontWeight: 700 }}>
                Cible
              </TableCell>

              <TableCell sx={{ minWidth: 180, fontWeight: 700 }}>
                Résultat atteint
              </TableCell>

              <TableCell sx={{ minWidth: 220, fontWeight: 700 }}>
                Observations
              </TableCell>

              <TableCell sx={{ minWidth: 240, fontWeight: 700 }}>
                Pièces justificatives
              </TableCell>

              {!readOnly && (
                <TableCell
                  align="right"
                  sx={{ minWidth: 130, fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {activities.map((activity) => {
              const activityId = String(activity.id);
              const values = getValues(activityId);
              const rowSaving = savingActivityId === activityId;
              const technicalItem = itemsByActivityId.get(activityId);

              return (
                <TableRow key={activityId} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {activity.name}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {activity.type === "QUANTITATIVE" ? (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activity.target_quantity} {activity.unit}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        {activity.success_criteria || "—"}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {activity.type === "QUANTITATIVE" ? (
                      <TextField
                        size="small"
                        label="Quantité atteinte"
                        type="number"
                        value={values.achieved_quantity ?? ""}
                        onChange={(event) =>
                          updateDraft(
                            activityId,
                            "achieved_quantity",
                            event.target.value,
                          )
                        }
                        disabled={readOnly || rowSaving}
                        fullWidth
                      />
                    ) : (
                      <TextField
                        size="small"
                        label="Résultat obtenu"
                        value={values.result_description ?? ""}
                        onChange={(event) =>
                          updateDraft(
                            activityId,
                            "result_description",
                            event.target.value,
                          )
                        }
                        disabled={readOnly || rowSaving}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      value={values.observations ?? ""}
                      onChange={(event) =>
                        updateDraft(
                          activityId,
                          "observations",
                          event.target.value,
                        )
                      }
                      disabled={readOnly || rowSaving}
                      multiline
                      minRows={2}
                      fullWidth
                      placeholder="Observations éventuelles"
                    />
                  </TableCell>

                  <TableCell>
                    {technicalItem?.id ? (
                      <TechnicalActivityAttachments
                        reportId={reportId}
                        technicalItemId={technicalItem.id}
                        readOnly={readOnly}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {readOnly
                          ? "Aucun fichier joint."
                          : "Enregistrez d'abord le résultat pour joindre un fichier."}
                      </Typography>
                    )}
                  </TableCell>

                  {!readOnly && (
                    <TableCell align="right">
                      <CommonBlueButton
                        size="small"
                        variant="contained"
                        disabled={saving || rowSaving}
                        onClick={() => void handleSave(activityId)}
                      >
                        {rowSaving ? "Enregistrement..." : "Enregistrer"}
                      </CommonBlueButton>
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
