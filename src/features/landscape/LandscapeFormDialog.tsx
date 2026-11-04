import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import {
  useAddLandscapeMutation,
  useUpdateLandscapeMutation,
} from "./landscapeApi";
import type { Landscape, LandscapeInput } from "./landscape.types";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/CommonGreyButton";
import CommonBlueButton from "@/components/CommonBlueButton";

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
});

interface Props {
  landscape: Landscape | null; // null = ajout
  onClose: () => void;
}

export default function LandscapeFormDialog({ landscape, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [addLandscape] = useAddLandscapeMutation();
  const [updateLandscape] = useUpdateLandscapeMutation();
  const notify = useNotify();

  const formik = useFormik<LandscapeInput>({
    initialValues: { name: landscape?.name ?? "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (landscape)
          await updateLandscape({ id: landscape.id, ...values }).unwrap();
        else await addLandscape(values).unwrap();
        notify(landscape ? "Paysage modifiée" : "Paysage ajoutée");
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
          {landscape ? "Modifier le paysage" : "Ajouter un paysage"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            size="small"
            label="Nom"
            autoFocus
            {...fieldProps(formik, "name")}
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
