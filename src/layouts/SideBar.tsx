import { useState } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { tokens } from "../theme";
import type { MenuItemType } from "../menu/menu.type";
import { menus } from "../menu/menu";


const SideBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();


  const [collapsed, setCollapsed] = useState(false);


  const renderMenu = (menu: MenuItemType): React.ReactNode => {

    if (menu.children?.length) {
      const children = menu.children.map(renderMenu).filter(Boolean);

      if (children.length === 0) return null;

      return (
        <SubMenu key={menu.id} label={menu.title} icon={menu.icon}>
          {children}
        </SubMenu>
      );
    }

    return (
      <MenuItem
        key={menu.id}
        icon={menu.icon}
        onClick={() => navigate(menu.path!)}
      >
        {menu.title}
      </MenuItem>
    );
  };

  return (
    <Box
      sx={{
        height: "100vh",
        position: "sticky",
        top: 0,

        "& .ps-sidebar-root": {
          border: "none !important",
          height: "100vh",
        },

        "& .ps-sidebar-container": {
          backgroundColor:
            theme.palette.mode === "light" ? "#f5f5f5" : colors.primary[600],
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
        },

        "& .ps-menu-root": {
          flex: 1,
          overflowY: "auto",
        },

        "& .ps-menu-button": {
          minHeight: "34px",
          borderRadius: "6px",
          margin: "3px 8px",
          fontSize: "0.75rem",
          color: theme.palette.mode === "light" ? "#333" : colors.grey[100],
          transition: "0.2s",
        },

        "& .ps-menu-button:hover": {
          backgroundColor:
            theme.palette.mode === "light"
              ? "#e6e6e6 !important"
              : "#2a2d3a !important",
          color: "#6870fa !important",
        },

        "& .ps-menu-button.ps-active": {
          backgroundColor:
            theme.palette.mode === "light"
              ? "#dbe4ff !important"
              : "#1f2a40 !important",
          color: "#6870fa !important",
        },

        "& .ps-menu-icon": {
          background: "transparent !important",
          minWidth: "24px",
        },

        "& .ps-submenu-content": {
          backgroundColor:
            theme.palette.mode === "light"
              ? "#f0f0f0 !important"
              : colors.primary[500] + " !important",
        },

        "& .ps-submenu-content .ps-menu-button": {
          paddingLeft: "20px !important",
          fontSize: "0.72rem",
        },

        "& .ps-submenu-root > .ps-menu-button": {
          fontWeight: 600,
        },

        "& .ps-sidebar-container::-webkit-scrollbar": {
          width: "6px",
        },

        "& .ps-sidebar-container::-webkit-scrollbar-thumb": {
          background: "#999",
          borderRadius: "10px",
        },
        "--scroll-thumb":
          theme.palette.mode === "dark"
            ? colors.blueAccent[600]
            : colors.blueAccent[400],

        "--scroll-thumb-hover":
          theme.palette.mode === "dark"
            ? colors.blueAccent[500]
            : colors.blueAccent[300],

        "--scroll-track":
          theme.palette.mode === "dark"
            ? colors.primary[500]
            : colors.grey[100],

        overflowY: "auto",

        "&::-webkit-scrollbar": {
          width: "8px",
        },

        "&::-webkit-scrollbar-track": {
          backgroundColor: "var(--scroll-track)",
          borderRadius: "8px",
        },

        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "var(--scroll-thumb)",
          borderRadius: "8px",
          border: "2px solid var(--scroll-track)",
        },

        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "var(--scroll-thumb-hover)",
        },

        /* Firefox */
        scrollbarWidth: "thin",
        scrollbarColor: "var(--scroll-thumb) var(--scroll-track)",
      }}
    >
      <Sidebar collapsed={collapsed}>
        <Menu>
          <MenuItem
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
            }}
          >
            {!collapsed && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  ml: 2,
                }}
              >
                <Typography
                  variant="h6"
                  color={
                    theme.palette.mode === "light"
                      ? "#2c3e50"
                      : colors.grey[100]
                  }
                  sx={{ fontWeight: 700 }}
                >
                  TANY MEVA
                </Typography>

                <IconButton
                  onClick={() => setCollapsed(!collapsed)}
                  size="small"
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {menus.map(renderMenu)}
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default SideBar;