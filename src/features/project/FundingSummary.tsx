import {
  Alert,
  CardContent,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { computeBudget, formatCents } from "./budget";
import type { ProjectRequest } from "./project.types";
import CommonCard from "@/components/common/CommonCard";

function Line({
  label,
  value,
  bold,
  error,
}: {
  label: string;
  value: string;
  bold?: boolean;
  error?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
      <Typography sx={{ fontWeight: bold ? 600 : 400 }}>{label}</Typography>
      <Typography
        sx={{
          fontWeight: bold ? 600 : 400,
          color: error ? "error.main" : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function FundingSummary({ values }: { values: ProjectRequest }) {
  const b = computeBudget({
    own_funds: values.own_funds,
    grant_amount: values.granted_project?.grant_amount ?? "",
    co_funders: values.co_funders,
  });

  const exceeded = b.balance < 0;
  const ratio = b.granted > 0 ? Math.min(100, (b.funded / b.granted) * 100) : 0;

  return (
    <CommonCard>
      <CardContent>
        <Typography variant="h6">Récapitulatif du financement</Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Fonds propres + cofinanceurs ne doivent pas dépasser le montant
          d'octroi.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          <Line label="Montant d'octroi" value={formatCents(b.granted)} />
          <Line label="Fonds propres" value={formatCents(b.own)} />
          <Line
            label="Contribution des cofinanceurs"
            value={formatCents(b.coFunders)}
          />
          <Divider />
          <Line
            label="Solde"
            value={formatCents(b.balance)}
            bold
            error={exceeded}
          />
        </Stack>

        {b.granted > 0 && (
          <LinearProgress
            variant="determinate"
            value={ratio}
            color={exceeded ? "error" : "primary"}
            sx={{ mt: 2 }}
          />
        )}

        {exceeded && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Fonds propres + cofinanceurs dépassent l'octroi de{" "}
            {formatCents(-b.balance)}.
          </Alert>
        )}
      </CardContent>
    </CommonCard>
  );
}
