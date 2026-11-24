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
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/errors";
import BoardMemberFormDialog from "@/features/boardMember/BoardMemberFormDialog";
import {
  useDeleteBoardMemberMutation,
  useGetBoardMembersQuery,
} from "@/features/boardMember/boardMemberApi";
import type { BoardMember } from "@/features/boardMember/boardMember.types";
import CommonTable from "@/components/common/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTableHead from "@/components/common/CommonTableHead";

export default function BoardMemberList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetBoardMembersQuery({
    page,
    size,
  });
  const [deleteMember, { isLoading: deleting }] =
    useDeleteBoardMemberMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<BoardMember | null>(null);
  const [toDelete, setToDelete] = useState<BoardMember | null>(null);

  const members = data?.content ?? [];

  const openForm = (member: BoardMember | null) => {
    setSelected(member);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMember(toDelete.id).unwrap();
      notify("Membre supprimé");
      if (members.length === 1 && page > 0) setPage(page - 1);
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
          title="Membres du conseil"
          addLabel="Ajouter un membre"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les membres du conseil
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Nom" },
                  { label: "Poste" },
                  { label: "E-mail professionnel" },
                  { label: "Téléphone" },
                  { label: "Nomination" },
                  { label: "Fin" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {members.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun membre du conseil
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {members.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {m.firstname} {m.lastname}
                    </TableCell>
                    <TableCell>{m.position}</TableCell>
                    <TableCell>{m.professional_email}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {m.phone ?? "—"}
                    </TableCell>
                    <TableCell>{formatDate(m.appointment_date)}</TableCell>
                    <TableCell>{formatDate(m.end_date)}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openForm(m)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(m)}
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
          <BoardMemberFormDialog
            member={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le membre du conseil"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.firstname} ${toDelete?.lastname} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
