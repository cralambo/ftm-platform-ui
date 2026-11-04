import type { ReactNode } from "react";
import { Button, type ButtonProps, useTheme } from "@mui/material";
import { tokens } from "@/theme";

interface CommonGreyButtonProps {
  children: ReactNode;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  onClick?: ButtonProps["onClick"];
  type?: ButtonProps["type"];
  fullWidth?: boolean;
}

export default function CommonGreyButton({
  children,
  size = "small",
  variant = "outlined",
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  type = "button",
  fullWidth = false,
}: CommonGreyButtonProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Button
      size={size}
      variant={variant}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      onClick={onClick}
      type={type}
      fullWidth={fullWidth}
      sx={{
        backgroundColor: colors.grey[600],
        color: "#ffffff",
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 1,
        px: 2.5,
        boxShadow: "none",
        alignSelf: "flex-start",
        "&:hover": {
          backgroundColor: colors.grey[700],
          boxShadow: "none",
        },
        "&.Mui-disabled": {
          backgroundColor: colors.grey[700],
          color: colors.grey[400],
        },
      }}
    >
      {children}
    </Button>
  );
}
