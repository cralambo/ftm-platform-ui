import { useEffect, useState, type ChangeEvent } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import {
  useGetGeneralAttachmentsQuery,
  useUploadGeneralAttachmentMutation,
  useDownloadReportAttachmentMutation,
} from "@/features/report/reportAttachmentApi";

import CommonDialog from "@/components/common/CommonDialog";
import CommonBlueButton from "@/components/common/CommonBlueButton";
import { tokens } from "@/theme";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface GeneralReportAttachmentsProps {
  reportId: string;
  readOnly?: boolean;
  onRequiredDocumentsChange?: (isComplete: boolean) => void;
}

interface ReportAttachment {
  id: string;
  name?: string | null;
  original_filename: string;
  file_size: number | string;
  content_type?: string | null;
  document_type?: string | null;
  description?: string | null;
  uploaded_at?: string | null;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 1000;

const DOCUMENT_TYPES = [
  { value: "TECHNICAL_SUPPORT", label: "Justificatif technique" },
  { value: "FINANCIAL_SUPPORT", label: "Justificatif financier" },
  { value: "OFFICIAL_LETTER", label: "Lettre officielle" },
  { value: "CONTRACT", label: "Contrat" },
  {
    value: "REQUEST_FOR_NEXT_DISBURSEMENT",
    label: "Demande de prochain décaissement",
  },
  { value: "OTHER", label: "Autre document" },
] as const;

const REQUIRED_DOCUMENT_TYPES = [
  "TECHNICAL_SUPPORT",
  "FINANCIAL_SUPPORT",
  "OFFICIAL_LETTER",
  "CONTRACT",
  "REQUEST_FOR_NEXT_DISBURSEMENT",
] as const;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const formatFileSize = (size: number | string): string => {
  const bytes = Number(size);

  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Taille inconnue";
  }

  if (bytes < 1024) {
    return `${bytes} octets`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} Mio`;
};

const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
    return "";
  }

  return filename.slice(lastDotIndex + 1).toLowerCase();
};

const getDisplayName = (attachment: ReportAttachment): string => {
  const originalFilename = attachment.original_filename || "Document";
  const designation = attachment.name?.trim() || originalFilename;
  const extension = getFileExtension(originalFilename);

  return extension ? `${designation} - ${extension}` : designation;
};

const getDocumentLabel = (documentType?: string | null): string => {
  if (!documentType) return "Type non renseigné";

  return (
    DOCUMENT_TYPES.find((type) => type.value === documentType)?.label ??
    documentType
  );
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      data?: { message?: string };
      error?: string;
    };

    return (
      apiError.data?.message || apiError.error || "Une erreur est survenue."
    );
  }

  return "Une erreur est survenue.";
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function GeneralReportAttachments({
  reportId,
  readOnly = false,
  onRequiredDocumentsChange,
}: GeneralReportAttachmentsProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  const {
    data: attachments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetGeneralAttachmentsQuery({ reportId }, { skip: !reportId });

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadGeneralAttachmentMutation();

  const [downloadAttachment, { isLoading: isDownloading }] =
    useDownloadReportAttachmentMutation();

  // ---------------------------------------------------------------------------
  // Local states
  // ---------------------------------------------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<string>("OTHER");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [downloadError, setDownloadError] = useState("");

  // ---------------------------------------------------------------------------
  // Required documents validation
  // ---------------------------------------------------------------------------

  const uploadedDocumentTypes = new Set(
    attachments
      .map((attachment: ReportAttachment) => attachment.document_type)
      .filter((type): type is string => Boolean(type)),
  );

  const missingRequiredDocuments = REQUIRED_DOCUMENT_TYPES.filter(
    (type) => !uploadedDocumentTypes.has(type),
  );

  const hasAllRequiredDocuments = missingRequiredDocuments.length === 0;

  useEffect(() => {
    const isComplete =
      !isLoading && !isError && Boolean(reportId) && hasAllRequiredDocuments;

    onRequiredDocumentsChange?.(isComplete);
  }, [
    isLoading,
    isError,
    reportId,
    hasAllRequiredDocuments,
    onRequiredDocumentsChange,
  ]);

  // ---------------------------------------------------------------------------
  // Dialog
  // ---------------------------------------------------------------------------

  const resetForm = () => {
    setName("");
    setDocumentType("OTHER");
    setDescription("");
    setSelectedFile(null);
    setFormError("");
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isUploading) return;

    setDialogOpen(false);
    resetForm();
  };

  // ---------------------------------------------------------------------------
  // File selection
  // ---------------------------------------------------------------------------

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormError("");

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFormError("La taille du fichier ne doit pas dépasser 50 Mio.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (!name.trim()) {
      const filenameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setName(filenameWithoutExtension.slice(0, MAX_NAME_LENGTH));
    }

    // Permet de sélectionner à nouveau le même fichier.
    event.target.value = "";
  };

  // ---------------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------------

  const handleUpload = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setFormError("Veuillez saisir la désignation du document.");
      return;
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      setFormError(
        `La désignation ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`,
      );
      return;
    }

    if (!selectedFile) {
      setFormError("Veuillez sélectionner un fichier.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFormError("La taille du fichier ne doit pas dépasser 50 Mio.");
      return;
    }

    try {
      setFormError("");

      await uploadAttachment({
        reportId,
        file: selectedFile,
        name: trimmedName,
        documentType,
        description: trimmedDescription || undefined,
      }).unwrap();

      setDialogOpen(false);
      resetForm();

      await refetch();
    } catch (uploadError) {
      setFormError(getErrorMessage(uploadError));
    }
  };

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------

  const handleDownload = async (
    attachmentId: string,
    originalFilename: string,
  ) => {
    try {
      setDownloadError("");

      const blob = await downloadAttachment({
        reportId,
        attachmentId,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = originalFilename || "document";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (downloadError) {
      setDownloadError(getErrorMessage(downloadError));
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          mb: 2,
          justifyContent: "space-between",
          alignItems: "center",
          spacing: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Pièces jointes du rapport
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Documents justificatifs généraux du rapport.
          </Typography>
        </Box>

        {!readOnly && (
          <CommonBlueButton
            size="small"
            variant="contained"
            startIcon={<AttachFileIcon />}
            disabled={!reportId}
            onClick={handleOpenDialog}
          >
            Ajouter
          </CommonBlueButton>
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Required documents status */}
      {!isLoading && !isError && (
        <Alert
          severity={hasAllRequiredDocuments ? "success" : "warning"}
          sx={{ mb: 2 }}
        >
          {hasAllRequiredDocuments ? (
            "Tous les documents obligatoires sont présents."
          ) : (
            <>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Documents obligatoires manquants :
              </Typography>

              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
                {missingRequiredDocuments.map((type) => (
                  <li key={type}>{getDocumentLabel(type)}</li>
                ))}
              </Box>
            </>
          )}
        </Alert>
      )}

      {/* Download error */}
      {downloadError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setDownloadError("")}
        >
          {downloadError}
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 3,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      )}

      {/* Query error */}
      {isError && !isLoading && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Réessayer
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      )}

      {/* Empty state */}
      {!isLoading && !isError && attachments.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: "center",
            borderStyle: "dashed",
          }}
        >
          <AttachFileIcon
            sx={{
              fontSize: 36,
              color: "text.secondary",
              mb: 1,
            }}
          />

          <Typography variant="body2" color="text.secondary">
            Aucune pièce jointe pour le moment.
          </Typography>
        </Paper>
      )}

      {/* Attachments list */}
      {!isLoading && !isError && attachments.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            bgcolor:
              theme.palette.mode === "light" ? "#ffffff" : colors.primary[600],
            color: "text.primary",
          }}
        >
          {attachments.map((attachment: ReportAttachment, index: number) => {
            const displayName = getDisplayName(attachment);
            const originalFilename = attachment.original_filename || "document";

            return (
              <Box key={attachment.id}>
                <Stack
                  direction="row"
                  sx={{
                    p: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                    spacing: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      title={displayName}
                      sx={{
                        overflowWrap: "anywhere",
                        fontWeight: 600,
                      }}
                    >
                      Fichier : {displayName}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Type : {getDocumentLabel(attachment.document_type)}
                    </Typography>

                    {attachment.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Description : {attachment.description}
                      </Typography>
                    )}
                  </Box>

                  <IconButton
                    aria-label={`Télécharger ${displayName}`}
                    title="Télécharger"
                    disabled={isDownloading}
                    onClick={() =>
                      void handleDownload(attachment.id, originalFilename)
                    }
                    sx={{
                      backgroundColor: colors.bluePrimary[600],
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: colors.bluePrimary[700],
                        boxShadow: "none",
                      },
                    }}
                  >
                    {isDownloading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DownloadIcon />
                    )}
                  </IconButton>
                </Stack>

                {index < attachments.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Paper>
      )}

      {/* Upload dialog */}
      <CommonDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Ajouter une pièce jointe"
        maxWidth="sm"
        fullWidth
        disableClose={isUploading}
        contentSx={{ pt: 2 }}
        actions={
          <>
            <Button
              onClick={handleCloseDialog}
              disabled={isUploading}
              color="inherit"
            >
              Annuler
            </Button>

            <Button
              variant="contained"
              onClick={() => void handleUpload()}
              disabled={isUploading || !selectedFile || !name.trim()}
              startIcon={
                isUploading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <UploadFileIcon />
                )
              }
            >
              {isUploading ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </>
        }
      >
        <Stack spacing={2.5}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Désignation du document"
            placeholder="Ex. : Rapport technique, Facture..."
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{
              htmlInput: { maxLength: MAX_NAME_LENGTH },
            }}
            helperText={`${name.length}/${MAX_NAME_LENGTH} caractères`}
          />

          <TextField
            select
            label="Type de document"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
            fullWidth
          >
            {DOCUMENT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Description"
            placeholder="Informations complémentaires..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            slotProps={{
              htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH },
            }}
            helperText={`${description.length}/${MAX_DESCRIPTION_LENGTH} caractères`}
          />

          {/* File selection */}
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              Sélectionner un fichier
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            {selectedFile && (
              <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5 }}>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", spacing: 1 }}
                >
                  <AttachFileIcon color="action" />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ overflowWrap: "anywhere", fontWeight: 600 }}
                    >
                      {selectedFile.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    aria-label="Retirer le fichier"
                    onClick={() => setSelectedFile(null)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              </Paper>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Taille maximale autorisée : 50 Mio.
            </Typography>
          </Box>
        </Stack>
      </CommonDialog>
    </Box>
  );
}
