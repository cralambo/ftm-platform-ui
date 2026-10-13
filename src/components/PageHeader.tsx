import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface Props {
  title: string;
  addLabel: string;
  onAdd: () => void;
}

export default function PageHeader({ title, addLabel, onAdd }: Props) {
  return (
    <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems:"center" }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>{title}</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>{addLabel}</Button>
    </Stack>
  );
}