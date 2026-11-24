import { useState } from "react";
import { Stack, Tooltip } from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

import type { ReportAttachment } from "@/features/report/partnerReport.types";
import DocumentViewer from "./DocumentViewer";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";

interface Props {
  document: ReportAttachment;
}

export default function ReportDocumentActions({ document }: Props) {
  const [openViewer, setOpenViewer] = useState(false);

  const handleDownload = async () => {
    try {
      // À remplacer par ton endpoint réel de téléchargement.
      const response = await fetch(
        `/api/v1/partner-reports/attachments/${document.id}/content`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de télécharger le document.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.original_filename || document.name;
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur de téléchargement :", error);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Tooltip title="Visualiser le document">
          <CommonGreyButton
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => setOpenViewer(true)}
          >
            Visualiser
          </CommonGreyButton>
        </Tooltip>

        <Tooltip title="Télécharger le document">
          <CommonBlueButton
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => void handleDownload()}
          >
            Télécharger
          </CommonBlueButton>
        </Tooltip>
      </Stack>

      <DocumentViewer
        attachment={document}
        open={openViewer}
        onClose={() => setOpenViewer(false)}
      />
    </>
  );
}
