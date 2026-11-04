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
import PartnerContactFormDialog from "@/features/partnerContact/PartnerContactFormDialog";
import {
  useDeletePartnerContactMutation,
  useGetPartnerContactsQuery,
} from "@/features/partnerContact/partnerContactApi";
import type { PartnerContact } from "@/features/partnerContact/partnerContact.types";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/CommonTable";
import CommonTableHead from "@/components/CommonTableHead";

export default function PartnerContactList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetPartnerContactsQuery({
    page,
    size,
  });
  const [deleteContact, { isLoading: deleting }] =
    useDeletePartnerContactMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<PartnerContact | null>(null);
  const [toDelete, setToDelete] = useState<PartnerContact | null>(null);

  const contacts = data?.content ?? [];

  const openForm = (contact: PartnerContact | null) => {
    setSelected(contact);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteContact(toDelete.id).unwrap();
      notify("Contact supprimé");
      if (contacts.length === 1 && page > 0) setPage(page - 1);
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
          title="Responsable des partenaires"
          addLabel="Ajouter un contact"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les contacts
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Nom" },
                  { label: "Partenaire" },
                  { label: "E-mail" },
                  { label: "Téléphone" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />

              <TableBody>
                {contacts.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun contact
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {contacts.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {c.firstname} {c.lastname}
                    </TableCell>
                    <TableCell>{c.supportPartner?.name ?? "—"}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
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
          <PartnerContactFormDialog
            contact={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le contact"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.firstname} ${toDelete?.lastname} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
