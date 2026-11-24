import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
  useTheme,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTable from "@/components/common/CommonTable";

import { useNotify } from "@/hooks/useNotify";
import { usePagination } from "@/hooks/usePagination";
import { getErrorMessage } from "@/utils/errors";

import {
  useDeleteRoleMutation,
  useGetRolesQuery,
  useLazyGetRolePermissionsQuery,
  useAddPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
} from "@/features/role/roleApi";

import { useGetAllPermissionsQuery } from "@/features/permission/permissionApi";

import type { Role } from "@/features/role/role.types";
import type { Permission } from "@/features/permission/permission.types";

import RoleFormDialog from "@/features/role/RoleFormDialog";
import { tokens } from "@/theme";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";
import CommonTableHead from "@/components/common/CommonTableHead";

export default function RoleList() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { page, size, setPage, changeSize } = usePagination();

  const { data, isFetching, isError, refetch } = useGetRolesQuery({
    page,
    size,
  });

  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const [addPermissionToRole] = useAddPermissionToRoleMutation();

  const [removePermissionFromRole] = useRemovePermissionFromRoleMutation();

  const [
    getRolePermissions,
    {
      data: rolePermissions,
      isFetching: loadingRolePermissions,
      isError: rolePermissionsError,
    },
  ] = useLazyGetRolePermissionsQuery();

  const {
    data: permissionsData,
    isLoading: loadingPermissions,
    isError: permissionsError,
  } = useGetAllPermissionsQuery();

  const notify = useNotify();

  // Gestion du formulaire de rôle
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  // Gestion des permissions
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const roles = data?.content ?? [];
  const permissions: Permission[] = permissionsData ?? [];

  // Ouverture du formulaire
  const openForm = (role: Role | null) => {
    setSelected(role);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelected(null);
  };

  // Suppression d'un rôle
  const confirmDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteRole(toDelete.id).unwrap();

      notify("Rôle supprimé");

      if (roles.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await refetch();
      }
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setToDelete(null);
    }
  };

  // Ouverture du dialogue des permissions
  const handleOpenPermissions = async (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissionIds([]);
    setErrorMessage(null);

    try {
      const result = await getRolePermissions(role.id).unwrap();

      setSelectedPermissionIds(result.map((permission) => permission.id));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  // Fermeture du dialogue
  const handleClosePermissions = () => {
    if (isSavingPermissions) return;

    setSelectedRole(null);
    setSelectedPermissionIds([]);
    setErrorMessage(null);
  };

  // Sélection / désélection d'une permission
  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((previous) =>
      previous.includes(permissionId)
        ? previous.filter((id) => id !== permissionId)
        : [...previous, permissionId],
    );
  };

  // Enregistrement des permissions
  const handleSavePermissions = async () => {
    if (!selectedRole || loadingRolePermissions) return;

    setIsSavingPermissions(true);
    setErrorMessage(null);

    try {
      const currentPermissionIds =
        rolePermissions?.map((permission) => permission.id) ?? [];

      const permissionsToAdd = selectedPermissionIds.filter(
        (id) => !currentPermissionIds.includes(id),
      );

      const permissionsToRemove = currentPermissionIds.filter(
        (id) => !selectedPermissionIds.includes(id),
      );

      await Promise.all([
        ...permissionsToAdd.map((permissionId) =>
          addPermissionToRole({
            roleId: selectedRole.id,
            permissionId,
          }).unwrap(),
        ),

        ...permissionsToRemove.map((permissionId) =>
          removePermissionFromRole({
            roleId: selectedRole.id,
            permissionId,
          }).unwrap(),
        ),
      ]);

      notify("Les permissions ont été mises à jour avec succès.");

      setSelectedRole(null);
      setSelectedPermissionIds([]);

      await refetch();
    } catch (error) {
      const message = getErrorMessage(error);

      setErrorMessage(message);
      notify(message, "error");

      // Recharger les permissions réelles après une éventuelle
      // sauvegarde partielle.
      if (selectedRole) {
        try {
          const result = await getRolePermissions(
            selectedRole.id,
            true,
          ).unwrap();

          setSelectedPermissionIds(result.map((permission) => permission.id));
        } catch {
          // Conserver le message d'erreur initial.
        }
      }
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <Box sx={{ m: 3 }}>
      <PageHeader
        title="Rôles"
        addLabel="Ajouter un rôle"
        onAdd={() => openForm(null)}
      />

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={<Button onClick={refetch}>Réessayer</Button>}
        >
          Impossible de charger les rôles.
        </Alert>
      )}

      <Paper variant="outlined">
        <CommonTable>
          {isFetching && <LinearProgress />}

          <Table size="small">
            <CommonTableHead
              columns={[
                { label: "Rôle" },
                { label: "Description" },
                { label: "Actions", align: "right", width: 120 },
              ]}
            />

            <TableBody>
              {roles.length === 0 && !isFetching && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucun rôle</Typography>
                  </TableCell>
                </TableRow>
              )}

              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>{role.name}</TableCell>

                  <TableCell>{role.description || "-"}</TableCell>

                  <TableCell align="right">
                    <Tooltip title="Gérer les permissions">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPermissions(role)}
                      >
                        <SecurityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => openForm(role)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setToDelete(role)}
                      >
                        <DeleteIcon fontSize="small" />
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

      {/* Formulaire de création / modification */}
      {formOpen && <RoleFormDialog role={selected} onClose={closeForm} />}

      {/* Confirmation de suppression */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer le rôle"
        message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      {/* Dialogue de gestion des permissions */}
      <Dialog
        open={Boolean(selectedRole)}
        onClose={handleClosePermissions}
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
              Gestion des permissions
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedRole && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Rôle sélectionné
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {selectedRole.name}
                </Typography>

                {selectedRole.description && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedRole.description}
                  </Typography>
                )}
              </Box>

              <Alert severity="info">
                Cochez les permissions à attribuer et décochez celles à retirer
                de ce rôle.
              </Alert>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Permissions disponibles ({permissions.length})
              </Typography>

              {loadingPermissions || loadingRolePermissions ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : permissionsError || rolePermissionsError ? (
                <Alert severity="error">
                  Impossible de charger les permissions.
                </Alert>
              ) : permissions.length === 0 ? (
                <Typography color="text.secondary">
                  Aucune permission disponible.
                </Typography>
              ) : (
                <Stack
                  spacing={1}
                  sx={{
                    maxHeight: 350,
                    overflowY: "auto",
                  }}
                >
                  {permissions.map((permission) => {
                    const checked = selectedPermissionIds.includes(
                      permission.id,
                    );

                    return (
                      <Box
                        key={permission.id}
                        sx={{
                          p: 1,
                          border: 1,
                          borderColor: checked ? "primary.main" : "divider",
                          borderRadius: 1.5,
                          bgcolor: checked ? "action.selected" : "transparent",
                        }}
                      >
                        <FormControlLabel
                          sx={{ width: "100%", m: 0 }}
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={() =>
                                handleTogglePermission(permission.id)
                              }
                              disabled={isSavingPermissions}
                            />
                          }
                          label={
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {permission.name}
                              </Typography>

                              {permission.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {permission.description}
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
            onClick={handleClosePermissions}
            disabled={isSavingPermissions}
          >
            Annuler
          </CommonGreyButton>

          <CommonBlueButton
            variant="contained"
            onClick={handleSavePermissions}
            disabled={
              isSavingPermissions ||
              loadingPermissions ||
              loadingRolePermissions ||
              Boolean(errorMessage) ||
              !selectedRole
            }
            startIcon={
              isSavingPermissions ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            Enregistrer
          </CommonBlueButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
