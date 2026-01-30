import { Outlet } from "react-router-dom";
import SettingSidebar from "../sidebar/SettingSidebar";

const SettingLayout = () => {
  return (
    <div className="flex h-full p-4 bg-gray-50 ">
      <SettingSidebar />
      <main className="flex-1 p-4  overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingLayout;
