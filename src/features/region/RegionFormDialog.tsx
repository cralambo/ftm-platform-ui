import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useAddRegionMutation, useUpdateRegionMutation } from "./regionApi";
import type { Region, RegionInput } from "./region.types";

const schema = Yup.object({
  name: Yup.string().trim().required("Nom obligatoire").max(100, "100 caractères max"),
});

interface Props {
  region: Region | null; // null = ajout
  onClose: () => void;
}

export default function RegionFormDialog({ region, onClose }: Props) {
  const [addRegion] = useAddRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const notify = useNotify();

  const formik = useFormik<RegionInput>({
    initialValues: { name: region?.name ?? "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (region) await updateRegion({ id: region.id, ...values }).unwrap();
        else await addRegion(values).unwrap();
        notify(region ? "Région modifiée" : "Région ajoutée");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{region ? "Modifier la région" : "Ajouter une région"}</DialogTitle>
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