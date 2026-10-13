import type { ReactNode } from "react";
import {
  Paper,
  Table,
  TableContainer,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import { tokens } from "@/theme";

interface CommonTableProps {
  children: ReactNode;
  size?: "small" | "medium";
  stickyHeader?: boolean;
  sx?: SxProps<Theme>;
}

export default function CommonTable({
  children,
  size = "small",
  stickyHeader = false,
  sx,
}: CommonTableProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={[
        {
          bgcolor: (theme) =>
            theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
          color: "text.primary",
          borderColor: "divider",

          "& .MuiTableCell-root": {
            bgcolor: "transparent",
            color: "inherit",
            borderColor: "divider",
            borderRight: "1px solid",
            borderRightColor: "divider",
          },

          // Supprimer la bordure droite de la dernière colonne
          "& .MuiTableCell-root:last-child": {
            borderRight: 0,
          },

          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 600,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Table size={size} stickyHeader={stickyHeader}>
        {children}
      </Table>
    </TableContainer>
  );
}
