import { tokens } from "@/theme";
import { TablePagination, useTheme } from "@mui/material";

interface CommonTablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
  rowsPerPageOptions?: number[];
}

export default function CommonTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}: CommonTablePaginationProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      onRowsPerPageChange={(event) =>
        onRowsPerPageChange(Number.parseInt(event.target.value, 10))
      }
      labelRowsPerPage="Lignes par page :"
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
        color: "text.primary",
        borderTop: 1,
        borderColor: "divider",
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            color: "text.secondary",
          },
        "& .MuiTablePagination-selectIcon": {
          color: "text.secondary",
        },
        "& .MuiTablePagination-actions button": {
          color: "text.primary",
        },
      }}
    />
  );
}
