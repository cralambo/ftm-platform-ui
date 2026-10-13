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
import StrategicPlanFormDialog from "@/features/strategicPlan/StrategicPlanFormDialog";
import {
  useDeleteStrategicPlanMutation,
  useGetStrategicPlansQuery,
} from "@/features/strategicPlan/strategicPlanApi";
import type { StrategicPlan } from "@/features/strategicPlan/strategicPlan.types";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/CommonTable";

export default function StrategicPlanList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetStrategicPlansQuery({
    page,
    size,
  });
  const [deletePlan, { isLoading: deleting }] =
    useDeleteStrategicPlanMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<StrategicPlan | null>(null);
  const [toDelete, setToDelete] = useState<StrategicPlan | null>(null);

  const plans = data?.content ?? [];

  const openForm = (plan: StrategicPlan | null) => {
    setSelected(plan);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePlan(toDelete.id).unwrap();
      notify("Plan stratégique supprimé");
      if (plans.length === 1 && page > 0) setPage(page - 1);
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
          title="Plans stratégiques"
          addLabel="Ajouter un plan"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les plans stratégiques
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Début</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fin</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {plans.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun plan stratégique
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>{plan.code}</TableCell>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{formatDate(plan.start_date)}</TableCell>
                    <TableCell>{formatDate(plan.end_date)}</TableCell>
                    <TableCell
                      title={plan.description}
                      sx={{
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plan.description}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(plan)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(plan)}
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
          <StrategicPlanFormDialog
            plan={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le plan stratégique"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
