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
  useAddCoFunderMutation,
  useUpdateCoFunderMutation,
} from "./coFunderApi";
import type { CoFunder, CoFunderInput } from "./coFunder.types";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";
import { tokens } from "@/theme";

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(150, "150 caractères max"),
});

interface Props {
  coFunder: CoFunder | null; // null = ajout
  onClose: () => void;
}

export default function CoFunderFormDialog({ coFunder, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [addCoFunder] = useAddCoFunderMutation();
  const [updateCoFunder] = useUpdateCoFunderMutation();
  const notify = useNotify();

  const formik = useFormik<CoFunderInput>({
    initialValues: { name: coFunder?.name ?? "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      const body = { name: values.name.trim() };
      try {
        if (coFunder)
          await updateCoFunder({ id: coFunder.id, ...body }).unwrap();
        else await addCoFunder(body).unwrap();
        notify(coFunder ? "Co-financeur modifié" : "Co-financeur ajouté");
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
          {coFunder ? "Modifier le co-financeur" : "Ajouter un co-financeur"}
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
