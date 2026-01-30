// SystemUser.js
import { Routes, Route } from "react-router-dom";
import SystemTable from "./systemTable";
import SystemForm from "./systemForm";

export const SystemUserRoutes = () => {
  return (
    <Routes>
    <Route index element={<SystemTable />} />
    <Route path="add" element={<SystemForm mode="add" />} />
    <Route path="edit/:id" element={<SystemForm mode="edit" />} />
  </Routes>
  
  );
};

export { SystemForm };
export default SystemUserRoutes;
