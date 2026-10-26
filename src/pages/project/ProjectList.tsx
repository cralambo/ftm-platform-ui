import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
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
import VisibilityIcon from "@mui/icons-material/Visibility";

import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import CommonTable from "@/components/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";

import { useNotify } from "@/hooks/useNotify";
import { usePagination } from "@/hooks/usePagination";

import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/date";

import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useGetMyPartnerProjectsQuery,
} from "@/features/project/projectApi";

import type { Project } from "@/features/project/project.types";
import { formatCents, toCents } from "@/features/project/budget";
import { statusMeta } from "@/features/project/projectStatus";

import type { RootState } from "@/app/store";

export default function ProjectList() {
  const navigate = useNavigate();
  const notify = useNotify();

  const { page, size, setPage, changeSize } = usePagination();

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const user = useSelector((state: RootState) => state.auth.user);

  const isPartnerContact = user?.userType === "PARTNER_CONTACT";

  // =========================================================
  // PROJECT QUERIES
  // =========================================================

  // Utilisateurs classiques : GET /projects
  const regularQuery = useGetProjectsQuery(
    { page, size },
    {
      skip: !user || isPartnerContact,
    },
  );

  // Contact partenaire : GET /projects/partner
  const partnerQuery = useGetMyPartnerProjectsQuery(
    { page, size },
    {
      skip: !user || !isPartnerContact,
    },
  );

  // Sélection de la requête correspondant à l'utilisateur
  const { data, isFetching, isError, refetch } = isPartnerContact
    ? partnerQuery
    : regularQuery;

  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();

  const [toDelete, setToDelete] = useState<Project | null>(null);

  const projects = data?.content ?? [];

  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete = async () => {
    if (!toDelete) {
      return;
    }

    try {
      await deleteProject(toDelete.id).unwrap();

      notify("Projet supprimé avec succès");

      if (projects.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setToDelete(null);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (project: Project) => {
    navigate("/projects/create", {
      state: { project },
    });
  };

  // =========================================================
  // VIEW
  // =========================================================

  const handleView = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box sx={{ m: 3 }}>
      <PageHeader
        title="Projets"
        {...(!isPartnerContact && {
          addLabel: "Ajouter un projet",
          onAdd: () => navigate("/projects/create"),
        })}
      />

      {/* ERROR */}
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={<Button onClick={refetch}>Réessayer</Button>}
        >
          Impossible de charger les projets.
        </Alert>
      )}

      {/* TABLE */}
      <Paper variant="outlined">
        <CommonTable>
          {isFetching && <LinearProgress />}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Convention</TableCell>

                <TableCell sx={{ fontWeight: 600 }}>Projet</TableCell>

                <TableCell sx={{ fontWeight: 600 }}>
                  Partenaire d'appui
                </TableCell>

                <TableCell sx={{ fontWeight: 600 }}>Date d'octroi</TableCell>

                <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>

                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>

                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!user && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Veuillez vous connecter pour consulter les projets.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {user && projects.length === 0 && !isFetching && !isError && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucun projet</Typography>
                  </TableCell>
                </TableRow>
              )}

              {projects.map((project) => {
                const status = statusMeta(project.status);

                return (
                  <TableRow key={project.id} hover>
                    {/* Convention */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {project.agreement_number || "—"}
                    </TableCell>

                    {/* Projet */}
                    <TableCell
                      title={project.title}
                      sx={{
                        maxWidth: 320,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {project.title}
                    </TableCell>

                    {/* Partenaire d'appui */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {project.support_partner?.name ?? "—"}
                    </TableCell>

                    {/* Date d'octroi */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(project.granted_project?.grant_date)}
                    </TableCell>

                    {/* Budget */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {project.granted_project
                        ? formatCents(
                            toCents(project.granted_project.grant_amount),
                          )
                        : "—"}
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={status.label}
                        color={status.color}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Voir le détail">
                        <IconButton
                          size="small"
                          onClick={() => handleView(project)}
                          aria-label="Voir le détail du projet"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      {!isPartnerContact && (
                        <>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(project)}
                              aria-label="Modifier le projet"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setToDelete(project)}
                              aria-label="Supprimer le projet"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CommonTable>

        {/* PAGINATION */}
        <CommonTablePagination
          count={data?.totalElements ?? 0}
          page={page}
          rowsPerPage={size}
          onPageChange={setPage}
          onRowsPerPageChange={changeSize}
        />
      </Paper>

      {/* DELETE DIALOG */}
      {!isPartnerContact && (
        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Supprimer le projet"
          message={`Voulez-vous vraiment supprimer « ${
            toDelete?.title ?? ""
          } » ? Cette action est irréversible.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </Box>
  );
}
