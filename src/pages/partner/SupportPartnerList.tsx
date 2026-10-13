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
import SupportPartnerFormDialog from "@/features/partner/SupportPartnerFormDialog";
import {
  useDeleteSupportPartnerMutation,
  useGetSupportPartnersQuery,
} from "@/features/partner/supportPartnerApi";
import type { SupportPartner } from "@/features/partner/supportPartner.types";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";

export default function SupportPartnerList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } = useGetSupportPartnersQuery({
    page,
    size,
  });
  const [deleteSupportPartner, { isLoading: deleting }] =
    useDeleteSupportPartnerMutation();
  const notify = useNotify();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<SupportPartner | null>(null);
  const [toDelete, setToDelete] = useState<SupportPartner | null>(null);

  const supportPartners = data?.content ?? [];

  const openForm = (supportPartner: SupportPartner | null) => {
    setSelected(supportPartner);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSupportPartner(toDelete.id).unwrap();
      notify("Partenaire supprimé");
      if (supportPartners.length === 1 && page > 0) setPage(page - 1);
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
          title="Partenaire d'appui"
          addLabel="Ajouter un partenaire"
          onAdd={() => openForm(null)}
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les partenaires
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
                {supportPartners.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun partenaire d'appui
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {supportPartners.map((partner) => (
                  <TableRow key={partner.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {partner.name}
                    </TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {partner.phone ?? "—"}
                    </TableCell>
                    <TableCell>{partner.address}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => openForm(partner)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(partner)}
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
          <SupportPartnerFormDialog
            supportPartner={selected}
            onClose={() => setFormOpen(false)}
          />
        )}

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le partenaire"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      </Box>
    </>
  );
}
