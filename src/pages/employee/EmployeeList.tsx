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
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/errors";
import EmployeeFormDialog from "@/features/employee/EmployeeFormDialog";
import {
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
} from "@/features/employee/employeeApi";
import type { Employee } from "@/features/employee/employee.types";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";

export default function EmployeeList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetEmployeesQuery({
    page,
    size,
  });
  const [deleteEmployee, { isLoading: deleting }] = useDeleteEmployeeMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  const employees = data?.content ?? [];

  const openForm = (employee: Employee | null) => {
    setSelected(employee);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteEmployee(toDelete.id).unwrap();
      notify("Employé supprimé");
      if (employees.length === 1 && page > 0) setPage(page - 1);
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
          title="Employés"
          addLabel="Ajouter un employé"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les employés
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sigle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Département</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Poste</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    E-mail professionnel
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Embauche</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun employé
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {employees.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {e.employee_number}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {e.firstname} {e.lastname}
                    </TableCell>
                    <TableCell>{e.acronym ?? "—"}</TableCell>
                    <TableCell>{e.department?.name ?? "—"}</TableCell>
                    <TableCell>{e.position?.name ?? "—"}</TableCell>
                    <TableCell>{e.professional_email}</TableCell>
                    <TableCell>{formatDate(e.hire_date)}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(e)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(e)}
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
          <EmployeeFormDialog
            employee={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer l'employé"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.firstname} ${toDelete?.lastname} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
