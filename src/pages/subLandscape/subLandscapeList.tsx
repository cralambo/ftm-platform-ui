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
import {
  useDeleteSubLandscapeMutation,
  useGetSubLandscapesQuery,
} from "@/features/subLandscape/subLandscapeApi";
import type { SubLandscape } from "@/features/subLandscape/subLandscape.types";
import SubLandscapeFormDialog from "@/features/subLandscape/SubLandscapeFormDialog";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";

export default function SubLandscapeList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetSubLandscapesQuery({
    page,
    size,
  });
  const [deleteSubLandscape, { isLoading: deleting }] =
    useDeleteSubLandscapeMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<SubLandscape | null>(null);
  const [toDelete, setToDelete] = useState<SubLandscape | null>(null);

  const subLandscapes = data?.content ?? [];

  const openForm = (subLandscape: SubLandscape | null) => {
    setSelected(subLandscape);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSubLandscape(toDelete.id).unwrap();
      notify("Sous-paysage supprimé");
      // si on supprime le dernier élément d'une page, on recule d'une page
      if (subLandscapes.length === 1 && page > 0) setPage(page - 1);
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
          title="Sous-paysage"
          addLabel="Ajouter un sous-paysage"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les sous-paysages
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Sous-paysage</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Paysage</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {subLandscapes.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun sous-paysage
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {subLandscapes.map((subLandscape) => (
                  <TableRow key={subLandscape.id} hover>
                    <TableCell>{subLandscape.name}</TableCell>
                    <TableCell>{subLandscape.landscape.name}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => openForm(subLandscape)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(subLandscape)}
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
          <SubLandscapeFormDialog
            subLandscape={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le sous-paysage"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
