import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useAddCoFunderMutation, useUpdateCoFunderMutation } from "./coFunderApi";
import type { CoFunder, CoFunderInput } from "./coFunder.types";

const schema = Yup.object({
  name: Yup.string().trim().required("Nom obligatoire").max(150, "150 caractères max"),
});

interface Props {
  coFunder: CoFunder | null; // null = ajout
  onClose: () => void;
}

export default function CoFunderFormDialog({ coFunder, onClose }: Props) {
  const [addCoFunder] = useAddCoFunderMutation();
  const [updateCoFunder] = useUpdateCoFunderMutation();
  const notify = useNotify();

  const formik = useFormik<CoFunderInput>({
    initialValues: { name: coFunder?.name ?? "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      const body = { name: values.name.trim() };
      try {
        if (coFunder) await updateCoFunder({ id: coFunder.id, ...body }).unwrap();
        else await addCoFunder(body).unwrap();
        notify(coFunder ? "Co-financeur modifié" : "Co-financeur ajouté");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>
          {coFunder ? "Modifier le co-financeur" : "Ajouter un co-financeur"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField label="Nom" autoFocus {...fieldProps(formik, "name")} />
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