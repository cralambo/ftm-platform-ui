import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from "@mui/material";
import { useNotify } from "@/hooks/useNotify";
import { fieldProps } from "@/utils/formik";
import { getErrorMessage } from "@/utils/errors";
import { useAddTopicMutation, useUpdateTopicMutation } from "./topicApi";
import type { Topic, TopicInput } from "./topic.types";

const schema = Yup.object({
  name: Yup.string().trim().required("Nom obligatoire").max(150, "150 caractères max"),
  description: Yup.string().max(1000, "1000 caractères max"),
});

interface Props {
  topic: Topic | null; // null = ajout
  onClose: () => void;
}

export default function TopicFormDialog({ topic, onClose }: Props) {
  const [addTopic] = useAddTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const notify = useNotify();

  const formik = useFormik<TopicInput>({
    initialValues: {
      name: topic?.name ?? "",
      description: topic?.description ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (topic) await updateTopic({ id: topic.id, ...values }).unwrap();
        else await addTopic(values).unwrap();
        notify(topic ? "Thématique modifiée" : "Thématique ajoutée");
        onClose();
      } catch (e) {
        notify(getErrorMessage(e), "error");
      }
    },
  });

  return (
    <Dialog open onClose={formik.isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{topic ? "Modifier la thématique" : "Ajouter une thématique"}</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField label="Nom" autoFocus {...fieldProps(formik, "name")} />
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