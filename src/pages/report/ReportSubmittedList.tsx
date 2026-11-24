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
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import LoupeIcon from "@mui/icons-material/Loupe";
import PageHeader from "@/components/PageHeader";
import { usePagination } from "@/hooks/usePagination";
import CommonTable from "@/components/common/CommonTable";
import CommonTablePagination from "@/components/CommonTablePagination";
import CommonTableHead from "@/components/common/CommonTableHead";
import {
  useAssignPartnerReportToMeMutation,
  useGetSubmittedPartnerReportsQuery,
} from "@/features/report/partnerReportApi";
import { formatDate } from "@/utils/date";

export default function ReportSubmittedList() {
  const { page, size, setPage, changeSize } = usePagination();
  const { data, isFetching, isError, refetch } =
    useGetSubmittedPartnerReportsQuery({
      page,
      size,
    });
  const submittedReports = data?.content ?? [];

  const [assignReport, { isLoading }] = useAssignPartnerReportToMeMutation();

  const handleAssign = async (reportId: string) => {
    try {
      await assignReport(reportId).unwrap();
      await refetch();
      // Notification de succès
    } catch (error) {
      // Notification d'erreur
    }
  };

  return (
    <>
      <Box sx={{ m: 3 }}>
        <PageHeader title="Rapports soumis" />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les rapports soumis
          </Alert>
        )}

        <Paper variant="outlined">
          <CommonTable>
            {isFetching && <LinearProgress />}
            <Table size="small">
              <CommonTableHead
                columns={[
                  { label: "Référence" },
                  { label: "Convention" },
                  { label: "Projet" },
                  { label: "Partenaire" },
                  { label: "Soumis par" },
                  { label: "Soumis le" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {submittedReports.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun rapport soumis
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {submittedReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      {report.disbursement_schedule.reference}
                    </TableCell>
                    <TableCell>
                      {report.disbursement_schedule.project.agreement_number}
                    </TableCell>
                    <TableCell>
                      {report.disbursement_schedule.project.title}
                    </TableCell>
                    <TableCell>
                      {report.partner_contact.supportPartner.name}
                    </TableCell>
                    <TableCell>
                      {[
                        report.partner_contact.firstname,
                        report.partner_contact.lastname,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </TableCell>
                    <TableCell>
                      {report.submitted_at
                        ? formatDate(report.submitted_at)
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Afficher detail">
                        <IconButton size="small">
                          <LoupeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assigner à moi">
                        <IconButton
                          size="small"
                          onClick={() => handleAssign(report.id)}
                          disabled={isLoading}
                        >
                          <AssignmentAddIcon />
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
      </Box>
    </>
  );
}
