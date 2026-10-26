import FolderIcon from "@mui/icons-material/Folder";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RoomPreferencesOutlinedIcon from "@mui/icons-material/RoomPreferencesOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CompostOutlinedIcon from "@mui/icons-material/CompostOutlined";
import type { MenuItemType } from "./menu.type";

export const menus: MenuItemType[] = [
  {
    id: "project",
    title: "Gestion des projets",
    icon: <FolderIcon />,
    userTypes: ["PARTNER_CONTACT", "BOARD_MEMBER", "EMPLOYEE", "ADMIN", "USER"],
    children: [
      {
        id: "dashboard-program",
        title: "Tableau de bord",
        path: "/security/roles",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "projects",
        title: "Projets",
        path: "/projects",
        icon: <ChevronRightOutlinedIcon />,
        userTypes: ["PARTNER_CONTACT", "EMPLOYEE", "ADMIN"],
      },
      {
        id: "submitted-reports",
        title: "Rapports soumis",
        path: "/reports/submitted",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "completed-memo",
        title: "Rapports validé",
        path: "/memorandums/completed",
        icon: <ChevronRightOutlinedIcon />,
      },
    ],
  },
  {
    id: "admin",
    title: "Administration",
    icon: <AdminPanelSettingsOutlinedIcon />,
    children: [
      {
        id: "users",
        title: "Employés",
        path: "/employees/list",
        icon: <ChevronRightOutlinedIcon />,
      },
    ],
  },
  {
    id: "location",
    title: "Localisation",
    icon: <LocationOnOutlinedIcon />,

    children: [
      {
        id: "regions",
        title: "Régions",
        path: "/regions",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["region.view"],
      },

      {
        id: "districts",
        title: "Districts",
        path: "/districts",
        icon: <ChevronRightOutlinedIcon />,
      },

      {
        id: "municipalities",
        title: "Communes",
        path: "/municipalities",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "landscapes",
        title: "Paysages",
        path: "/landscapes",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "subLandscapes",
        title: "Sous-paysages",
        path: "/sub-landscapes",
        icon: <ChevronRightOutlinedIcon />,
      },
    ],
  },
  {
    id: "organization",
    title: "Organisations",
    icon: <CompostOutlinedIcon />,

    children: [
      {
        id: "boardMember",
        title: "Conseil d'administration",
        path: "/board-members",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "departments",
        title: "Départements",
        path: "/departments",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "employees",
        title: "Employés",
        path: "/employees",
        icon: <ChevronRightOutlinedIcon />,
      },

      {
        id: "positions",
        title: "Fonction employées",
        path: "/positions",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "coFinancier",
        title: "Co-bailleurs",
        path: "/co-funders",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "partners",
        title: "Partenaires",
        path: "/partners",
        icon: <ChevronRightOutlinedIcon />,
      },

      {
        id: "olc",
        title: "Organisation locales",
        path: "/organizations",
        icon: <ChevronRightOutlinedIcon />,
      },

      {
        id: "partnerContacts",
        title: "Responsable partenaires",
        path: "/partner-contacts",
        icon: <ChevronRightOutlinedIcon />,
      },
    ],
  },
  {
    id: "referential",
    title: "Référentiels",
    icon: <RoomPreferencesOutlinedIcon />,

    children: [
      {
        id: "strategicPlan",
        title: "Plan stratégique",
        path: "/strategic-plans",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "topic",
        title: "Thématiques",
        path: "/topics",
        icon: <ChevronRightOutlinedIcon />,
      },
    ],
  },
  {
    id: "security",
    title: "Paramètres",
    icon: <SecurityIcon />,

    children: [
      {
        id: "users_dashboard",
        title: "Tableau de bord",
        path: "/security/dashboard",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "roles",
        title: "Rôles",
        path: "/security/roles",
        icon: <ChevronRightOutlinedIcon />,
      },

      {
        id: "permissions",
        title: "Permissions",
        path: "/security/permissions",
        icon: <ChevronRightOutlinedIcon />,
      },
      {
        id: "users",
        title: "Utilisateurs",
        icon: <ChevronRightOutlinedIcon />,
        children: [
          {
            id: "user_assign_role",
            title: "Assigner un role",
            path: "/security/user-roles",
            icon: <ChevronRightOutlinedIcon />,
          },
          {
            id: "user_assign_permissions",
            title: "Assigner des permissions",
            path: "/users",
            icon: <ChevronRightOutlinedIcon />,
          },
        ],
      },
    ],
  },
];
