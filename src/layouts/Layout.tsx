import { useTheme } from "@mui/material";
import type { JSX } from "react/jsx-runtime";
import { tokens } from "../theme";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import TopBar from "./TopBar";
import SideBar from "./SideBar";

const Layout = (): JSX.Element => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <div className="app">
      <SideBar />
      <div className="main">
        <TopBar />
        <div
          className="content"
          style={
            {
              "--scroll-thumb": colors.bluePrimary[600],
              "--scroll-thumb-hover": colors.bluePrimary[400],
              "--scroll-track":
                theme.palette.mode === "dark" ? colors.primary[500] : "#f0f0f0",
            } as React.CSSProperties
          }
        >
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
