import type { ReactNode } from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  useTheme,
  type TableCellProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import { tokens } from "@/theme";

interface CommonTableColumn {
  label: ReactNode;
  align?: TableCellProps["align"];
  width?: string | number;
  sx?: SxProps<Theme>;
}

interface CommonTableHeadProps {
  columns: CommonTableColumn[];
  sx?: SxProps<Theme>;
  rowSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
}

export default function CommonTableHead({
  columns,
  sx,
  rowSx,
  cellSx,
}: CommonTableHeadProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <TableHead
      sx={[
        {
          backgroundColor: colors.bluePrimary[600],
          "& .MuiTableCell-root": {
            color: "#ffffff !important",
            fontWeight: 700,
            borderColor: colors.bluePrimary[700],
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <TableRow
        sx={[{}, ...(Array.isArray(rowSx) ? rowSx : rowSx ? [rowSx] : [])]}
      >
        {columns.map((column, index) => (
          <TableCell
            key={index}
            align={column.align ?? "left"}
            sx={[
              {
                width: column.width,
                color: "#ffffff",
                fontWeight: 700,
              },
              ...(Array.isArray(cellSx) ? cellSx : cellSx ? [cellSx] : []),
              ...(Array.isArray(column.sx)
                ? column.sx
                : column.sx
                  ? [column.sx]
                  : []),
            ]}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
