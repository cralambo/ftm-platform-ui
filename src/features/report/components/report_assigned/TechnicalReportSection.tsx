import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

import type { TechnicalReportItem } from "@/features/report/partnerReport.types";
import ReportDocumentsSection from "./ReportDocumentsSection";
import CommonTable from "@/components/common/CommonTable";
import CommonTableHead from "@/components/common/CommonTableHead";

interface Props {
  items: TechnicalReportItem[];
}

export default function TechnicalReportSection({ items }: Props) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Rapport technique
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Résultats des activités réalisées et pièces justificatives associées.
        </Typography>
      </Box>

      <CommonTable>
        <Table size="small">
          <CommonTableHead
            columns={[
              { label: "N°" },
              { label: "Activité" },
              { label: "Quantité réalisée" },
              { label: "Description des résultats" },
              { label: "Observations" },
              { label: "Justificatifs" },
            ]}
          />
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.activity_name || `Activité ${index + 1}`}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.achieved_quantity ?? "-"} {item.unit ?? ""}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {item.result_description || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {item.observations || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1}>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={
                          item.documents.length > 0 ? "success" : "default"
                        }
                        label={`${item.documents.length} document(s)`}
                        sx={{ width: "fit-content" }}
                      />

                      {item.documents.length > 0 && (
                        <ReportDocumentsSection documents={item.documents} />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography sx={{ color: "text.secondary", py: 3 }}>
                    Aucun rapport technique disponible.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CommonTable>
    </Stack>
  );
}
