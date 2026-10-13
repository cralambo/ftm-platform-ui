import { Alert, Snackbar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { hideSnackbar } from "@/features/ui/uiSlice";

export default function AppSnackbar() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((s) => s.ui.snackbar);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={(_, reason) => reason !== "clickaway" && dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert severity={severity} variant="filled" onClose={() => dispatch(hideSnackbar())}>
        {message}
      </Alert>
    </Snackbar>
  );
}