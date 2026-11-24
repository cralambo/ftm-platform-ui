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
        permissions: ["projects.view"],
      },
      {
        id: "projects",
        title: "Projets",
        path: "/projects",
        icon: <ChevronRightOutlinedIcon />,
        userTypes: ["PARTNER_CONTACT", "EMPLOYEE", "ADMIN"],
        permissions: ["projects.view"],
      },
      {
        id: "submitted-reports",
        title: "Rapports soumis",
        path: "/reports/submitted",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["reports.submitted.view"],
      },
      {
        id: "assigned-reports",
        title: "Mes rapports",
        path: "/reports/assigned",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["reports.submitted.view"],
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
        permissions: ["employees.view"],
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
        permissions: ["regions.view"],
      },
      {
        id: "districts",
        title: "Districts",
        path: "/districts",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["districts.view"],
      },
      {
        id: "municipalities",
        title: "Communes",
        path: "/municipalities",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["municipalities.view"],
      },
      {
        id: "landscapes",
        title: "Paysages",
        path: "/landscapes",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["landscapes.view"],
      },
      {
        id: "subLandscapes",
        title: "Sous-paysages",
        path: "/sub-landscapes",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["sub_landscapes.view"],
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
        permissions: ["board_members.view"],
      },
      {
        id: "departments",
        title: "Départements",
        path: "/departments",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["departments.view"],
      },
      {
        id: "employees",
        title: "Employés",
        path: "/employees",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["employees.view"],
      },
      {
        id: "positions",
        title: "Fonctions employées",
        path: "/positions",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["positions.view"],
      },
      {
        id: "coFinancier",
        title: "Co-bailleurs",
        path: "/co-funders",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["co_funders.view"],
      },
      {
        id: "partners",
        title: "Partenaires",
        path: "/partners",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["partners.view"],
      },
      {
        id: "olc",
        title: "Organisations locales",
        path: "/organizations",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["organizations.view"],
      },
      {
        id: "partnerContacts",
        title: "Responsables partenaires",
        path: "/partner-contacts",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["partner_contacts.view"],
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
        permissions: ["strategic_plans.view"],
      },
      {
        id: "topic",
        title: "Thématiques",
        path: "/topics",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["topics.view"],
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
        permissions: ["users.view"],
      },
      {
        id: "roles",
        title: "Rôles",
        path: "/roles",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["roles.view"],
      },
      {
        id: "permissions",
        title: "Permissions",
        path: "/permissions",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["permissions.view"],
      },
      {
        id: "users",
        title: "Utilisateurs",
        path: "/users",
        icon: <ChevronRightOutlinedIcon />,
        permissions: ["users.view"],
      },
    ],
  },
];
