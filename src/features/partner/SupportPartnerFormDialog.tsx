import type { ReactNode } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import {
  useAddSupportPartnerMutation,
  useUpdateSupportPartnerMutation,
} from "./supportPartnerApi";
import type { SupportPartner, SupportPartnerInput } from "./supportPartner.types";

const schema = Yup.object({
  name: Yup.string().trim().required("Nom obligatoire").max(100, "100 caractères max"),
  email: Yup.string()
    .trim()
    .email("Adresse e-mail invalide"),
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
  supportPartner: SupportPartner | null; // null = ajout
  onClose: () => void;
}

export default function SupportPartnerFormDialog({ supportPartner, onClose }: Props) {
  const [addSUpportPartner] = useAddSupportPartnerMutation();
  const [updateSupportPartner] = useUpdateSupportPartnerMutation();
  const notify = useNotify();

  const formik = useFormik<SupportPartnerInput>({
    initialValues: {
      name: supportPartner?.name ?? "",
      address: supportPartner?.address ?? "",
      phone: supportPartner?.phone ?? "",
      email: supportPartner?.email ?? ""
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (supportPartner) await updateSupportPartner({ id: supportPartner.id, ...values }).unwrap();
        else await addSUpportPartner(values).unwrap();
        notify(supportPartner ? "Partenaire modifié" : "Partenaire ajouté");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>
          {supportPartner ? "Modifier le partenaire" : "Ajouter un partenaire"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
            <TextField label="Nom" {...fieldProps(formik, "name")} />
          <Row>
            <TextField
              label="E-mail"
              type="email"
              {...fieldProps(formik, "email")}
            />
            <TextField label="Téléphone" type="tel" {...fieldProps(formik, "phone")} />
          </Row>
          <TextField label="Adresse" {...fieldProps(formik, "address")} />
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