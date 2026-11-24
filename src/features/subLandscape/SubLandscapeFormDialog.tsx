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
import { useGetAllLandscapesQuery } from "@/features/landscape/landscapeApi";
import {
  useAddSubLandscapeMutation,
  useUpdateSubLandscapeMutation,
} from "./subLandscapeApi";
import type { SubLandscape, SubLandscapeInput } from "./subLandscape.types";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";

const schema = Yup.object({
  landscapeId: Yup.string().required("Paysage obligatoire"),
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
});

interface Props {
  subLandscape: SubLandscape | null; // null = ajout
  onClose: () => void;
}

export default function SubLandscapeFormDialog({
  subLandscape,
  onClose,
}: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: landscapes = [], isLoading: loadingLandscapes } =
    useGetAllLandscapesQuery();
  const [addSubLandscape] = useAddSubLandscapeMutation();
  const [updateSubLandscape] = useUpdateSubLandscapeMutation();
  const notify = useNotify();

  const formik = useFormik<SubLandscapeInput>({
    initialValues: {
      landscapeId: subLandscape?.landscape.id ?? "",
      name: subLandscape?.name ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (subLandscape)
          await updateSubLandscape({ id: subLandscape.id, ...values }).unwrap();
        else await addSubLandscape(values).unwrap();
        notify(subLandscape ? "Sous paysage modifié" : "Sous paysage ajouté");
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
          {subLandscape
            ? "Modifier le sous-paysage"
            : "Ajouter un sous-paysage"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            select
            size="small"
            label="Paysage"
            disabled={loadingLandscapes}
            {...fieldProps(formik, "landscapeId")}
          >
            {landscapes.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Nom" {...fieldProps(formik, "name")} />
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
