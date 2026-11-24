import { useRef, useState, type ChangeEvent } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
  useGetFinancialAttachmentsQuery,
  useUploadFinancialAttachmentMutation,
  useDeleteReportAttachmentMutation,
  useDownloadReportAttachmentMutation,
} from "@/features/report/reportAttachmentApi";
import CommonBlueButton from "@/components/common/CommonBlueButton";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Props {
  reportId: string;
  financialItemId: string;
  readOnly?: boolean;
}

interface ReportAttachment {
  id: string;
  name?: string | null;
  original_filename: string;
  file_size?: number | string;
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

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

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

export default function FinancialExpenseAttachments({
  reportId,
  financialItemId,
  readOnly = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  const {
    data: attachments = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetFinancialAttachmentsQuery({
    reportId,
    financialItemId,
  });

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const [upload, { isLoading: uploading }] =
    useUploadFinancialAttachmentMutation();

  const [removeAttachment, { isLoading: deleting }] =
    useDeleteReportAttachmentMutation();

  const [downloadAttachment, { isLoading: downloading }] =
    useDownloadReportAttachmentMutation();

  // ---------------------------------------------------------------------------
  // Dialog
  // ---------------------------------------------------------------------------

  const resetDialog = () => {
    setDialogOpen(false);
    setName("");
    setSelectedFile(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenDialog = () => {
    setError(null);
    setSuccess(null);
    setName("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setDialogOpen(true);
  };

  // ---------------------------------------------------------------------------
  // File selection
  // ---------------------------------------------------------------------------

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setError(null);
    setSelectedFile(null);

    if (!file) return;

    if (file.size === 0) {
      setError("Le fichier sélectionné est vide.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("La taille maximale autorisée est de 50 Mio.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    // Permet de sélectionner à nouveau le même fichier.
    event.target.value = "";
  };

  // ---------------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------------

  const handleUpload = async () => {
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Veuillez renseigner la désignation du justificatif.");
      return;
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(
        `La désignation ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`,
      );
      return;
    }

    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    if (selectedFile.size === 0) {
      setError("Le fichier sélectionné est vide.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("La taille maximale autorisée est de 50 Mio.");
      return;
    }

    try {
      await upload({
        reportId,
        financialItemId,
        file: selectedFile,
        name: trimmedName,
      }).unwrap();

      resetDialog();
      setSuccess("Pièce justificative ajoutée avec succès.");

      await refetch();
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    }
  };

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------

  const handleDownload = async (attachmentId: string, filename: string) => {
    setError(null);

    try {
      const blob = await downloadAttachment({
        reportId,
        attachmentId,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename || "document";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (downloadError) {
      setError(getErrorMessage(downloadError));
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async (attachmentId: string) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette pièce justificative ?",
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      await removeAttachment({
        reportId,
        attachmentId,
        financialItemId,
      }).unwrap();

      setSuccess("Pièce justificative supprimée avec succès.");

      await refetch();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <CircularProgress size={18} />;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      {/* General errors */}
      {error && !dialogOpen && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Add button */}
      {!readOnly && (
        <CommonBlueButton
          size="small"
          variant="outlined"
          startIcon={<AttachFileIcon />}
          disabled={uploading || deleting || !reportId || !financialItemId}
          onClick={handleOpenDialog}
        >
          Joindre un fichier
        </CommonBlueButton>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />

      {/* Empty state */}
      {attachments.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          {isFetching
            ? "Actualisation des fichiers..."
            : "Aucun fichier joint."}
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {attachments.map((attachment: ReportAttachment) => {
            const displayName = getDisplayName(attachment);
            const originalFilename = attachment.original_filename || "document";

            return (
              <Stack
                key={attachment.id}
                direction="row"
                sx={{
                  minWidth: 0,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 0.5,
                  spacing: 0.5,
                  alignItems: "center",
                }}
              >
                {/* Attachment information */}
                <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    title={displayName}
                    sx={{
                      overflowWrap: "anywhere",
                      fontWeight: 500,
                    }}
                  >
                    {displayName}
                  </Typography>
                </Stack>

                {/* Download */}
                <Tooltip title="Télécharger le justificatif">
                  <IconButton
                    size="small"
                    aria-label={`Télécharger ${displayName}`}
                    disabled={downloading}
                    onClick={() =>
                      void handleDownload(attachment.id, originalFilename)
                    }
                  >
                    {downloading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DownloadIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Delete */}
                {!readOnly && (
                  <Tooltip title="Supprimer le justificatif">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Supprimer ${displayName}`}
                        disabled={uploading || deleting}
                        onClick={() => void handleDelete(attachment.id)}
                      >
                        {deleting ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteOutlineIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* Upload dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!uploading) resetDialog();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajouter une pièce justificative</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Designation */}
            <TextField
              label="Désignation du justificatif"
              placeholder="Ex. : Facture d'achat de matériel"
              value={name}
              onChange={(event) => setName(event.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: MAX_NAME_LENGTH,
                },
              }}
              helperText={`${name.length}/${MAX_NAME_LENGTH} caractères`}
              required
              fullWidth
              disabled={uploading}
            />

            {/* File selection */}
            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choisir un fichier
            </Button>

            {selectedFile && (
              <Alert severity="info">
                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                  <strong>Fichier :</strong> {selectedFile.name}
                </Typography>

                <Typography variant="caption">
                  Taille : {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mio
                </Typography>
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary">
              Taille maximale : 50 Mio.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={resetDialog} disabled={uploading}>
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleUpload()}
            disabled={uploading || !name.trim() || !selectedFile}
            startIcon={
              uploading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AttachFileIcon />
              )
            }
          >
            {uploading ? "Envoi..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
