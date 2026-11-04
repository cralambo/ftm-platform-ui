import { tokens } from "@/theme";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from "@mui/material";
import CommonGreyButton from "./CommonGreyButton";
import CommonErrorButton from "./CommonErrorButton";

interface Props {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
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
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <CommonGreyButton onClick={onCancel} disabled={loading} size="small">
          Annuler
        </CommonGreyButton>
        <CommonErrorButton
          size="small"
          variant="contained"
          onClick={onConfirm}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          disabled={loading}
        >
          Supprimer
        </CommonErrorButton>
      </DialogActions>
    </Dialog>
  );
}
