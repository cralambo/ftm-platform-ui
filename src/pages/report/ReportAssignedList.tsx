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
import { useGetAssignedPartnerReportsQuery } from "@/features/report/partnerReportApi";
import { formatDate } from "@/utils/date";
import { useNavigate } from "react-router-dom";

export default function ReportAssignedList() {
  const { page, size, setPage, changeSize } = usePagination();
  const navigate = useNavigate();
  const { data, isFetching, isError, refetch } =
    useGetAssignedPartnerReportsQuery({
      page,
      size,
    });
  const handleView = (reportId: string) => {
    navigate(`/partner-reports/${reportId}/assigned`);
  };
  const assignedReports = data?.content ?? [];
  return (
    <>
      <Box sx={{ m: 3 }}>
        <PageHeader title="Mes rapports à traité" />

        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button onClick={refetch}>Réessayer</Button>}
          >
            Impossible de charger les rapports assigné à moi
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
                  { label: "Assigné le" },
                  { label: "Actions", align: "right", width: 100 },
                ]}
              />
              <TableBody>
                {assignedReports.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Aucun rapport soumis
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {assignedReports.map((report) => (
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
                    <TableCell>
                      {report.assigned_at
                        ? formatDate(report.assigned_at)
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Afficher detail">
                        <IconButton
                          size="small"
                          onClick={() => handleView(report.id)}
                        >
                          <LoupeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assigner à moi">
                        <IconButton size="small">
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
