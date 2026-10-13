import { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import type {
  DisbursementSchedule,
  DisbursementScheduleInput,
} from "./disbursementSchedule.types";
import { useAddDisbursementScheduleMutation } from "./disbursementScheduleApi";

const formatAr = (value: number) =>
  `${value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Ar`;

const createSchema = (remaining: number) =>
  Yup.object({
    reference: Yup.string()
      .trim()
      .required("Référence obligatoire")
      .max(20, "20 caractères maximum"),

    disbursement_month: Yup.string().required(
      "Date du décaissement obligatoire",
    ),

    disbursement_amount: Yup.string()
      .required("Montant du décaissement obligatoire")
      .test(
        "number",
        "Montant invalide",
        (value) =>
          value !== undefined &&
          value !== "" &&
          !Number.isNaN(Number(value)) &&
          Number(value) > 0,
      )
      .test(
        "max",
        `Dépasse le solde restant (${formatAr(remaining)})`,
        (value) => Number(value) <= remaining + 0.005,
      ),

    // Calculé automatiquement : on vérifie seulement qu'il est valide
    percentage: Yup.string()
      .required("Pourcentage obligatoire")
      .test(
        "number",
        "Pourcentage invalide (0 à 100)",
        (value) =>
          value !== undefined &&
          value !== "" &&
          !Number.isNaN(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 100,
      ),

    report_submission_date: Yup.string().required(
      "Date d'envoi du rapport obligatoire",
    ),
  });

interface Props {
  disbursementSchedule: DisbursementSchedule | null;
  projectId: string;
  /** Montant total de la subvention (grant_amount) */
  grantAmount: number;
  /** Somme des montants déjà décaissés pour ce projet */
  alreadyDisbursed?: number;
  onClose: () => void;
  /** Optionnel : appelé après un enregistrement réussi */
  onSaved?: () => void;
}

export default function CreateDisbursementScheduleFormDialog({
  disbursementSchedule,
  projectId,
  grantAmount,
  alreadyDisbursed = 0,
  onClose,
  onSaved,
}: Props) {
  const [addDisbursementSchedule] = useAddDisbursementScheduleMutation();

  const notify = useNotify();

  const remaining = Math.max(0, grantAmount - alreadyDisbursed);
  const schema = useMemo(() => createSchema(remaining), [remaining]);

  const formik = useFormik<DisbursementScheduleInput>({
    initialValues: {
      reference: disbursementSchedule?.reference ?? "",
      disbursement_month:
        disbursementSchedule?.disbursement_month?.slice(0, 10) ?? "",
      disbursement_amount: disbursementSchedule?.disbursement_amount ?? "",
      percentage: disbursementSchedule?.percentage ?? "",
      report_submission_date:
        disbursementSchedule?.report_submission_date?.slice(0, 10) ?? "",
      project_id: projectId,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await addDisbursementSchedule(values).unwrap();
        notify("Calendrier de décaissement ajouté");
        onSaved?.();
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  // Pourcentage = montant du décaissement / montant total de la subvention
  const { disbursement_amount } = formik.values;
  const { setFieldValue } = formik;

  useEffect(() => {
    const amount = Number(disbursement_amount);

    if (!grantAmount || disbursement_amount === "" || Number.isNaN(amount)) {
      setFieldValue("percentage", "", false);
      return;
    }

    const percentage = (amount / grantAmount) * 100;
    setFieldValue("percentage", percentage.toFixed(2), false);
  }, [disbursement_amount, grantAmount, setFieldValue]);

  const amountProps = fieldProps(formik, "disbursement_amount");
  const percentageProps = fieldProps(formik, "percentage");

  return (
    <Dialog
      open
      onClose={formik.isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Ajouter un calendrier de décaissement
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Renseignez les informations du décaissement et le délai de
            transmission du rapport.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Informations du décaissement
            </Typography>

            <TextField
              label="Référence"
              placeholder="Ex. S1"
              {...fieldProps(formik, "reference")}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date du décaissement"
                  type="date"
                  {...fieldProps(formik, "disbursement_month")}
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Montant du décaissement (Ar)"
                  type="number"
                  {...amountProps}
                  helperText={
                    amountProps.helperText ||
                    `Solde restant : ${formatAr(remaining)}`
                  }
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: remaining,
                      step: "0.01",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Suivi et rapport
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Pourcentage (%)"
                  {...percentageProps}
                  helperText={
                    percentageProps.helperText ||
                    "Calculé à partir du montant de la subvention"
                  }
                  fullWidth
                  slotProps={{
                    input: { readOnly: true },
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date d'envoi du rapport"
                  type="date"
                  {...fieldProps(formik, "report_submission_date")}
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={formik.isSubmitting}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={
              formik.isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: "none",
              px: 3,
              bgcolor: "#004D95",
              "&:hover": { bgcolor: "#00396F" },
            }}
          >
            {formik.isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
