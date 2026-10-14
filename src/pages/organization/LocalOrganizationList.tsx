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
import LocalOrganizationFormDialog from "@/features/organization/LocalOrganizationFormDialog";
import {
  useDeleteLocalOrganizationMutation,
  useGetLocalOrganizationsQuery,
} from "@/features/organization/localOrganizationApi";
import type { LocalOrganization } from "@/features/organization/localOrganization.types";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";

export default function LocalOrganizationList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetLocalOrganizationsQuery({
    page,
    size,
  });
  const [deleteLocalOrganization, { isLoading: deleting }] =
    useDeleteLocalOrganizationMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<LocalOrganization | null>(null);
  const [toDelete, setToDelete] = useState<LocalOrganization | null>(null);

  const localOrganizations = data?.content ?? [];

  const openForm = (localOrganization: LocalOrganization | null) => {
    setSelected(localOrganization);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteLocalOrganization(toDelete.id).unwrap();
      notify("Organisation supprimé");
      if (localOrganizations.length === 1 && page > 0) setPage(page - 1);
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
          title="Organisation locale"
          addLabel="Ajouter une organisation"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les organisations
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Téléphone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Adresse</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {localOrganizations.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucune organisation
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {localOrganizations.map((local) => (
                  <TableRow key={local.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {local.name}
                    </TableCell>
                    <TableCell>{local.email}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {local.phone ?? "—"}
                    </TableCell>
                    <TableCell>{local.address}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => openForm(local)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(local)}
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
          <LocalOrganizationFormDialog
            localOrganization={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer l'organisation"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
