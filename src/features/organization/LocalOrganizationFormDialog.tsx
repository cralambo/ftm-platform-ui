import type { ReactNode } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import {
  useAddLocalOrganizationMutation,
  useUpdateLocalOrganizationMutation,
} from "./localOrganizationApi";
import type {
  LocalOrganization,
  LocalOrganizationInput,
} from "./localOrganization.types";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
  email: Yup.string().trim().email("Adresse e-mail invalide"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+()\s.-]*$/, "Numéro de téléphone invalide")
    .max(30, "30 caractères max"),
  address: Yup.string().max(255, "255 caractères max"),
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
  localOrganization: LocalOrganization | null; // null = ajout
  onClose: () => void;
}

export default function LocalOrganizationFormDialog({
  localOrganization,
  onClose,
}: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [addLocalOrganization] = useAddLocalOrganizationMutation();
  const [updateLocalOrganization] = useUpdateLocalOrganizationMutation();
  const notify = useNotify();

  const formik = useFormik<LocalOrganizationInput>({
    initialValues: {
      name: localOrganization?.name ?? "",
      address: localOrganization?.address ?? "",
      phone: localOrganization?.phone ?? "",
      email: localOrganization?.email ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (localOrganization)
          await updateLocalOrganization({
            id: localOrganization.id,
            ...values,
          }).unwrap();
        else await addLocalOrganization(values).unwrap();
        notify(
          localOrganization ? "Organisation modifié" : "Organisation ajouté",
        );
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
          {localOrganization
            ? "Modifier l'organisation"
            : "Ajouter une organisation"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField size="small" label="Nom" {...fieldProps(formik, "name")} />
          <Row>
            <TextField
              label="E-mail"
              type="email"
              size="small"
              {...fieldProps(formik, "email")}
            />
            <TextField
              label="Téléphone"
              type="tel"
              size="small"
              {...fieldProps(formik, "phone")}
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
