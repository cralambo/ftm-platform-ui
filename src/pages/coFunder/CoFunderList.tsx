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
  TableHead,
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
import CoFunderFormDialog from "@/features/coFunder/CoFunderFormDialog";
import {
  useDeleteCoFunderMutation,
  useGetCoFundersQuery,
} from "@/features/coFunder/coFunderApi";
import type { CoFunder } from "@/features/coFunder/coFunder.types";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/CommonTable";

export default function CoFunderList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetCoFundersQuery({
    page,
    size,
  });
  const [deleteCoFunder, { isLoading: deleting }] = useDeleteCoFunderMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<CoFunder | null>(null);
  const [toDelete, setToDelete] = useState<CoFunder | null>(null);

  const coFunders = data?.content ?? [];

  const openForm = (coFunder: CoFunder | null) => {
    setSelected(coFunder);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCoFunder(toDelete.id).unwrap();
      notify("Co-financeur supprimé");
      if (coFunders.length === 1 && page > 0) setPage(page - 1);
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
          title="Co-financeurs"
          addLabel="Ajouter un co-financeur"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les co-financeurs
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {coFunders.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun co-financeur
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {coFunders.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.name}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(c)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(c)}
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
          <CoFunderFormDialog
            coFunder={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le co-financeur"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
