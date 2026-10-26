import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/errors";

import { computeBudget, formatCents, toCents } from "./budget";
import { useGetProjectByIdQuery } from "./projectApi";
import { statusMeta } from "./projectStatus";
import type { DisbursementSchedule } from "../disbursement_schedules/disbursementSchedule.types";
import CreateDisbursementScheduleFormDialog from "../disbursement_schedules/CreateDisbursementScheduleFormDialog";
import { tokens } from "@/theme";
import CommonTable from "@/components/CommonTable";

// =========================================================
// COMPOSANTS LOCAUX
// =========================================================

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
      }}
    >
      <CardContent>
        <Typography variant="h6">{title}</Typography>

        {subtitle && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {subtitle}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {children}
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ mt: 0.25, wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function Kpi({
  label,
  value,
  hint,
  error,
}: {
  label: string;
  value: string;
  hint?: string;
  error?: boolean;
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
        color: "text.primary",
        "& .MuiTableCell-root": {
          bgcolor: "transparent",
          color: "inherit",
          borderColor: "divider",
        },
        "& .MuiTableHead-root .MuiTableCell-root": {
          fontWeight: 600,
        },
        p: 2,
        height: "100%",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mt: 0.5,
          color: error ? "error.main" : "text.primary",
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Box
        sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }}
      />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}

// Les montants arrivent en chaînes ("5000000.00") : on les formate via les centimes
const money = (value?: string | number | null) => formatCents(toCents(value));

// =========================================================
// PAGE
// =========================================================

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<DisbursementSchedule | null>(null);

  const openForm = (disbursementSchedule: DisbursementSchedule | null) => {
    setSelected(disbursementSchedule);
    setFormOpen(true);
  };

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectByIdQuery(id, {
    skip: !id,
  });

  const goBack = () => navigate("/projects");

  // -------------------------------------------------------
  // Chargement / erreur
  // -------------------------------------------------------

  if (isLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        <Skeleton variant="text" width={260} height={48} />
        <Skeleton variant="rounded" height={140} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (isError || !project) {
    const notFound = (error as { status?: number } | undefined)?.status === 404;
    return (
      <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mb: 2 }}>
          Retour aux projets
        </Button>
        <Alert
          severity="error"
          action={!notFound && <Button onClick={refetch}>Réessayer</Button>}
        >
          {notFound
            ? "Projet introuvable"
            : getErrorMessage(error, "Impossible de charger le projet")}
        </Alert>
      </Box>
    );
  }

  // -------------------------------------------------------
  // Calculs du financement
  // -------------------------------------------------------

  const status = statusMeta(project.status);
  const coFunders = project.project_co_funders ?? [];
  const grant = project.granted_project;
  const disbursement_schedules = [
    ...(project.disbursement_schedules ?? []),
  ].sort((a, b) =>
    a.reference.localeCompare(b.reference, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  // co_funders_contribution est null côté API : on recalcule depuis les lignes
  const budget = computeBudget({
    own_funds: project.own_funds,
    grant_amount: grant?.grant_amount ?? "",
    co_funders: coFunders,
  });

  const exceeded = budget.granted > 0 && budget.balance < 0;
  const pct = (cents: number) =>
    budget.granted > 0 ? Math.min(100, (cents / budget.granted) * 100) : 0;

  // -------------------------------------------------------
  // Calculs du calendrier de décaissement (en centimes, sans erreur d'arrondi)
  // -------------------------------------------------------

  // Montant total de la subvention, en unité monétaire (Ar)
  const grantAmount = budget.granted / 100;

  // Somme des décaissements déjà planifiés
  const disbursedCents = disbursement_schedules.reduce(
    (sum, d) => sum + toCents(d.disbursement_amount),
    0,
  );
  const alreadyDisbursed = disbursedCents / 100;

  const disbursedPct =
    budget.granted > 0 ? (disbursedCents / budget.granted) * 100 : 0;

  // Le calendrier est complet quand tout le montant d'octroi est réparti
  const isFullyDisbursed =
    budget.granted > 0 && disbursedCents >= budget.granted;

  // Pas d'octroi => impossible de calculer le pourcentage
  const addDisabled = !grant || isFullyDisbursed;
  const addDisabledReason = !grant
    ? "Aucun octroi n'est enregistré pour ce projet"
    : isFullyDisbursed
      ? "Le total des décaissements atteint 100 % de l'octroi"
      : "";
  // REPORT

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Box sx={{ m: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mb: 2 }}>
        Retour aux projets
      </Button>

      {/* ------------------------------------------------
          EN-TÊTE
      ------------------------------------------------ */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: { sm: "flex-start" },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Convention n° {project.agreement_number} ·{" "}
            {formatDate(project.start_date)} → {formatDate(project.end_date)}
          </Typography>
        </Box>
        <Chip label={status.label} color={status.color} />
      </Stack>

      <Stack spacing={3}>
        {/* ------------------------------------------------
            INFORMATIONS GÉNÉRALES
        ------------------------------------------------ */}
        <Section title="Informations générales">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <InfoItem label="Description" value={project.description} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <InfoItem label="Début" value={formatDate(project.start_date)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <InfoItem label="Fin" value={formatDate(project.end_date)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <InfoItem label="Statut" value={status.label} />
            </Grid>
          </Grid>
        </Section>

        {/* ------------------------------------------------
            LOCALISATION
        ------------------------------------------------ */}
        <Section title="Localisation">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Région" value={project.region?.name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem
                label="District"
                value={
                  project.district
                    ? `${project.district.code ? `${project.district.code} – ` : ""}${project.district.name}`
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Commune" value={project.municipality?.name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoItem label="Paysage" value={project.landscape?.name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoItem
                label="Sous-paysage"
                value={project.sub_landscape?.name}
              />
            </Grid>
          </Grid>
        </Section>

        {/* ------------------------------------------------
            PARTENAIRES ET PLAN STRATÉGIQUE
        ------------------------------------------------ */}
        <Section title="Partenaires et plan stratégique">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoItem
                label="Partenaire d'appui"
                value={project.support_partner?.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoItem
                label="Organisation locale"
                value={project.local_organization?.name}
              />
            </Grid>

            {project.strategic_plan && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    label="Plan stratégique"
                    value={`${project.strategic_plan.name} (${project.strategic_plan.code})`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    label="Période du plan"
                    value={`${formatDate(project.strategic_plan.start_date)} → ${formatDate(
                      project.strategic_plan.end_date,
                    )}`}
                  />
                </Grid>
                {project.strategic_plan.description && (
                  <Grid size={{ xs: 12 }}>
                    <InfoItem
                      label="Description du plan"
                      value={project.strategic_plan.description}
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Section>

        {/* ------------------------------------------------
            THÉMATIQUES
        ------------------------------------------------ */}
        <Section title="Thématiques">
          {project.topics?.length ? (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              {project.topics.map((topic) => (
                <Chip key={topic.id} label={topic.name} variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: "text.secondary" }}>
              Aucune thématique
            </Typography>
          )}
        </Section>

        {/* ------------------------------------------------
            FINANCEMENT
        ------------------------------------------------ */}
        <Section
          title="Financement"
          subtitle="Fonds propres + cofinanceurs ne doivent pas dépasser le montant d'octroi."
        >
          {!grant && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucun octroi n'est enregistré pour ce projet.
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Kpi
                label="Montant d'octroi"
                value={grant ? money(grant.grant_amount) : "—"}
                hint={
                  grant?.grant_date
                    ? `Octroyé le ${formatDate(grant.grant_date)}`
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Kpi label="Fonds propres" value={formatCents(budget.own)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Kpi
                label="Cofinanceurs"
                value={formatCents(budget.coFunders)}
                hint={`${coFunders.length} cofinanceur${coFunders.length > 1 ? "s" : ""}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Kpi
                label="Solde"
                value={grant ? formatCents(budget.balance) : "—"}
                hint={exceeded ? "Dépasse l'octroi" : undefined}
                error={exceeded}
              />
            </Grid>
          </Grid>

          {budget.granted > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  height: 12,
                  borderRadius: 6,
                  overflow: "hidden",
                  bgcolor: "action.hover",
                }}
              >
                <Box
                  sx={{ width: `${pct(budget.own)}%`, bgcolor: "primary.main" }}
                />
                <Box
                  sx={{
                    width: `${Math.min(pct(budget.coFunders), 100 - pct(budget.own))}%`,
                    bgcolor: "secondary.main",
                  }}
                />
              </Box>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <LegendDot color="primary.main" label="Fonds propres" />
                <LegendDot color="secondary.main" label="Cofinanceurs" />
                <LegendDot color="action.hover" label="Solde" />
              </Stack>
            </Box>
          )}

          {exceeded && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Fonds propres + cofinanceurs dépassent l'octroi de{" "}
              {formatCents(-budget.balance)}.
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Cofinanceurs
          </Typography>

          {coFunders.length === 0 ? (
            <Typography sx={{ color: "text.secondary" }}>
              Aucun cofinanceur
            </Typography>
          ) : (
            <CommonTable>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Cofinanceur</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Montant
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Part de l'octroi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coFunders.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.co_funder_name}</TableCell>
                      <TableCell align="right">{money(row.amount)}</TableCell>
                      <TableCell align="right">
                        {budget.granted > 0
                          ? `${((toCents(row.amount) / budget.granted) * 100).toFixed(1)} %`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCents(budget.coFunders)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {budget.granted > 0
                        ? `${((budget.coFunders / budget.granted) * 100).toFixed(1)} %`
                        : "—"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CommonTable>
          )}

          <Divider sx={{ my: 3 }} />

          <InfoItem
            label="Contribution de l'organisation (hors contrôle de l'octroi)"
            value={
              project.organization_contribution
                ? money(project.organization_contribution)
                : "—"
            }
          />
        </Section>

        {/* ------------------------------------------------
            CALENDRIER DU DÉCAISSEMENT
        ------------------------------------------------ */}
        <Section
          title="Calendrier du décaissement"
          subtitle={
            grant
              ? `Planifié : ${formatCents(disbursedCents)} sur ${money(grant.grant_amount)} (${disbursedPct.toFixed(2)} %)`
              : undefined
          }
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 2,
            }}
          >
            <Tooltip title={addDisabledReason}>
              {/* Le <span> permet d'afficher l'info-bulle sur un bouton désactivé */}
              <span>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={addDisabled}
                  onClick={() => openForm(null)}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#004D95",
                    "&:hover": {
                      bgcolor: "#00396F",
                    },
                  }}
                >
                  Ajouter un calendrier de décaissement
                </Button>
              </span>
            </Tooltip>
          </Box>

          {disbursement_schedules.length === 0 ? (
            <Typography sx={{ color: "text.secondary" }}>
              Aucun calendrier de décaissement
            </Typography>
          ) : (
            <CommonTable>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Référence</TableCell>
                    <TableCell align="right">Date du décaissement</TableCell>
                    <TableCell align="right">Montant du décaissement</TableCell>
                    <TableCell align="right">Pourcentage</TableCell>
                    <TableCell align="right">Date d'envoi rapport</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {disbursement_schedules.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        {row.reference}
                      </TableCell>
                      <TableCell align="right">
                        {formatDate(row.disbursement_month)}
                      </TableCell>
                      <TableCell align="right">
                        {money(row.disbursement_amount)}
                      </TableCell>
                      <TableCell align="right">{row.percentage} %</TableCell>
                      <TableCell align="right">
                        {formatDate(row.report_submission_date)}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Ajouter des activités">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/disbursement-schedules/${row.id}`)
                            }
                          >
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Voir ou compléter le rapport">
                          <span>
                            <IconButton size="small">
                              <DescriptionOutlinedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600 }}
                      colSpan={2}
                    >
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCents(disbursedCents)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {disbursedPct.toFixed(2)} %
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CommonTable>
          )}
        </Section>
      </Stack>

      {formOpen && (
        <CreateDisbursementScheduleFormDialog
          disbursementSchedule={selected}
          projectId={project.id}
          grantAmount={grantAmount}
          alreadyDisbursed={alreadyDisbursed}
          onClose={() => setFormOpen(false)}
          onSaved={refetch}
        />
      )}
    </Box>
  );
}
