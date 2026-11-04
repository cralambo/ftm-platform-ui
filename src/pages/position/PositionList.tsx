import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import { useNotify } from "@/hooks/useNotify";
import { usePagination } from "@/hooks/usePagination";
import { getErrorMessage } from "@/utils/errors";
import PositionFormDialog from "@/features/position/PositionFormDialog";
import {
  useDeletePositionMutation,
  useGetPositionsQuery,
} from "@/features/position/positionApi";
import type { Position } from "@/features/position/position.types";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/CommonTable";
import CommonTableHead from "@/components/CommonTableHead";

export default function PositionList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetPositionsQuery({
    page,
    size,
  });
  const [deletePosition, { isLoading: deleting }] = useDeletePositionMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Position | null>(null);
  const [toDelete, setToDelete] = useState<Position | null>(null);

  const positions = data?.content ?? [];

  const openForm = (position: Position | null) => {
    setSelected(position);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePosition(toDelete.id).unwrap();
      notify("Poste supprimé");
      if (positions.length === 1 && page > 0) setPage(page - 1);
    } catch (e) {
      notify(getErrorMessage(e), "error");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <>
      <Box sx={{ m: 3 }}>
        <PageHeader
          title="Postes"
          addLabel="Ajouter un poste"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les postes
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Code" },
                  { label: "Nom" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {positions.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun poste
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {positions.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(p)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(p)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CommonTable>

          <CommonTablePagination
            count={data?.totalElements ?? 0}
            page={page}
            rowsPerPage={size}
            onPageChange={setPage}
            onRowsPerPageChange={changeSize}
          />
        </Paper>

        {formOpen && (
          <PositionFormDialog
            position={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le poste"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
