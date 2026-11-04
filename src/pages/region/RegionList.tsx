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
import RegionFormDialog from "@/features/region/RegionFormDialog";
import {
  useDeleteRegionMutation,
  useGetRegionsQuery,
} from "@/features/region/regionApi";
import type { Region } from "@/features/region/region.types";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTableHead from "@/components/CommonTableHead";

export default function RegionList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetRegionsQuery({
    page,
    size,
  });
  const [deleteRegion, { isLoading: deleting }] = useDeleteRegionMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Region | null>(null);
  const [toDelete, setToDelete] = useState<Region | null>(null);

  const regions = data?.content ?? [];

  const openForm = (region: Region | null) => {
    setSelected(region);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteRegion(toDelete.id).unwrap();
      notify("Région supprimée");
      // si on supprime le dernier élément d'une page, on recule d'une page
      if (regions.length === 1 && page > 0) setPage(page - 1);
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
          title="Régions"
          addLabel="Ajouter une région"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les régions
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Région" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {regions.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucune région
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {regions.map((region) => (
                  <TableRow key={region.id} hover>
                    <TableCell>{region.name}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => openForm(region)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(region)}
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
          <RegionFormDialog
            region={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer la région"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
