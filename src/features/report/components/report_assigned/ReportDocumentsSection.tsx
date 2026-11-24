import {
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import type { ReportAttachment } from "@/features/report/partnerReport.types";
import ReportDocumentActions from "./ReportDocumentActions";

interface Props {
  documents: ReportAttachment[];
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  OFFICIAL_LETTER: "Lettre officielle",
  OTHER: "Autre document",
  TECHNICAL_SUPPORT: "Rapport technique",
  FINANCIAL_SUPPORT: "Rapport financier",
  CONTRACT: "Contrat",
  REQUEST_FOR_NEXT_DISBURSEMENT: "Demande de prochain décaissement",
};

export default function ReportDocumentsSection({ documents }: Props) {
  if (!documents?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun document disponible.
      </Typography>
    );
  }

  const getDocumentTypeLabel = (type: string) =>
    DOCUMENT_TYPE_LABELS[type] ?? type;

  const formatSize = (size: number) =>
    size >= 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(2)} MB`
      : `${(size / 1024).toFixed(2)} KB`;

  return (
    <List disablePadding>
      {documents.map((document) => (
        <ListItem key={document.id} divider disableGutters sx={{ gap: 2 }}>
          <AttachFileIcon color="action" />

          <ListItemText
            sx={{ minWidth: 0 }}
            primary={document.name}
            secondary={
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", alignItems: "center" }}
              >
                <Typography variant="caption">
                  {document.original_filename}
                </Typography>

                <Typography variant="caption">
                  {formatSize(document.file_size)}
                </Typography>
              </Stack>
            }
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            {document.document_type && (
              <Chip
                size="small"
                label={getDocumentTypeLabel(document.document_type)}
                variant="outlined"
              />
            )}

            <ReportDocumentActions document={document} />
          </Stack>
        </ListItem>
      ))}
    </List>
  );
}
