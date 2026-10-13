import type { JSX } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "@/theme";
import Layout from "@/layouts/Layout";
import RegionList from "@/pages/region/RegionList";
import ProtectedRoute from "./ProtectedRoute";
import Login from "@/features/Auth/Login";
import DistrictList from "@/pages/district/DistrictList";
import MunicipalityList from "@/pages/municipality/MunicipalityList";
import LandscapeList from "@/pages/landscape/LandscapeList";
import SubLandscapeList from "@/pages/subLandscape/subLandscapeList";
import StrategicPlanList from "@/pages/strategicPlan/StrategicPlanList";
import BoardMemberList from "@/pages/boardMember/BoardMemberList";
import DepartmentList from "@/pages/department/DepartmentList";
import PositionList from "@/pages/position/PositionList";
import EmployeeList from "@/pages/employee/EmployeeList";
import LocalOrganizationList from "@/pages/organization/LocalOrganizationList";
import SupportPartnerList from "@/pages/partner/SupportPartnerList";
import PartnerContactList from "@/pages/partnerContact/PartnerContactList";
import CoFunderList from "@/pages/coFunder/CoFunderList";
import TopicList from "@/pages/topic/TopicList";
import ProjectList from "@/pages/project/ProjectList";
import CreateProject from "@/features/project/CreateProject";
import Home from "@/features/home/Home";
import RoleList from "@/pages/role/RoleList";
import ProjectDetail from "@/features/project/ProjectDetail";

const AdminRoutes = (): JSX.Element => {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* PUBLIC */}
          <Route path="/login" element={<Login />} />

          {/* PROTÉGÉ */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/regions" element={<RegionList />} />
              <Route path="/districts" element={<DistrictList />} />
              <Route path="/municipalities" element={<MunicipalityList />} />
              <Route path="/landscapes" element={<LandscapeList />} />
              <Route path="/sub-landscapes" element={<SubLandscapeList />} />
              <Route path="/strategic-plans" element={<StrategicPlanList />} />
              <Route path="/board-members" element={<BoardMemberList />} />
              <Route path="/departments" element={<DepartmentList />} />
              <Route path="/positions" element={<PositionList />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route
                path="/organizations"
                element={<LocalOrganizationList />}
              />
              <Route path="/partners" element={<SupportPartnerList />} />
              <Route
                path="/partner-contacts"
                element={<PartnerContactList />}
              />
              <Route path="/co-funders" element={<CoFunderList />} />
              <Route path="/topics" element={<TopicList />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/create" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />

              <Route path="/security/roles" element={<RoleList />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default AdminRoutes;
