import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
import type { ReportAttachment } from "../../partnerReport.types";
import { useGetAttachmentContentQuery } from "../../partnerReportApi";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
  attachment: ReportAttachment | null;
  open: boolean;
  onClose: () => void;
}

type DocumentType = "pdf" | "image" | "word" | "excel" | "unsupported";

function getDocumentType(filename: string): DocumentType {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension ?? "")) {
    return "image";
  }

  if (["docx"].includes(extension ?? "")) return "word";

  if (["xlsx", "xls"].includes(extension ?? "")) return "excel";

  return "unsupported";
}

function WordPreview({ file }: { file: Blob }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    container.innerHTML = "";

    renderAsync(file, container, undefined, {
      className: "docx-preview",
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
    }).catch(() => {
      if (!cancelled) setError(true);
    });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [file]);

  if (error) {
    return (
      <Alert severity="error">Impossible de visualiser ce document Word.</Alert>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        backgroundColor: "#eee",
        p: 2,
        minHeight: 500,
        overflow: "auto",
        "& .docx-wrapper": { padding: 2 },
      }}
    />
  );
}

function ExcelPreview({ file }: { file: Blob }) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [rows, setRows] = useState<unknown[][]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkbook() {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        if (cancelled) return;

        setSheets(workbook.SheetNames);
        setActiveSheet(workbook.SheetNames[0] ?? "");
      } catch {
        if (!cancelled) setError(true);
      }
    }

    loadWorkbook();

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    if (!activeSheet) return;

    async function loadSheet() {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const worksheet = workbook.Sheets[activeSheet];

        if (worksheet) {
          setRows(
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: "",
            }) as unknown[][],
          );
        }
      } catch {
        setError(true);
      }
    }

    loadSheet();
  }, [activeSheet, file]);

  if (error) {
    return <Alert severity="error">Impossible de lire ce fichier Excel.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        {sheets.map((sheet) => (
          <Button
            key={sheet}
            size="small"
            variant={activeSheet === sheet ? "contained" : "outlined"}
            onClick={() => setActiveSheet(sheet)}
          >
            {sheet}
          </Button>
        ))}
      </Stack>

      <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
        <Table size="small" stickyHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{String(cell ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export default function DocumentViewer({ attachment, open, onClose }: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const {
    data: file,
    isLoading,
    isError,
  } = useGetAttachmentContentQuery(attachment?.id ?? "", {
    skip: !open || !attachment,
  });

  const filename = attachment?.original_filename ?? attachment?.name ?? "";
  const type = useMemo(() => getDocumentType(filename), [filename]);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    setPageNumber(1);
    setNumPages(0);
  }, [attachment?.id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" fullScreen>
      <DialogTitle>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{filename}</Typography>
            <Typography variant="caption" color="text.secondary">
              {attachment?.content_type}
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && (
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
            }}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Chargement du document...</Typography>
          </Stack>
        )}

        {isError && (
          <Alert severity="error">
            Impossible de récupérer le document. Vérifiez vos autorisations.
          </Alert>
        )}

        {file && !isLoading && (
          <>
            {type === "pdf" && fileUrl && (
              <Stack sx={{ alignItems: "center", spacing: 2 }}>
                <Stack
                  sx={{ direction: "row", alignItems: "center", spacing: 2 }}
                >
                  <Button
                    startIcon={<NavigateBeforeIcon />}
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => p - 1)}
                  >
                    Précédent
                  </Button>

                  <Typography>
                    Page {pageNumber} / {numPages || "..."}
                  </Typography>

                  <Button
                    endIcon={<NavigateNextIcon />}
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </Stack>

                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<CircularProgress />}
                  error={
                    <Alert severity="error">Erreur de lecture du PDF.</Alert>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer
                    renderAnnotationLayer
                    width={Math.min(window.innerWidth - 80, 1000)}
                  />
                </Document>
              </Stack>
            )}

            {type === "image" && fileUrl && (
              <Box sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src={fileUrl}
                  alt={filename}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            {type === "word" && <WordPreview file={file} />}

            {type === "excel" && <ExcelPreview file={file} />}

            {type === "unsupported" && (
              <Alert severity="warning">
                Ce format de fichier ne peut pas être visualisé directement.
                Veuillez télécharger le document.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
