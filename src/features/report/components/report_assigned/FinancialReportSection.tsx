import {
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

import type { FinancialReportItem } from "@/features/report/partnerReport.types";
import ReportDocumentsSection from "./ReportDocumentsSection";
import CommonTable from "@/components/common/CommonTable";
import CommonTableHead from "@/components/common/CommonTableHead";

interface Props {
  items: FinancialReportItem[];
}

const formatAmount = (value: string | number) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number(value)) + " Ar";

export default function FinancialReportSection({ items }: Props) {
  const total = items.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0,
  );

  return (
    <Stack spacing={2}>
      <CommonTable>
        <Table size="small">
          <CommonTableHead
            columns={[
              { label: "Désignation" },
              { label: "Quantité" },
              { label: "Prix unitaire" },
              { label: "Montant total" },
              { label: "Pièces justificatives" },
            ]}
          />
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                <TableCell sx={{ minWidth: 180 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.designation}
                  </Typography>

                  {item.observations && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {item.observations}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="right">{item.quantity}</TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {formatAmount(item.unit_amount)}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatAmount(item.total_amount)}
                  </Typography>
                </TableCell>

                <TableCell sx={{ minWidth: 220 }}>
                  {item.documents.length > 0 ? (
                    <ReportDocumentsSection documents={item.documents} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun document
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography sx={{ color: "text.secondary", py: 3 }}>
                    Aucune dépense enregistrée.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CommonTable>

      {/* Total des dépenses */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>Total des dépenses</Typography>

          <Typography
            variant="h6"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            {formatAmount(total)}
          </Typography>
        </Stack>
      </Paper>

      <Divider />
    </Stack>
  );
}
