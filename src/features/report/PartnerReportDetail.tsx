import {
  Alert,
  Box,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useGetAssignedReportQuery } from "./partnerReportApi";
import TechnicalReportSection from "./components/report_assigned/TechnicalReportSection";
import FinancialReportSection from "./components/report_assigned/FinancialReportSection";
import ReportDocumentsSection from "./components/report_assigned/ReportDocumentsSection";
import CommonCard from "@/components/common/CommonCard";
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from "@/constants/labels";

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR");
};

const formatAmount = (amount: string) =>
  new Intl.NumberFormat("fr-FR").format(Number(amount)) + " Ar";

export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  UNDER_REVIEW: "En cours d'examen",
  RETURNED: "Retourné pour correction",
  IN_VALIDATION: "En cours de validation",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

export default function PartnerReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();

  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useGetAssignedReportQuery(reportId!, {
    skip: !reportId,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !report) {
    return (
      <Alert
        severity="error"
        action={<button onClick={() => refetch()}>Réessayer</button>}
      >
        Impossible de récupérer le rapport assigné.
      </Alert>
    );
  }

  const schedule = report.disbursement_schedule;
  const project = schedule.project;
  const partner = report.partner_contact;

  return (
    <Box sx={{ m: 3 }}>
      <Stack spacing={3}>
        {/* HEADER */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Consultation du rapport partenaire
            </Typography>

            <Typography color="text.secondary">
              Référence : {schedule.reference}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={getProjectStatusLabel(project.status)}
            color={getProjectStatusColor(project.status)}
            variant="outlined"
          />
        </Stack>

        {/* PROJECT INFORMATION */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informations du projet
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Intitulé du projet
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {project.title}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Convention
                </Typography>
                <Typography>{project.agreement_number}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Statut
                </Typography>
                <Typography>{project.status}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Date de début
                </Typography>
                <Typography>{formatDate(project.start_date)}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Date de fin
                </Typography>
                <Typography>{formatDate(project.end_date)}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Montant de la subvention
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {project.granted_project
                    ? formatAmount(project.granted_project.grant_amount)
                    : "-"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CommonCard>

        {/* PARTNER INFORMATION */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informations du partenaire
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Partenaire
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {partner.supportPartner.name}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Responsable
                </Typography>
                <Typography>
                  {partner.firstname} {partner.lastname}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography>{partner.email}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Téléphone
                </Typography>
                <Typography>{partner.phone}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CommonCard>

        {/* DISBURSEMENT INFORMATION */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informations du décaissement
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Référence
                </Typography>
                <Typography>{schedule.reference}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Montant décaissé
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {formatAmount(schedule.disbursement_amount)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Pourcentage
                </Typography>
                <Typography>{schedule.percentage} %</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Date de décaissement
                </Typography>
                <Typography>
                  {formatDate(schedule.disbursement_month)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Date limite du rapport
                </Typography>
                <Typography>
                  {formatDate(schedule.report_submission_date)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CommonCard>

        {/* GENERAL COMMENTS */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Commentaires généraux
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {report.general_comments || "Aucun commentaire."}
            </Typography>
          </CardContent>
        </CommonCard>

        {/* TECHNICAL REPORT */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rapport technique
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <TechnicalReportSection items={report.technical_report} />
          </CardContent>
        </CommonCard>

        {/* FINANCIAL REPORT */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rapport financier
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <FinancialReportSection items={report.financial_report} />
          </CardContent>
        </CommonCard>

        {/* GENERAL DOCUMENTS */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Documents complémentaires
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <ReportDocumentsSection documents={report.documents} />
          </CardContent>
        </CommonCard>

        {/* ASSIGNMENT INFORMATION */}
        <CommonCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informations de validation
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Assigné à
                </Typography>
                <Typography>{report.assigned_to || "-"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Date d'assignation
                </Typography>
                <Typography>{formatDate(report.assigned_at)}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Date de soumission
                </Typography>
                <Typography>{formatDate(report.submitted_at)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CommonCard>
      </Stack>
    </Box>
  );
}
