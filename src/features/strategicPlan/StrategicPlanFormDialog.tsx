import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import {
  useAddStrategicPlanMutation,
  useUpdateStrategicPlanMutation,
} from "./strategicPlanApi";
import type { StrategicPlan, StrategicPlanInput } from "./strategicPlan.types";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";
import CommonDatePicker from "@/components/common/CommonDatePicker";
import dayjs from "dayjs";

const schema = Yup.object({
  code: Yup.string()
    .trim()
    .required("Code obligatoire")
    .max(20, "20 caractères max"),
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(150, "150 caractères max"),
  start_date: Yup.string().required("Date de début obligatoire"),
  end_date: Yup.string()
    .required("Date de fin obligatoire")
    .test(
      "after-start",
      "La date de fin doit être postérieure à la date de début",
      function (value) {
        const { start_date } = this.parent as { start_date?: string };
        // le format ISO (YYYY-MM-DD) se compare correctement comme du texte
        return !value || !start_date || value >= start_date;
      },
    ),
  description: Yup.string().max(1000, "1000 caractères max"),
});

interface Props {
  plan: StrategicPlan | null; // null = ajout
  onClose: () => void;
}

export default function StrategicPlanFormDialog({ plan, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [addPlan] = useAddStrategicPlanMutation();
  const [updatePlan] = useUpdateStrategicPlanMutation();
  const notify = useNotify();

  const formik = useFormik<StrategicPlanInput>({
    initialValues: {
      code: plan?.code ?? "",
      name: plan?.name ?? "",
      start_date: plan?.start_date?.slice(0, 10) ?? "",
      end_date: plan?.end_date?.slice(0, 10) ?? "",
      description: plan?.description ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (plan) await updatePlan({ id: plan.id, ...values }).unwrap();
        else await addPlan(values).unwrap();
        notify(plan ? "Plan stratégique modifié" : "Plan stratégique ajouté");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog
      open
      onClose={formik.isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      sx={[
        {
          "& .MuiDialog-paper": {
            bgcolor:
              theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
            color: "text.primary",
            backgroundImage: "none",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          },
        },
      ]}
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>
          {plan
            ? "Modifier le plan stratégique"
            : "Ajouter un plan stratégique"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Code"
              size="small"
              sx={{ width: 160, flexShrink: 0 }}
              {...fieldProps(formik, "code")}
              fullWidth={false}
            />
            <TextField
              size="small"
              label="Nom"
              autoFocus
              {...fieldProps(formik, "name")}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <CommonDatePicker
              label="Date de début"
              name="start_date"
              value={formik.values.start_date}
              onChange={(value) => formik.setFieldValue("start_date", value)}
              onBlur={() => formik.setFieldTouched("start_date", true)}
            />
            <CommonDatePicker
              label="Date de fin"
              name="end_date"
              value={formik.values.end_date}
              onChange={(value) => formik.setFieldValue("end_date", value)}
              minDate={
                formik.values.start_date
                  ? dayjs(formik.values.start_date)
                  : undefined
              }
            />
          </Stack>

          <TextField
            label="Description"
            multiline
            minRows={3}
            size="small"
            {...fieldProps(formik, "description")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CommonGreyButton
            onClick={onClose}
            disabled={formik.isSubmitting}
            size="small"
          >
            Annuler
          </CommonGreyButton>
          <CommonBlueButton
            type="submit"
            size="small"
            variant="contained"
            startIcon={
              formik.isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            disabled={formik.isSubmitting}
          >
            Enregistrer
          </CommonBlueButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
