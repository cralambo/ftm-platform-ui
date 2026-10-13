import type { JSX } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";

const App = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default App;
