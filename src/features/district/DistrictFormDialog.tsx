import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useGetAllRegionsQuery } from "@/features/region/regionApi";
import { useAddDistrictMutation, useUpdateDistrictMutation } from "./districtApi";
import type { District, DistrictInput } from "./district.type";

const schema = Yup.object({
  regionId: Yup.string().required("Région obligatoire"),
  code: Yup.string().trim().required("Code obligatoire").max(20, "20 caractères max"),
  name: Yup.string().trim().required("Nom obligatoire").max(100, "100 caractères max"),
});

interface Props {
  district: District | null; // null = ajout
  onClose: () => void;
}

export default function DistrictFormDialog({ district, onClose }: Props) {
  const { data: regions = [], isLoading: loadingRegions } = useGetAllRegionsQuery();
  const [addDistrict] = useAddDistrictMutation();
  const [updateDistrict] = useUpdateDistrictMutation();
  const notify = useNotify();

  const formik = useFormik<DistrictInput>({
    initialValues: {
      regionId: district?.region.id ?? "",
      code: district?.code ?? "",
      name: district?.name ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (district) await updateDistrict({ id: district.id, ...values }).unwrap();
        else await addDistrict(values).unwrap();
        notify(district ? "District modifié" : "District ajouté");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{district ? "Modifier le district" : "Ajouter un district"}</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            select
            label="Région"
            disabled={loadingRegions}
            {...fieldProps(formik, "regionId")}
          >
            {regions.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Code" {...fieldProps(formik, "code")} />
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