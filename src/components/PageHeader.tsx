import { Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonBlueButton from "./CommonBlueButton";

interface Props {
  title: string;
  addLabel?: string;
  onAdd?: () => void;
}

export default function PageHeader({ title, addLabel, onAdd }: Props) {
  const showAddButton = Boolean(addLabel && onAdd);

  return (
    <Stack
      direction="row"
      sx={{
        mb: 3,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      {showAddButton && (
        <CommonBlueButton
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          {addLabel}
        </CommonBlueButton>
      )}
    </Stack>
  );
}
