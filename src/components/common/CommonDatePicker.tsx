import { useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { DateView } from "@mui/x-date-pickers/models";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { tokens } from "@/theme";

interface CommonDatePickerProps {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  format?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  views?: DateView[];
}

export default function CommonDatePicker({
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText = " ",
  name,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  format = "DD/MM/YYYY",
  fullWidth = true,
  size = "small",
  views,
}: CommonDatePickerProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dateValue = value && dayjs(value).isValid() ? dayjs(value) : null;

  return (
    <DatePicker
      label={label}
      format={format}
      value={dateValue}
      onChange={(newValue: Dayjs | null) => {
        onChange(
          newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "",
        );
      }}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      views={views}
      slotProps={{
        textField: {
          name,
          fullWidth,
          size,
          required,
          disabled,
          error,
          helperText,
          onBlur,
        },
        popper: {
          sx: {
            "& .MuiPaper-root": {
              bgcolor:
                theme.palette.mode === "dark" ? colors.primary[600] : "#ffffff",
              color: theme.palette.text.primary,
            },
          },
        },
        day: {
          sx: {
            color: theme.palette.text.primary,

            "&.Mui-selected": {
              bgcolor: `${colors.bluePrimary[600]} !important`,
              color: "#ffffff !important",
            },

            "&.Mui-selected:hover": {
              bgcolor: `${colors.bluePrimary[700]} !important`,
            },

            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? colors.bluePrimary[800]
                  : colors.bluePrimary[100],
            },

            "&.MuiPickersDay-today": {
              borderColor: colors.bluePrimary[600],
            },
          },
        },
        calendarHeader: {
          sx: {
            color: theme.palette.text.primary,
          },
        },
      }}
    />
  );
}
