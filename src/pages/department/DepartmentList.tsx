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
import DepartmentFormDialog from "@/features/department/DepartmentFormDialog";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "@/features/department/departmentApi";
import type { Department } from "@/features/department/department.types";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTableHead from "@/components/CommonTableHead";

export default function DepartmentList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetDepartmentsQuery({
    page,
    size,
  });
  const [deleteDepartment, { isLoading: deleting }] =
    useDeleteDepartmentMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [toDelete, setToDelete] = useState<Department | null>(null);

  const departments = data?.content ?? [];

  const openForm = (department: Department | null) => {
    setSelected(department);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDepartment(toDelete.id).unwrap();
      notify("Département supprimé");
      if (departments.length === 1 && page > 0) setPage(page - 1);
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
          title="Départements"
          addLabel="Ajouter un département"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les départements
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
                  { label: "Description" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {departments.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun département
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {departments.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.code}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell
                      title={d.description ?? ""}
                      sx={{
                        maxWidth: 360,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.description ?? "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(d)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(d)}
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
          <DepartmentFormDialog
            department={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le département"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
