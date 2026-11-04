import type { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  type DialogProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "@/theme";

interface CommonDialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  fullScreen?: boolean;
  disableClose?: boolean;
  contentSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
}

export default function CommonDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullScreen = false,
  disableClose = false,
  contentSx,
  titleSx,
  actionsSx,
  sx,
}: CommonDialogProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Dialog
      open={open}
      onClose={disableClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
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
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {title && (
        <DialogTitle
          sx={[
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 600,
              borderBottom: 1,
              borderColor: "divider",
              pr: 1,
            },
            ...(Array.isArray(titleSx) ? titleSx : titleSx ? [titleSx] : []),
          ]}
        >
          {title}

          {!disableClose && (
            <IconButton
              aria-label="Fermer"
              onClick={onClose}
              size="small"
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent
        dividers
        sx={[
          {
            borderColor: "divider",
            py: 2,
          },
          ...(Array.isArray(contentSx)
            ? contentSx
            : contentSx
              ? [contentSx]
              : []),
        ]}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={[
            {
              px: 3,
              py: 2,
              borderTop: 1,
              borderColor: "divider",
            },
            ...(Array.isArray(actionsSx)
              ? actionsSx
              : actionsSx
                ? [actionsSx]
                : []),
          ]}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
