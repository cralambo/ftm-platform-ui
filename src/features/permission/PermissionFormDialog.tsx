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
import type { Permission, PermissionInput } from "./permission.types";
import {
  useAddPermissionMutation,
  useUpdatePermissionMutation,
} from "./permissionApi";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
  description: Yup.string()
    .trim()
    .required("Description obligatoire")
    .max(500, "500 caractères max"),
});

interface Props {
  permission: Permission | null; // null = ajout
  onClose: () => void;
}

export default function PermissionFormDialog({ permission, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [addPermission] = useAddPermissionMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const notify = useNotify();

  const formik = useFormik<PermissionInput>({
    initialValues: {
      name: permission?.name ?? "",
      description: permission?.description ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (permission)
          await updatePermission({ id: permission.id, ...values }).unwrap();
        else await addPermission(values).unwrap();
        notify(permission ? "Permission modifié" : "Permission ajouté");
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
          {permission ? "Modifier le rôle" : "Ajouter un rôle"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            size="small"
            label="Permission"
            {...fieldProps(formik, "name")}
          />
          <TextField
            label="Description"
            multiline
            size="small"
            rows={5}
            {...fieldProps(formik, "description")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CommonGreyButton onClick={onClose} disabled={formik.isSubmitting}>
            Annuler
          </CommonGreyButton>
          <CommonBlueButton
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={
              formik.isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Enregistrer
          </CommonBlueButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
