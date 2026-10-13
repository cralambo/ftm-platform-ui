import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import type { Role, RoleInput } from "./role.types";
import { useAddRoleMutation, useUpdateRoleMutation } from "./roleApi";

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
  role: Role | null; // null = ajout
  onClose: () => void;
}

export default function RoleFormDialog({ role, onClose }: Props) {
  const [addRole] = useAddRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const notify = useNotify();

  const formik = useFormik<RoleInput>({
    initialValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (role) await updateRole({ id: role.id, ...values }).unwrap();
        else await addRole(values).unwrap();
        notify(role ? "Rôle modifié" : "Rôle ajouté");
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
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>
          {role ? "Modifier le rôle" : "Ajouter un rôle"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField label="Rôle" {...fieldProps(formik, "name")} />
          <TextField
            label="Description"
            multiline
            rows={5}
            {...fieldProps(formik, "description")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Annuler
          </Button>
          <Button
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
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
