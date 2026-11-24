import { useRef, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadIcon from "@mui/icons-material/Download";

import {
  useGetTechnicalAttachmentsQuery,
  useUploadTechnicalAttachmentMutation,
  useDeleteReportAttachmentMutation,
  useDownloadReportAttachmentMutation,
} from "@/features/report/reportAttachmentApi";
import CommonBlueButton from "@/components/common/CommonBlueButton";

interface Props {
  reportId: string;
  technicalItemId: string;
  readOnly?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_NAME_LENGTH = 150;

export default function TechnicalActivityAttachments({
  reportId,
  technicalItemId,
  readOnly = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: attachments = [],
    isLoading,
    isError,
  } = useGetTechnicalAttachmentsQuery({
    reportId,
    technicalItemId,
  });

  const [upload, { isLoading: uploading }] =
    useUploadTechnicalAttachmentMutation();

  const [removeAttachment, { isLoading: deleting }] =
    useDeleteReportAttachmentMutation();

  const [downloadAttachment, { isLoading: downloading }] =
    useDownloadReportAttachmentMutation();

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
    setName("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setDialogOpen(true);
  };

  const handleUpload = async () => {
    setError(null);

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
      setError("Le fichier est vide.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("La taille maximale autorisée est de 50 Mio.");
      return;
    }

    try {
      await upload({
        reportId,
        technicalItemId,
        file: selectedFile,
        name: trimmedName,
      }).unwrap();

      resetDialog();
    } catch {
      setError("Échec de l'envoi du fichier. Veuillez réessayer.");
    }
  };

  const handleDownload = async (attachmentId: string, filename: string) => {
    setError(null);

    try {
      const blob = await downloadAttachment({
        reportId,
        attachmentId,
      }).unwrap();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Impossible de télécharger ce fichier.");
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm("Supprimer cette pièce jointe ?")) {
      return;
    }

    setError(null);

    try {
      await removeAttachment({
        reportId,
        attachmentId,
        technicalItemId,
      }).unwrap();
    } catch {
      setError("Impossible de supprimer cette pièce jointe.");
    }
  };

  if (isLoading) {
    return <CircularProgress size={18} />;
  }

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {error && !dialogOpen && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!readOnly && (
        <CommonBlueButton
          size="small"
          variant="outlined"
          startIcon={<AttachFileIcon />}
          disabled={uploading || deleting}
          onClick={handleOpenDialog}
        >
          Joindre un fichier
        </CommonBlueButton>
      )}

      {isError && (
        <Alert severity="error">
          Impossible de charger les pièces jointes.
        </Alert>
      )}

      {attachments.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          Aucune pièce jointe.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {attachments.map((attachment) => {
            const originalFilename = attachment.original_filename;
            const lastDotIndex = originalFilename.lastIndexOf(".");

            const extension =
              lastDotIndex > 0 && lastDotIndex < originalFilename.length - 1
                ? originalFilename.slice(lastDotIndex + 1).toLowerCase()
                : "";

            const designation = attachment.name?.trim() || originalFilename;

            const displayName = extension
              ? `${designation}(${extension})`
              : designation;

            return (
              <Stack
                key={attachment.id}
                direction="row"
                sx={{
                  minWidth: 0,
                  py: 0.5,
                  spacing: 1,
                  alignItems: "center",
                }}
              >
                <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
                  <Typography
                    variant="body2"
                    title={displayName}
                    sx={{
                      overflowWrap: "anywhere",
                      fontWeight: 600,
                    }}
                  >
                    {displayName}
                  </Typography>
                </Stack>

                <IconButton
                  size="small"
                  aria-label={`Télécharger ${displayName}`}
                  title="Télécharger"
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

                {!readOnly && (
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Supprimer ${displayName}`}
                    title="Supprimer"
                    disabled={deleting || uploading}
                    onClick={() => void handleDelete(attachment.id)}
                  >
                    {deleting ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DeleteOutlineIcon fontSize="small" />
                    )}
                  </IconButton>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}

      {!readOnly && (
        <Dialog
          open={dialogOpen}
          onClose={() => {
            if (!uploading) {
              resetDialog();
            }
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Ajouter un justificatif technique</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Désignation du justificatif"
                placeholder="Ex. : Rapport d'activité, Photo terrain..."
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                fullWidth
                disabled={uploading}
                slotProps={{
                  htmlInput: {
                    maxLength: MAX_NAME_LENGTH,
                  },
                }}
                helperText={`${name.length}/${MAX_NAME_LENGTH} caractères`}
              />

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Sélectionner un fichier
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;

                      setError(null);
                      setSelectedFile(null);

                      if (!file) {
                        return;
                      }

                      if (file.size === 0) {
                        setError("Le fichier est vide.");
                        event.target.value = "";
                        return;
                      }

                      if (file.size > MAX_FILE_SIZE) {
                        setError("La taille maximale autorisée est de 50 Mio.");
                        event.target.value = "";
                        return;
                      }

                      setSelectedFile(file);
                    }}
                  />

                  {selectedFile && (
                    <BoxFileInfo
                      filename={selectedFile.name}
                      size={selectedFile.size}
                    />
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Taille maximale : 50 Mio.
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={resetDialog} disabled={uploading} color="inherit">
              Annuler
            </Button>

            <Button
              variant="contained"
              onClick={() => void handleUpload()}
              disabled={
                uploading ||
                !name.trim() ||
                !selectedFile ||
                selectedFile.size === 0 ||
                selectedFile.size > MAX_FILE_SIZE
              }
              startIcon={
                uploading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AttachFileIcon />
                )
              }
            >
              {uploading ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}

function BoxFileInfo({ filename, size }: { filename: string; size: number }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
        <strong>Fichier :</strong> {filename}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Taille : {(size / (1024 * 1024)).toFixed(2)} Mio
      </Typography>
    </Stack>
  );
}
