import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  useTheme,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useGetAllDistrictsQuery } from "@/features/district/districtApi";
import {
  useAddMunicipalityMutation,
  useUpdateMunicipalityMutation,
} from "./municipalityApi";
import type { Municipality, MunicipalityInput } from "./municipality.types";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";

const schema = Yup.object({
  districtId: Yup.string().required("District obligatoire"),
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
});

interface Props {
  municipality: Municipality | null; // null = ajout
  onClose: () => void;
}

export default function MunicipalityFormDialog({
  municipality,
  onClose,
}: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: regions = [], isLoading: loadingDistricts } =
    useGetAllDistrictsQuery();
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
        if (municipality)
          await updateMunicipality({ id: municipality.id, ...values }).unwrap();
        else await addMunicipality(values).unwrap();
        notify(municipality ? "Commune modifié" : "Commune ajouté");
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
      maxWidth="xs"
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
          {municipality ? "Modifier la commune" : "Ajouter une commune"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            select
            size="small"
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
          <TextField size="small" label="Nom" {...fieldProps(formik, "name")} />
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
