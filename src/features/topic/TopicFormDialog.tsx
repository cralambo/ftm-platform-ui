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
import { useAddTopicMutation, useUpdateTopicMutation } from "./topicApi";
import type { Topic, TopicInput } from "./topic.types";
import CommonGreyButton from "@/components/CommonGreyButton";
import CommonBlueButton from "@/components/CommonBlueButton";
import { tokens } from "@/theme";

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Nom obligatoire")
    .max(150, "150 caractères max"),
  description: Yup.string().max(1000, "1000 caractères max"),
});

interface Props {
  topic: Topic | null; // null = ajout
  onClose: () => void;
}

export default function TopicFormDialog({ topic, onClose }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
          {topic ? "Modifier la thématique" : "Ajouter une thématique"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            size="small"
            label="Nom"
            autoFocus
            {...fieldProps(formik, "name")}
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            size="small"
            {...fieldProps(formik, "description")}
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
