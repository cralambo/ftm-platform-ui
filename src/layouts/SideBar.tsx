import { useMemo, useState } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import { tokens } from "../theme";
import type { MenuItemType } from "../menu/menu.type";

import { menus } from "@/menu/menu";
import { filterMenus } from "@/utils/filterMenus";
import { useAppSelector } from "@/app/hooks";

const SideBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  // UTILISATEUR CONNECTÉ
  const user = useAppSelector((state) => state.auth.user);

  // FILTRAGE DES MENUS SELON LES AUTORISATIONS
  const visibleMenus = useMemo(() => filterMenus(menus, user), [user]);

  // RENDU RÉCURSIF DES MENUS
  const renderMenu = (menu: MenuItemType): React.ReactNode => {
    if (menu.children?.length) {
      const children = menu.children
        .map(renderMenu)
        .filter((child): child is React.ReactElement => child !== null);

      if (children.length === 0) {
        return null;
      }

      return (
        <SubMenu key={menu.id} label={menu.title} icon={menu.icon}>
          {children}
        </SubMenu>
      );
    }

    if (!menu.path) {
      return null;
    }

    const isActive = location.pathname === menu.path;

    return (
      <MenuItem
        key={menu.id}
        icon={menu.icon}
        active={isActive}
        onClick={() => navigate(menu.path!)}
      >
        {menu.title}
      </MenuItem>
    );
  };

  // DESIGN
  return (
    <Box
      sx={{
        height: "100%",
        width: collapsed ? "80px" : "250px",
        minWidth: collapsed ? "80px" : "250px",
        flexShrink: 0,
        overflow: "hidden",

        "& .ps-sidebar-root": {
          border: "none !important",
          height: "100%",
          width: "100% !important",
          minWidth: "100% !important",
        },

        "& .ps-sidebar-container": {
          backgroundColor:
            theme.palette.mode === "light" ? "#f5f5f5" : colors.primary[600],
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        },

        "& .ps-menu-root": {
          backgroundColor: "transparent",
        },

        "& .ps-menu-button": {
          minHeight: "34px",
          fontSize: "0.75rem",
          color: theme.palette.mode === "light" ? "#333" : colors.grey[100],
          transition: "0.2s",
        },

        "& .ps-menu-button:hover": {
          backgroundColor:
            theme.palette.mode === "light"
              ? "#e6e6e6 !important"
              : "#2a2d3a !important",
          color: colors.bluePrimary[600],
        },

        "& .ps-menu-button.ps-active": {
          backgroundColor:
            theme.palette.mode === "light"
              ? "#dbe4ff !important"
              : "#1f2a40 !important",
          color: colors.bluePrimary[600],
        },

        "& .ps-menu-icon": {
          background: "transparent !important",
          minWidth: "24px",
        },

        "& .ps-submenu-content": {
          backgroundColor:
            theme.palette.mode === "light"
              ? "#f0f0f0 !important"
              : `${colors.primary[500]} !important`,
        },

        "& .ps-submenu-content .ps-menu-button": {
          paddingLeft: "20px !important",
          fontSize: "0.72rem",
        },

        "& .ps-submenu-root > .ps-menu-button": {
          fontWeight: 600,
        },
      }}
    >
      <Sidebar
        collapsed={collapsed}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* ========================================= */}
          {/* HEADER : FIXE EN HAUT */}
          {/* ========================================= */}

          <Menu>
            <MenuItem
              onClick={() => setCollapsed((previous) => !previous)}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      setCollapsed((previous) => !previous);
                    }}
                    size="small"
                    aria-label="Réduire ou développer le menu"
                  >
                    <MenuOutlinedIcon />
                  </IconButton>
                </Box>
              )}
            </MenuItem>
          </Menu>

          {/* ========================================= */}
          {/* NAVIGATION : ZONE SCROLLABLE */}
          {/* ========================================= */}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",

              scrollbarWidth: "thin",
              scrollbarColor: `${colors.bluePrimary[600]} transparent`,

              "&::-webkit-scrollbar": {
                width: "6px",
              },

              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: colors.bluePrimary[600],
                borderRadius: "10px",
              },

              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: colors.bluePrimary[400],
              },
            }}
          >
            <Menu>{visibleMenus.map(renderMenu)}</Menu>
          </Box>

          {/* ========================================= */}
          {/* USER INFO : FIXE EN BAS */}
          {/* ========================================= */}

          {!collapsed && user && (
            <Box
              sx={{
                flexShrink: 0,
                p: 2,
                textAlign: "center",
                backgroundColor: colors.bluePrimary[600],
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  overflowWrap: "anywhere",
                  color: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                {user.fullName || `${user.firstname} ${user.lastname}`}
              </Typography>
              {/* LOGO TANY MEVA */}
              <Box
                component="img"
                src="/images/logo.png"
                alt="Logo Tany Meva"
                sx={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "auto",
                  maxHeight: "80px",
                  objectFit: "contain",
                  mx: "auto",
                  display: "block",
                }}
              />
            </Box>
          )}
        </Box>
      </Sidebar>
    </Box>
  );
};

export default SideBar;
