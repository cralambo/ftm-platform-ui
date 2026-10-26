import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import {
  useCreateActivityMutation,
  useUpdateActivityMutation,
} from "./disbursementApi";

import type {
  ActivityPayload,
  ActivityType,
  DisbursementActivity,
  EntityId,
} from "./disbursement.types";

// =====================================================
// PROPS
// =====================================================

interface Props {
  open: boolean;
  scheduleId: EntityId;
  /** null = création, sinon modification */
  activity: DisbursementActivity | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormValues {
  type: ActivityType;
  name: string;
  description: string;
  target_quantity: string;
  unit: string;
  success_criteria: string;
}

// =====================================================
// VALIDATION
// =====================================================

const schema: Yup.ObjectSchema<FormValues> = Yup.object({
  type: Yup.mixed<ActivityType>()
    .oneOf(["QUANTITATIVE", "QUALITATIVE"])
    .defined()
    .required("Le type est obligatoire"),

  name: Yup.string()
    .trim()
    .required("Le nom est obligatoire")
    .max(255, "255 caractères maximum"),

  description: Yup.string().ensure(),

  target_quantity: Yup.string()
    .ensure()
    .when("type", {
      is: "QUANTITATIVE",
      then: (s) =>
        s
          .required("La cible est obligatoire")
          .test(
            "positive",
            "La cible doit être un nombre supérieur à zéro",
            (value) =>
              value.trim() !== "" &&
              Number.isFinite(Number(value)) &&
              Number(value) > 0,
          ),
    }),

  unit: Yup.string()
    .ensure()
    .when("type", {
      is: "QUANTITATIVE",
      then: (s) =>
        s
          .trim()
          .required("L'unité est obligatoire")
          .max(50, "50 caractères maximum"),
    }),

  success_criteria: Yup.string()
    .ensure()
    .when("type", {
      is: "QUALITATIVE",
      then: (s) => s.trim().required("Le critère de succès est obligatoire"),
    }),
});

// =====================================================
// HELPERS
// =====================================================

function toPayload(values: FormValues): ActivityPayload {
  const common = {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
  };

  if (values.type === "QUANTITATIVE") {
    return {
      type: "QUANTITATIVE",
      ...common,
      target_quantity: Number(values.target_quantity),
      unit: values.unit.trim(),
    };
  }

  return {
    type: "QUALITATIVE",
    ...common,
    success_criteria: values.success_criteria.trim(),
  };
}

function getErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "Une erreur inattendue est survenue.";
  }

  const apiError = error as {
    status?: number | string;
    data?: {
      message?: string;
      detail?: string;
      title?: string;
    };
    error?: string;
  };

  if (apiError.status === 409) {
    return (
      apiError.data?.message ??
      "Conflit : une activité similaire existe déjà ou cette opération est interdite."
    );
  }

  if (apiError.status === 400 || apiError.status === 422) {
    return (
      apiError.data?.message ??
      apiError.data?.detail ??
      "Les données envoyées sont invalides. Vérifie les champs du formulaire."
    );
  }

  if (apiError.status === 401 || apiError.status === 403) {
    return "Tu n'es pas autorisé à effectuer cette opération.";
  }

  return (
    apiError.data?.message ??
    apiError.data?.detail ??
    apiError.data?.title ??
    apiError.error ??
    "Une erreur est survenue. Réessaie."
  );
}

// =====================================================
// COMPONENT
// =====================================================

export default function ActivityFormDialog({
  open,
  scheduleId,
  activity,
  onClose,
  onSaved,
}: Props) {
  const [createActivity, { isLoading: isCreating }] =
    useCreateActivityMutation();

  const [updateActivity, { isLoading: isUpdating }] =
    useUpdateActivityMutation();

  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = activity !== null;
  const isSaving = isCreating || isUpdating;

  // ===================================================
  // FORM INITIALIZATION
  // ===================================================

  const formik = useFormik<FormValues>({
    enableReinitialize: true,

    initialValues: {
      type: activity?.type ?? "QUANTITATIVE",
      name: activity?.name ?? "",
      description: activity?.description ?? "",
      target_quantity:
        activity?.target_quantity != null
          ? String(activity.target_quantity)
          : "",
      unit: activity?.unit ?? "",
      success_criteria: activity?.success_criteria ?? "",
    },

    validationSchema: schema,
    validateOnBlur: true,
    validateOnChange: true,

    onSubmit: async (values, { resetForm }) => {
      setServerError(null);

      try {
        const body = toPayload(values);

        if (activity) {
          await updateActivity({
            id: activity.id,
            scheduleId,
            body,
          }).unwrap();

          onSaved("Activité modifiée avec succès.");
        } else {
          await createActivity({
            scheduleId,
            body,
          }).unwrap();

          onSaved("Activité ajoutée avec succès.");
        }

        resetForm();
        onClose();
      } catch (error: unknown) {
        setServerError(getErrorMessage(error));
      }
    },
  });

  // Réinitialiser l'erreur serveur à l'ouverture du dialogue.
  useEffect(() => {
    if (open) {
      setServerError(null);
    }
  }, [open, activity?.id]);

  // ===================================================
  // HANDLERS
  // ===================================================

  const handleClose = () => {
    if (isSaving) return;

    setServerError(null);
    formik.resetForm();
    onClose();
  };

  const handleTypeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const type = event.target.value as ActivityType;

    void formik.setValues({
      ...formik.values,
      type,
      target_quantity: "",
      unit: "",
      success_criteria: "",
    });

    setServerError(null);
  };

  const field = (name: keyof FormValues) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name]) && Boolean(formik.errors[name]),
    helperText: formik.touched[name] ? formik.errors[name] : undefined,
    fullWidth: true,
    size: "small" as const,
  });

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="activity-dialog-title"
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle id="activity-dialog-title">
          {isEdit ? "Modifier l'activité" : "Ajouter une activité"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {serverError && (
              <Alert
                severity="error"
                role="alert"
                onClose={() => setServerError(null)}
              >
                {serverError}
              </Alert>
            )}

            <TextField
              select
              label="Type d'activité"
              {...field("type")}
              onChange={handleTypeChange}
              disabled={isEdit || isSaving}
              helperText={
                isEdit
                  ? "Le type d'activité ne peut pas être modifié."
                  : formik.touched.type
                    ? formik.errors.type
                    : undefined
              }
              error={
                Boolean(formik.touched.type) && Boolean(formik.errors.type)
              }
            >
              <MenuItem value="QUANTITATIVE">Quantitative</MenuItem>
              <MenuItem value="QUALITATIVE">Qualitative</MenuItem>
            </TextField>

            <TextField
              label="Nom de l'activité"
              {...field("name")}
              autoFocus
              disabled={isSaving}
              slotProps={{
                htmlInput: { maxLength: 255 },
              }}
              required
            />

            <TextField
              label="Description"
              {...field("description")}
              multiline
              minRows={2}
              disabled={isSaving}
              placeholder="Description facultative de l'activité"
            />

            {formik.values.type === "QUANTITATIVE" ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Cible (quantité)"
                  {...field("target_quantity")}
                  type="number"
                  disabled={isSaving}
                  required
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "any",
                    },
                  }}
                />

                <TextField
                  label="Unité"
                  {...field("unit")}
                  disabled={isSaving}
                  required
                  placeholder="Puits, km, personnes…"
                  slotProps={{
                    htmlInput: { maxLength: 50 },
                  }}
                />
              </Stack>
            ) : (
              <TextField
                label="Critère de succès"
                {...field("success_criteria")}
                multiline
                minRows={3}
                disabled={isSaving}
                required
                placeholder="Décris le résultat attendu et vérifiable."
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSaving}>
            Annuler
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || !formik.dirty}
          >
            {isSaving
              ? "Enregistrement..."
              : isEdit
                ? "Enregistrer"
                : "Ajouter"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
