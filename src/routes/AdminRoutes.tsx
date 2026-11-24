import type { JSX } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "@/theme";

import Layout from "@/layouts/Layout";
import ProtectedRoute from "./ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";

// Authentification
import Login from "@/features/Auth/Login";

// Accueil et profil
import Home from "@/features/home/Home";
import MyProfilePage from "@/features/user/MyProfilePage";

// Localisation
import RegionList from "@/pages/region/RegionList";
import DistrictList from "@/pages/district/DistrictList";
import MunicipalityList from "@/pages/municipality/MunicipalityList";
import LandscapeList from "@/pages/landscape/LandscapeList";
import SubLandscapeList from "@/pages/subLandscape/subLandscapeList";

// Référentiels
import StrategicPlanList from "@/pages/strategicPlan/StrategicPlanList";
import TopicList from "@/pages/topic/TopicList";

// Organisations
import BoardMemberList from "@/pages/boardMember/BoardMemberList";
import DepartmentList from "@/pages/department/DepartmentList";
import PositionList from "@/pages/position/PositionList";
import EmployeeList from "@/pages/employee/EmployeeList";
import LocalOrganizationList from "@/pages/organization/LocalOrganizationList";
import SupportPartnerList from "@/pages/partner/SupportPartnerList";
import PartnerContactList from "@/pages/partnerContact/PartnerContactList";
import CoFunderList from "@/pages/coFunder/CoFunderList";

// Projets
import ProjectList from "@/pages/project/ProjectList";
import CreateProject from "@/features/project/CreateProject";
import ProjectDetail from "@/features/project/ProjectDetail";

// Décaissements et rapports
import DisbursementScheduleDetail from "@/features/disbursement_schedules/DisbursementScheduleDetail";
import PartnerReportTreatment from "@/features/report/PartnerReportTreatment";

// Sécurité et administration
import RoleList from "@/pages/role/RoleList";
import PermissionList from "@/pages/permission/PermissionList";
import UserList from "@/pages/user/UserList";

// Accès refusé
import Unauthorized from "@/pages/unauthorized/Unauthorized";
import ReportSubmittedList from "@/pages/report/ReportSubmittedList";
import ReportAssignedList from "@/pages/report/ReportAssignedList";
import PartnerReportDetail from "@/features/report/PartnerReportDetail";

const AdminRoutes = (): JSX.Element => {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          {/* =====================================
              ROUTES PUBLIQUES
          ===================================== */}

          <Route path="/login" element={<Login />} />

          {/* =====================================
              ROUTES AUTHENTIFIÉES
              Un seul ProtectedRoute et un seul Layout
          ===================================== */}

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* ACCUEIL ET PROFIL */}

              <Route index element={<Navigate to="/home" replace />} />

              <Route path="/home" element={<Home />} />

              <Route path="/profile" element={<MyProfilePage />} />

              {/* =====================================
                  LOCALISATION
              ===================================== */}

              <Route
                element={<PermissionGuard permissions={["regions.view"]} />}
              >
                <Route path="/regions" element={<RegionList />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["districts.view"]} />}
              >
                <Route path="/districts" element={<DistrictList />} />
              </Route>

              <Route
                element={
                  <PermissionGuard permissions={["municipalities.view"]} />
                }
              >
                <Route path="/municipalities" element={<MunicipalityList />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["landscapes.view"]} />}
              >
                <Route path="/landscapes" element={<LandscapeList />} />
              </Route>

              <Route
                element={
                  <PermissionGuard permissions={["sub_landscapes.view"]} />
                }
              >
                <Route path="/sub-landscapes" element={<SubLandscapeList />} />
              </Route>

              {/* =====================================
                  RÉFÉRENTIELS
              ===================================== */}

              <Route
                element={
                  <PermissionGuard permissions={["strategic_plans.view"]} />
                }
              >
                <Route
                  path="/strategic-plans"
                  element={<StrategicPlanList />}
                />
              </Route>

              <Route
                element={<PermissionGuard permissions={["topics.view"]} />}
              >
                <Route path="/topics" element={<TopicList />} />
              </Route>

              {/* =====================================
                  ORGANISATIONS
              ===================================== */}

              <Route
                element={
                  <PermissionGuard permissions={["board_members.view"]} />
                }
              >
                <Route path="/board-members" element={<BoardMemberList />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["departments.view"]} />}
              >
                <Route path="/departments" element={<DepartmentList />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["positions.view"]} />}
              >
                <Route path="/positions" element={<PositionList />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["employees.view"]} />}
              >
                <Route path="/employees" element={<EmployeeList />} />
              </Route>

              <Route
                element={
                  <PermissionGuard permissions={["organizations.view"]} />
                }
              >
                <Route
                  path="/organizations"
                  element={<LocalOrganizationList />}
                />
              </Route>

              <Route
                element={<PermissionGuard permissions={["partners.view"]} />}
              >
                <Route path="/partners" element={<SupportPartnerList />} />
              </Route>

              <Route
                element={
                  <PermissionGuard permissions={["partner_contacts.view"]} />
                }
              >
                <Route
                  path="/partner-contacts"
                  element={<PartnerContactList />}
                />
              </Route>

              <Route
                element={<PermissionGuard permissions={["co_funders.view"]} />}
              >
                <Route path="/co-funders" element={<CoFunderList />} />
              </Route>

              {/* =====================================
                  PROJETS
              ===================================== */}

              <Route
                element={<PermissionGuard permissions={["projects.view"]} />}
              >
                <Route path="/projects" element={<ProjectList />} />

                <Route path="/projects/:id" element={<ProjectDetail />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["projects.create"]} />}
              >
                <Route path="/projects/create" element={<CreateProject />} />
              </Route>

              {/* =====================================
                  DÉCAISSEMENTS
              ===================================== */}

              <Route
                element={
                  <PermissionGuard
                    permissions={["disbursements.schedules.view"]}
                  />
                }
              >
                <Route
                  path="/disbursement-schedules/:id"
                  element={<DisbursementScheduleDetail />}
                />
              </Route>

              {/* =====================================
                  RAPPORTS
              ===================================== */}

              <Route
                element={<PermissionGuard permissions={["reports.create"]} />}
              >
                <Route
                  path="/partner-reports/:id"
                  element={<PartnerReportTreatment />}
                />
              </Route>

              <Route
                element={
                  <PermissionGuard permissions={["reports.submitted.view"]} />
                }
              >
                <Route
                  path="/reports/submitted"
                  element={<ReportSubmittedList />}
                />
                <Route
                  path="/reports/assigned"
                  element={<ReportAssignedList />}
                />
              </Route>

              <Route
                path="/partner-reports/:reportId/assigned"
                element={<PartnerReportDetail />}
              />

              {/* =====================================
                  SÉCURITÉ ET ADMINISTRATION
              ===================================== */}

              <Route element={<PermissionGuard permissions={["roles.view"]} />}>
                <Route path="/roles" element={<RoleList />} />
              </Route>

              <Route
                element={<PermissionGuard permissions={["permissions.view"]} />}
              >
                <Route path="/permissions" element={<PermissionList />} />
              </Route>

              <Route element={<PermissionGuard permissions={["users.view"]} />}>
                <Route path="/users" element={<UserList />} />
              </Route>

              {/* =====================================
                  ACCÈS REFUSÉ
              ===================================== */}

              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>
          </Route>

          {/* =====================================
              ROUTES INCONNUES
          ===================================== */}

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default AdminRoutes;
