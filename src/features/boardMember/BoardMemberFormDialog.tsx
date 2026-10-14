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
  useAddBoardMemberMutation,
  useUpdateBoardMemberMutation,
} from "./boardMemberApi";
import type { BoardMember, BoardMemberInput } from "./boardMember.types";

const schema = Yup.object({
  firstname: Yup.string().trim().required("Prénom obligatoire").max(100, "100 caractères max"),
  lastname: Yup.string().trim().required("Nom obligatoire").max(100, "100 caractères max"),
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
  position: Yup.string().trim().required("Poste obligatoire").max(100, "100 caractères max"),
  appointment_date: Yup.string().required("Date de nomination obligatoire"),
  end_date: Yup.string().test(
    "after-appointment",
    "La date de fin doit être postérieure à la date de nomination",
    function (value) {
      const { appointment_date } = this.parent as { appointment_date?: string };
      // champ facultatif ; le format ISO (YYYY-MM-DD) se compare comme du texte
      return !value || !appointment_date || value >= appointment_date;
    }
  ),
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
  member: BoardMember | null; // null = ajout
  onClose: () => void;
}

export default function BoardMemberFormDialog({ member, onClose }: Props) {
  const [addMember] = useAddBoardMemberMutation();
  const [updateMember] = useUpdateBoardMemberMutation();
  const notify = useNotify();

  const formik = useFormik<BoardMemberInput>({
    initialValues: {
      firstname: member?.firstname ?? "",
      lastname: member?.lastname ?? "",
      personal_email: member?.personal_email ?? "",
      professional_email: member?.professional_email ?? "",
      phone: member?.phone ?? "",
      address: member?.address ?? "",
      position: member?.position ?? "",
      appointment_date: member?.appointment_date?.slice(0, 10) ?? "",
      end_date: member?.end_date?.slice(0, 10) ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (member) await updateMember({ id: member.id, ...values }).unwrap();
        else await addMember(values).unwrap();
        notify(member ? "Membre modifié" : "Membre ajouté");
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
          {member ? "Modifier le membre du conseil" : "Ajouter un membre du conseil"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Row>
            <TextField label="Prénom" autoFocus {...fieldProps(formik, "firstname")} />
            <TextField label="Nom" {...fieldProps(formik, "lastname")} />
          </Row>
          <Row>
            <TextField
              label="E-mail professionnel"
              type="email"
              {...fieldProps(formik, "professional_email")}
            />
            <TextField
              label="E-mail personnel"
              type="email"
              {...fieldProps(formik, "personal_email")}
            />
          </Row>
          <Row>
            <TextField label="Téléphone" type="tel" {...fieldProps(formik, "phone")} />
            <TextField label="Poste" {...fieldProps(formik, "position")} />
          </Row>
          <TextField label="Adresse" {...fieldProps(formik, "address")} />
          <Row>
            <TextField
              label="Date de nomination"
              type="date"
              {...fieldProps(formik, "appointment_date")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Date de fin (facultative)"
              type="date"
              {...fieldProps(formik, "end_date")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Row>
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