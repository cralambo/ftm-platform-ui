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
  useAddPositionMutation,
  useUpdatePositionMutation,
} from "./positionApi";
import type { Position, PositionInput } from "./position.types";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/CommonGreyButton";
import CommonBlueButton from "@/components/CommonBlueButton";

const schema = Yup.object({
  code: Yup.string()
    .trim()
    .required("Code obligatoire")
    .max(20, "20 caractères max"),
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(150, "150 caractères max"),
});

interface Props {
  position: Position | null; // null = ajout
  onClose: () => void;
}

export default function PositionFormDialog({ position, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [addPosition] = useAddPositionMutation();
  const [updatePosition] = useUpdatePositionMutation();
  const notify = useNotify();

  const formik = useFormik<PositionInput>({
    initialValues: {
      code: position?.code ?? "",
      name: position?.name ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const body = { code: values.code.trim(), name: values.name.trim() };
      try {
        if (position)
          await updatePosition({ id: position.id, ...body }).unwrap();
        else await addPosition(body).unwrap();
        notify(position ? "Poste modifié" : "Poste ajouté");
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
          {position ? "Modifier le poste" : "Ajouter un poste"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            size="small"
            label="Code"
            autoFocus
            {...fieldProps(formik, "code")}
          />
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
