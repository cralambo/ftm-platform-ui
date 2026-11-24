import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "@/components/ConfirmDialog";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PageHeader from "@/components/PageHeader";
import { useNotify } from "@/hooks/useNotify";
import { usePagination } from "@/hooks/usePagination";
import { getErrorMessage } from "@/utils/errors";
import { useDeletePartnerContactMutation } from "@/features/partnerContact/partnerContactApi";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/common/CommonTable";
import CommonTableHead from "@/components/common/CommonTableHead";
import type { UserDetailResponse } from "@/features/user/user.types";
import { useGetAllUsersWithAuthoritiesQuery } from "@/features/user/userApi";
import {
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} from "@/features/user/userApi";
import { useGetAllRolesQuery } from "@/features/role/roleApi";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";

export default function UserList() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } =
    useGetAllUsersWithAuthoritiesQuery({
      page,
      size,
    });
  const [deleteUser, { isLoading: deleting }] =
    useDeletePartnerContactMutation();
  const notify = useNotify();

  const [toDelete, setToDelete] = useState<UserDetailResponse | null>(null);

  const users = data?.content ?? [];

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteUser(toDelete.id).unwrap();
      notify("User supprimé");
      if (users.length === 1 && page > 0) setPage(page - 1);
    } catch (e) {
      notify(getErrorMessage(e), "error");
    } finally {
      setToDelete(null);
    }
  };

  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(
    null,
  );

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: rolesData, isLoading: loadingRoles } = useGetAllRolesQuery();

  const roles = rolesData ?? [];

  const [addRoleToUser] = useAddRoleToUserMutation();
  const [removeRoleFromUser] = useRemoveRoleFromUserMutation();

  const [isSavingRoles, setIsSavingRoles] = useState(false);

  const handleOpenRoles = (user: UserDetailResponse) => {
    setSelectedUser(user);
    setErrorMessage(null);
  };

  const handleCloseRoles = () => {
    if (isSavingRoles) return;

    setSelectedUser(null);
    setSelectedRoleIds([]);
    setErrorMessage(null);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    setIsSavingRoles(true);
    setErrorMessage(null);

    try {
      const currentRoleIds = roles
        .filter((role) =>
          selectedUser.roles.some((userRole) => userRole.id === role.id),
        )
        .map((role) => role.id);

      const rolesToAdd = selectedRoleIds.filter(
        (id) => !currentRoleIds.includes(id),
      );

      const rolesToRemove = currentRoleIds.filter(
        (id) => !selectedRoleIds.includes(id),
      );

      await Promise.all([
        ...rolesToAdd.map((roleId) =>
          addRoleToUser({
            userId: selectedUser.id,
            roleId,
          }).unwrap(),
        ),
        ...rolesToRemove.map((roleId) =>
          removeRoleFromUser({
            userId: selectedUser.id,
            roleId,
          }).unwrap(),
        ),
      ]);

      notify("Les rôles ont été mis à jour avec succès.");
      setSelectedUser(null);
      setSelectedRoleIds([]);

      await refetch();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      notify(getErrorMessage(error), "error");
    } finally {
      setIsSavingRoles(false);
    }
  };

  useEffect(() => {
    if (!selectedUser || !roles.length) return;

    // Correspondance entre les noms de rôles de l'utilisateur
    // et les identifiants des rôles disponibles.
    const assignedRoleIds = roles
      .filter((role) =>
        selectedUser.roles.some((userRole) => userRole.id === role.id),
      )
      .map((role) => role.id);

    setSelectedRoleIds(assignedRoleIds);
  }, [selectedUser, roles]);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((previous) =>
      previous.includes(roleId)
        ? previous.filter((id) => id !== roleId)
        : [...previous, roleId],
    );
  };

  return (
    <>
      <Box sx={{ m: 3 }}>
        <PageHeader
          title="Liste des utilisateurs"
          addLabel="Ajouter un contact"
        />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les utilisateurs
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Nom" },
                  { label: "E-mail" },
                  { label: "Roles" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />

              <TableBody>
                {users.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucune utilisateur
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {u.firstname} {u.lastname}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        sx={{
                          spacing: 0.5,
                          flexWrap: "wrap",
                        }}
                        useFlexGap
                      >
                        {u.roles?.length ? (
                          u.roles.map((role) => (
                            <Chip
                              key={role.id}
                              label={role.name}
                              size="small"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Aucun rôle
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Gérer les rôles">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRoles(u)}
                        >
                          <SecurityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error">
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

        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le contact"
          message={`Voulez-vous vraiment supprimer « ${toDelete?.firstname} ${toDelete?.lastname} » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />

        <Dialog
          open={Boolean(selectedUser)}
          onClose={handleCloseRoles}
          fullWidth
          maxWidth="md"
          sx={[
            {
              "& .MuiDialog-paper": {
                bgcolor:
                  theme.palette.mode === "light"
                    ? "#ffffff"
                    : colors.primary[600],
                color: "text.primary",
                backgroundImage: "none",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              },
              "--scroll-thumb": colors.bluePrimary[600],

              "--scroll-thumb-hover": colors.bluePrimary[400],

              "--scroll-track":
                theme.palette.mode === "dark"
                  ? colors.primary[500]
                  : colors.bluePrimary[100],

              overflowY: "auto",

              "&::-webkit-scrollbar": {
                width: "8px",
              },

              "&::-webkit-scrollbar-track": {
                backgroundColor: "var(--scroll-track)",
                borderRadius: "8px",
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--scroll-thumb)",
                borderRadius: "8px",
                border: "2px solid var(--scroll-track)",
              },

              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "var(--scroll-thumb-hover)",
              },

              scrollbarWidth: "thin",
              scrollbarColor: "var(--scroll-thumb) var(--scroll-track)",
            },
          ]}
        >
          <DialogTitle>
            <Stack direction="row" sx={{ spacing: 1, alignItems: "center" }}>
              <SecurityOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Gestion des rôles
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            {selectedUser && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Utilisateur sélectionné
                  </Typography>

                  <Typography sx={{ fontWeight: 600 }}>
                    {selectedUser.firstname} {selectedUser.lastname}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>

                <Alert severity="info">
                  Cochez les rôles à attribuer et décochez ceux à retirer.
                </Alert>

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Rôles disponibles ({roles.length})
                </Typography>

                {loadingRoles ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 3 }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : roles.length === 0 ? (
                  <Typography color="text.secondary">
                    Aucun rôle disponible.
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ maxHeight: 350, overflowY: "auto" }}>
                    {roles.map((role) => {
                      const checked = selectedRoleIds.includes(role.id);

                      return (
                        <Box
                          key={role.id}
                          sx={{
                            p: 1,
                            border: 1,
                            borderColor: checked ? "primary.main" : "divider",
                            borderRadius: 1.5,
                            bgcolor: checked
                              ? "action.selected"
                              : "transparent",
                          }}
                        >
                          <FormControlLabel
                            sx={{ width: "100%", m: 0 }}
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={() => handleToggleRole(role.id)}
                                disabled={isSavingRoles}
                              />
                            }
                            label={
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {role.name}
                                </Typography>

                                {role.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {role.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <CommonGreyButton
              variant="outlined"
              onClick={handleCloseRoles}
              disabled={isSavingRoles}
            >
              Annuler
            </CommonGreyButton>

            <CommonBlueButton
              variant="contained"
              onClick={handleSaveRoles}
              disabled={isSavingRoles || loadingRoles || !selectedUser}
              startIcon={
                isSavingRoles ? (
                  <CircularProgress size={18} color="inherit" />
                ) : undefined
              }
            >
              Enregistrer
            </CommonBlueButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
