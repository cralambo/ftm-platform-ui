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
import TopicFormDialog from "@/features/topic/TopicFormDialog";
import {
  useDeleteTopicMutation,
  useGetTopicsQuery,
} from "@/features/topic/topicApi";
import type { Topic } from "@/features/topic/topic.types";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/common/CommonTable";
import CommonTableHead from "@/components/common/CommonTableHead";

export default function TopicList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetTopicsQuery({
    page,
    size,
  });
  const [deleteTopic, { isLoading: deleting }] = useDeleteTopicMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [toDelete, setToDelete] = useState<Topic | null>(null);

  const topics = data?.content ?? [];

  const openForm = (topic: Topic | null) => {
    setSelected(topic);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTopic(toDelete.id).unwrap();
      notify("Thématique supprimée");
      if (topics.length === 1 && page > 0) setPage(page - 1);
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
          title="Thématiques"
          addLabel="Ajouter une thématique"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les thématiques
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Nom" },
                  { label: "Description" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {topics.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucune thématique
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {topics.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t.name}
                    </TableCell>
                    <TableCell
                      title={t.description ?? ""}
                      sx={{
                        maxWidth: 420,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.description ?? "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(t)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(t)}
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
          <TopicFormDialog
            topic={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer la thématique"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
