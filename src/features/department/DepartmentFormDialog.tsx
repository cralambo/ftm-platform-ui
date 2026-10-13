import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useAddDepartmentMutation, useUpdateDepartmentMutation } from "./departmentApi";
import type { Department, DepartmentInput } from "./department.types";

const schema = Yup.object({
  code: Yup.string().trim().required("Code obligatoire").max(20, "20 caractères max"),
  name: Yup.string().trim().required("Nom obligatoire").max(150, "150 caractères max"),
  description: Yup.string().max(1000, "1000 caractères max"),
});

interface Props {
  department: Department | null; // null = ajout
  onClose: () => void;
}

export default function DepartmentFormDialog({ department, onClose }: Props) {
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const notify = useNotify();

  const formik = useFormik<DepartmentInput>({
    initialValues: {
      code: department?.code ?? "",
      name: department?.name ?? "",
      description: department?.description ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (department) await updateDepartment({ id: department.id, ...values }).unwrap();
        else await addDepartment(values).unwrap();
        notify(department ? "Département modifié" : "Département ajouté");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>
          {department ? "Modifier le département" : "Ajouter un département"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 2 }}>
            <TextField
              label="Code"
              autoFocus
              {...fieldProps(formik, "code")}
              fullWidth={false}
              sx={{ width: { sm: 180 }, flexShrink: 0 }}
            />
            <TextField label="Nom" {...fieldProps(formik, "name")} />
          </Stack>
          <TextField
            label="Description"
            multiline
            minRows={3}
            {...fieldProps(formik, "description")}
          />
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