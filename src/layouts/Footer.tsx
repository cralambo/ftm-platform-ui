import { Box, Typography, useTheme } from "@mui/material";
import type { JSX } from "react/jsx-runtime";
import { tokens } from "../theme";

const Footer = (): JSX.Element => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        py: 1.5,
        textAlign: "center",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f0f0f0 !important"
            : colors.primary[600] + "!important",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        © {new Date().getFullYear()} Fondation Tany Meva
      </Typography>
    </Box>
  );
};

export default Footer;