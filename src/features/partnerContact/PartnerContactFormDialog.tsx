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
import { useGetAllSupportPartnersQuery } from "@/features/partner/supportPartnerApi";
import {
  useAddPartnerContactMutation,
  useUpdatePartnerContactMutation,
} from "./partnerContactApi";
import type {
  PartnerContact,
  PartnerContactInput,
} from "./partnerContact.types";
import CommonGreyButton from "@/components/CommonGreyButton";
import CommonBlueButton from "@/components/CommonBlueButton";
import { tokens } from "@/theme";

const schema = Yup.object({
  support_partner_id: Yup.string().required("Partenaire obligatoire"),
  firstname: Yup.string()
    .trim()
    .required("Prénom obligatoire")
    .max(100, "100 caractères max"),
  lastname: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(100, "100 caractères max"),
  email: Yup.string()
    .trim()
    .email("Adresse e-mail invalide")
    .required("E-mail obligatoire"),
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
  contact: PartnerContact | null; // null = ajout
  onClose: () => void;
}

export default function PartnerContactFormDialog({ contact, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: partners = [], isLoading: loadingPartners } =
    useGetAllSupportPartnersQuery();
  const [addContact] = useAddPartnerContactMutation();
  const [updateContact] = useUpdatePartnerContactMutation();
  const notify = useNotify();

  const formik = useFormik<PartnerContactInput>({
    initialValues: {
      support_partner_id: contact?.supportPartner?.id ?? "",
      firstname: contact?.firstname ?? "",
      lastname: contact?.lastname ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      address: contact?.address ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (contact)
          await updateContact({ id: contact.id, ...values }).unwrap();
        else await addContact(values).unwrap();
        notify(contact ? "Contact modifié" : "Contact ajouté");
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
      maxWidth="sm"
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
          {contact ? "Modifier le contact" : "Ajouter un contact"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            select
            size="small"
            label="Partenaire"
            disabled={loadingPartners}
            {...fieldProps(formik, "support_partner_id")}
          >
            {partners.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
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
