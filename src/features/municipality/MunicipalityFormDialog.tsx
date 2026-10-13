import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useGetAllDistrictsQuery } from "@/features/district/districtApi";
import { useAddMunicipalityMutation, useUpdateMunicipalityMutation } from "./municipalityApi";
import type { Municipality, MunicipalityInput } from "./municipality.types";

const schema = Yup.object({
  districtId: Yup.string().required("District obligatoire"),
  name: Yup.string().trim().required("Nom obligatoire").max(100, "100 caractères max"),
});

interface Props {
  municipality: Municipality | null; // null = ajout
  onClose: () => void;
}

export default function MunicipalityFormDialog({ municipality, onClose }: Props) {
  const { data: regions = [], isLoading: loadingDistricts } = useGetAllDistrictsQuery();
  const [addMunicipality] = useAddMunicipalityMutation();
  const [updateMunicipality] = useUpdateMunicipalityMutation();
  const notify = useNotify();

  const formik = useFormik<MunicipalityInput>({
    initialValues: {
      districtId: municipality?.district.id ?? "",
      name: municipality?.name ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (municipality) await updateMunicipality({ id: municipality.id, ...values }).unwrap();
        else await addMunicipality(values).unwrap();
        notify(municipality ? "Commune modifié" : "Commune ajouté");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{municipality ? "Modifier la commune" : "Ajouter une commune"}</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            select
            label="District"
            disabled={loadingDistricts}
            {...fieldProps(formik, "districtId")}
          >
            {regions.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Nom" {...fieldProps(formik, "name")} />
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