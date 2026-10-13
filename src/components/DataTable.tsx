import type { ReactNode } from "react";
import {
  IconButton, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Tooltip, Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => number | string;
  total: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export default function DataTable<T>({
  rows, columns, getId, total, page, rowsPerPage, loading,
  onPageChange, onRowsPerPageChange, onEdit, onDelete,
}: Props<T>) {
  return (
    <Paper variant="outlined">
      <TableContainer>
        {loading && <LinearProgress />}
        <Table size="medium">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.header} sx={{ fontWeight: 600 }}>{c.header}</TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Aucun élément</Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={getId(row)} hover>
                {columns.map((c) => (
                  <TableCell key={c.header}>{c.render(row)}</TableCell>
                ))}
                <TableCell align="right">
                  <Tooltip title="Modifier">
                    <IconButton onClick={() => onEdit(row)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => onDelete(row)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        labelRowsPerPage="Lignes par page :"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
      />
    </Paper>
  );
}