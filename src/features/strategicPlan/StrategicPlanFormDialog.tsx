import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import {
  useAddStrategicPlanMutation,
  useUpdateStrategicPlanMutation,
} from "./strategicPlanApi";
import type { StrategicPlan, StrategicPlanInput } from "./strategicPlan.types";

const schema = Yup.object({
  code: Yup.string().trim().required("Code obligatoire").max(20, "20 caractères max"),
  name: Yup.string().trim().required("Nom obligatoire").max(150, "150 caractères max"),
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
      }
    ),
  description: Yup.string().max(1000, "1000 caractères max"),
});

interface Props {
  plan: StrategicPlan | null; // null = ajout
  onClose: () => void;
}

export default function StrategicPlanFormDialog({ plan, onClose }: Props) {
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
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>
          {plan ? "Modifier le plan stratégique" : "Ajouter un plan stratégique"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack direction="row" spacing={2}>
            <TextField label="Code" sx={{ width: 160, flexShrink: 0 }} {...fieldProps(formik, "code")} fullWidth={false} />
            <TextField label="Nom" autoFocus {...fieldProps(formik, "name")} />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Date de début"
              type="date"
              {...fieldProps(formik, "start_date")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Date de fin"
              type="date"
              {...fieldProps(formik, "end_date")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <TextField
            label="Description"
            multiline
            minRows={3}
            {...fieldProps(formik, "description")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={formik.isSubmitting}>Annuler</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}