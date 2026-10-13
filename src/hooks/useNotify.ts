import { useCallback } from "react";
import type { AlertColor } from "@mui/material";
import { useAppDispatch } from "@/app/hooks";
import { showSnackbar } from "@/features/ui/uiSlice";

export function useNotify() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, severity: AlertColor = "success") =>
      dispatch(showSnackbar({ message, severity })),
    [dispatch]
  );
}