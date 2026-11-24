import type { ReactNode } from "react";
import { Card, useTheme, type SxProps, type Theme } from "@mui/material";
import { tokens } from "@/theme";

interface CommonCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  padding?: number;
  height?: string | number;
}

export default function CommonCard({
  children,
  sx,
  padding = 2,
  height = "100%",
}: CommonCardProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card
      variant="outlined"
      sx={[
        {
          bgcolor: (theme) =>
            theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
          color: "text.primary",
          p: padding,
          height,
          "& .MuiTableCell-root": {
            bgcolor: "transparent",
            color: "inherit",
            borderColor: "divider",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 600,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Card>
  );
}
