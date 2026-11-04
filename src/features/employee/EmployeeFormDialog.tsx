import type { ReactNode } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useGetAllDepartmentsQuery } from "@/features/department/departmentApi";
import { useGetAllPositionsQuery } from "@/features/position/positionApi";
import {
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
} from "./employeeApi";
import type { Employee, EmployeeInput } from "./employee.types";
import CommonGreyButton from "@/components/CommonGreyButton";
import CommonBlueButton from "@/components/CommonBlueButton";
import { tokens } from "@/theme";
import CommonDatePicker from "@/components/common/CommonDatePicker";

const schema = Yup.object({
  firstname: Yup.string()
    .trim()
    .required("Prénom obligatoire")
    .max(100, "100 caractères max"),
  lastname: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
  employee_number: Yup.string()
    .trim()
    .required("Numéro d'employé obligatoire")
    .max(30, "30 caractères max"),
  acronym: Yup.string().trim().max(20, "20 caractères max"),
  professional_email: Yup.string()
    .trim()
    .email("Adresse e-mail invalide")
    .required("E-mail professionnel obligatoire"),
  personal_email: Yup.string().trim().email("Adresse e-mail invalide"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+()\s.-]*$/, "Numéro de téléphone invalide")
    .max(30, "30 caractères max"),
  address: Yup.string().max(255, "255 caractères max"),
  hire_date: Yup.string().required("Date d'embauche obligatoire"),
  department_id: Yup.string().required("Département obligatoire"),
  position_id: Yup.string().required("Poste obligatoire"),
});

// Deux champs côte à côte sur écran large, empilés sur mobile
function Row({ children }: { children: ReactNode }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 2 }}>
      {children}
    </Stack>
  );
}

interface Props {
  employee: Employee | null; // null = ajout
  onClose: () => void;
}

export default function EmployeeFormDialog({ employee, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: departments = [], isLoading: loadingDepartments } =
    useGetAllDepartmentsQuery();
  const { data: positions = [], isLoading: loadingPositions } =
    useGetAllPositionsQuery();
  const [addEmployee] = useAddEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const notify = useNotify();

  const formik = useFormik<EmployeeInput>({
    initialValues: {
      firstname: employee?.firstname ?? "",
      lastname: employee?.lastname ?? "",
      employee_number: employee?.employee_number ?? "",
      acronym: employee?.acronym ?? "",
      personal_email: employee?.personal_email ?? "",
      professional_email: employee?.professional_email ?? "",
      phone: employee?.phone ?? "",
      address: employee?.address ?? "",
      hire_date: employee?.hire_date?.slice(0, 10) ?? "",
      department_id: employee?.department?.id ?? "",
      position_id: employee?.position?.id ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (employee)
          await updateEmployee({ id: employee.id, ...values }).unwrap();
        else await addEmployee(values).unwrap();
        notify(employee ? "Employé modifié" : "Employé ajouté");
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
      maxWidth="md"
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
          {employee ? "Modifier l'employé" : "Ajouter un employé"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Row>
            <TextField
              label="Prénom"
              size="small"
              autoFocus
              {...fieldProps(formik, "firstname")}
            />
            <TextField
              size="small"
              label="Nom"
              {...fieldProps(formik, "lastname")}
            />
          </Row>
          <Row>
            <TextField
              label="Matricule"
              size="small"
              {...fieldProps(formik, "employee_number")}
            />
            <TextField
              label="Sigle"
              size="small"
              {...fieldProps(formik, "acronym")}
            />
          </Row>
          <Row>
            <TextField
              select
              size="small"
              label="Département"
              disabled={loadingDepartments}
              {...fieldProps(formik, "department_id")}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Poste"
              disabled={loadingPositions}
              {...fieldProps(formik, "position_id")}
            >
              {positions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Row>
          <Row>
            <TextField
              label="E-mail professionnel"
              size="small"
              type="email"
              {...fieldProps(formik, "professional_email")}
            />
            <TextField
              label="E-mail personnel (facultatif)"
              type="email"
              size="small"
              {...fieldProps(formik, "personal_email")}
            />
          </Row>
          <Row>
            <TextField
              label="Téléphone"
              size="small"
              type="tel"
              {...fieldProps(formik, "phone")}
            />
            <CommonDatePicker
              label="Date d'embauche"
              name="hire_date"
              value={formik.values.hire_date}
              onChange={(value) => formik.setFieldValue("hire_date", value)}
              onBlur={() => formik.setFieldTouched("hire_date", true)}
            />
            <TextField
              label="Date d'embauche"
              type="date"
              size="small"
              {...fieldProps(formik, "hire_date")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Row>
          <TextField
            size="small"
            label="Adresse"
            {...fieldProps(formik, "address")}
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
